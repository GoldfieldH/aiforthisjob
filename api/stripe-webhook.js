// POST /api/stripe-webhook  <- Stripe (checkout.session.completed from Payment Links).
// Verifies the signature on the raw body, works out which pack was bought, and emails the buyer a signed download link.
// Idempotent: the Resend Idempotency-Key is the Checkout Session id, so Stripe retries never send twice.
// 2xx for events we ignore; 5xx only for genuine failures so Stripe retries. Never logs emails or payloads.
import { packForStripeIds } from '../lib/packs.mjs';
import { DOWNLOAD_TTL_S, deliveryEmail, makeDownloadToken, readRawBody, verifyStripeSignature } from '../lib/delivery.mjs';

export const config = { api: { bodyParser: false } }; // we need the exact raw bytes for the signature check

const HANDLED = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

const configured = () => Boolean(process.env.STRIPE_WEBHOOK_SECRET && process.env.RESEND_API_KEY && process.env.DOWNLOAD_SECRET
  && (process.env.PACK_FROM || process.env.NEWSLETTER_FROM));

async function lineItemIds(sessionId) {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=10`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  });
  if (!r.ok) throw new Error(`stripe line_items ${r.status}`);
  const { data = [] } = await r.json();
  return data.flatMap((li) => [li.price?.id, typeof li.price?.product === 'string' ? li.price.product : li.price?.product?.id]);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!configured()) { console.error('stripe-webhook: not configured'); return res.status(503).json({ error: 'not_configured' }); }

  let raw;
  try { raw = await readRawBody(req); } catch { return res.status(400).json({ error: 'bad_body' }); }
  if (!verifyStripeSignature(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).json({ error: 'bad_signature' });
  }
  let event;
  try { event = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).json({ error: 'bad_json' }); }

  if (!HANDLED.has(event.type)) return res.status(200).json({ received: true, ignored: 'event_type' });
  const session = event.data?.object || {};
  if (session.object !== 'checkout.session' || !session.id) return res.status(200).json({ received: true, ignored: 'not_session' });
  if (session.payment_status !== 'paid') return res.status(200).json({ received: true, ignored: 'unpaid' });

  // Which pack? Payment Link id first (in the event, no API call), then the session's line items (price / product ids).
  let pack = packForStripeIds([session.payment_link]);
  if (!pack) {
    try {
      const ids = await lineItemIds(session.id);
      if (ids) pack = packForStripeIds(ids);
    } catch (e) { console.error('stripe-webhook: line item lookup failed', event.id, e.message); return res.status(502).json({ error: 'stripe_lookup_failed' }); }
  }
  if (!pack) { console.error('stripe-webhook: paid session matches no pack (check PACK_STRIPE_IDS_*)', event.id); return res.status(500).json({ error: 'unknown_pack' }); }

  const email = String(session.customer_details?.email || session.customer_email || '').trim();
  if (!EMAIL_RE.test(email)) { console.error('stripe-webhook: paid session has no usable email', event.id); return res.status(500).json({ error: 'no_email' }); }

  const site = (process.env.SITE_URL || 'https://www.aiforthisjob.com').replace(/\/$/, '');
  const expS = (Number(session.created) || Number(event.created) || Math.floor(Date.now() / 1000)) + DOWNLOAD_TTL_S;
  const link = `${site}/api/download?token=${encodeURIComponent(makeDownloadToken(pack.slug, session.id, expS))}`;
  const msg = deliveryEmail({ pack, session, link, expS });

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json',
      'Idempotency-Key': `pack-delivery/${session.id}`,
    },
    body: JSON.stringify({
      from: process.env.PACK_FROM || process.env.NEWSLETTER_FROM, // e.g. "AIForThisJob <orders@aiforthisjob.com>"
      to: [email], reply_to: msg.replyTo, subject: msg.subject, text: msg.text, html: msg.html,
      tags: [{ name: 'type', value: 'pack_delivery' }, { name: 'pack', value: pack.slug.replace(/[^a-z0-9_-]/g, '_') }],
    }),
  });
  const data = await r.json().catch(() => ({}));
  // 409 invalid_idempotent_request = this key was already used (already sent); anything else non-2xx -> let Stripe retry.
  if (!r.ok && !(r.status === 409 && data?.name === 'invalid_idempotent_request')) {
    console.error('stripe-webhook: resend send failed', event.id, r.status, data?.name);
    return res.status(502).json({ error: 'send_failed' });
  }
  return res.status(200).json({ received: true, delivered: pack.slug });
}
