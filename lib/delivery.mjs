// Helpers for paid-pack delivery: Stripe signature checks, signed download tokens and the delivery email.
// No dependencies; secrets come from env vars only. Never log emails or payloads.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { packBySlug, SUPPORT_EMAIL } from './packs.mjs';

export const SIG_TOLERANCE_S = 300; // Stripe's recommended 5-minute timestamp tolerance
export const DOWNLOAD_TTL_S = 60 * 60 * 24 * 7; // download links last 7 days

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

// Verifies a Stripe-Signature header ("t=...,v1=...,v1=...") against the raw request body.
export function verifyStripeSignature(rawBody, header, secret, nowS = Math.floor(Date.now() / 1000)) {
  if (!secret || !header) return false;
  let t = null; const sigs = [];
  for (const part of String(header).split(',')) {
    const i = part.indexOf('='); if (i < 0) continue;
    const k = part.slice(0, i).trim(); const v = part.slice(i + 1).trim();
    if (k === 't') t = v; else if (k === 'v1') sigs.push(v);
  }
  if (!/^\d+$/.test(t || '') || !sigs.length) return false;
  if (Math.abs(nowS - Number(t)) > SIG_TOLERANCE_S) return false;
  const expected = createHmac('sha256', secret).update(`${t}.`).update(rawBody).digest('hex');
  return sigs.some((s) => safeEqual(s, expected));
}

// Reads the raw body (Vercel parses req.body lazily, so the stream is untouched unless something read it).
export async function readRawBody(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

const b64u = (s) => Buffer.from(s).toString('base64url');
const sign = (payload) => createHmac('sha256', process.env.DOWNLOAD_SECRET).update(payload).digest('base64url');

// Download token: pack slug + order ref + expiry, HMAC-signed. No personal data inside.
// Expiry is derived from the Stripe session time so a retried webhook builds the identical email (needed for idempotency).
export function makeDownloadToken(slug, ref, expS) {
  const payload = b64u(JSON.stringify({ p: slug, r: ref, x: expS }));
  return `${payload}.${sign(payload)}`;
}

// Returns { pack, ref, exp } | { error: 'invalid' | 'expired' }.
export function readDownloadToken(token, nowS = Math.floor(Date.now() / 1000)) {
  const [payload, sig, extra] = String(token || '').split('.');
  if (!payload || !sig || extra !== undefined || !process.env.DOWNLOAD_SECRET) return { error: 'invalid' };
  if (!safeEqual(sign(payload), sig)) return { error: 'invalid' };
  try {
    const { p, r, x } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const pack = packBySlug(p);
    if (!pack || !Number.isFinite(x)) return { error: 'invalid' };
    if (nowS > x) return { error: 'expired' };
    return { pack, ref: r, exp: x };
  } catch { return { error: 'invalid' }; }
}

const fmtMoney = (minor, cur) => {
  if (!Number.isFinite(minor) || !cur) return '';
  try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur.toUpperCase() }).format(minor / 100); } catch { return ''; }
};
const fmtDate = (s) => new Date(s * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Builds the delivery email. Deterministic for a given session, so Stripe retries produce the same request body.
export function deliveryEmail({ pack, session, link, expS }) {
  const support = process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;
  const paid = fmtMoney(session.amount_total, session.currency);
  const ref = String(session.id || '').slice(-10).toUpperCase();
  const until = fmtDate(expS);
  const subject = `Your AIForThisJob pack: ${pack.name}`;
  const terms = `By buying, you agreed that your download starts straight away, so the 14-day right to cancel no longer applies once you download it. This doesn't affect your rights if the pack is faulty or not as described: email ${support} and we'll fix it, replace it or refund you.`;
  const text = [
    'Hi,', '',
    `Thank you for buying the ${pack.name}${paid ? ` (${paid})` : ''}. Order reference: ${ref}.`, '',
    'Download your pack here:', link, '',
    `The link works until ${until}. If it expires, email ${support} (or just reply to this email) with your order reference and we'll send a new one.`, '',
    terms, '',
    'The pack is for your own use within your organisation. Please don’t resell or republish it. It is practical templates, not financial, legal or professional advice.', '',
    `Questions or problems: ${support}`, '',
    'AIForThisJob', 'https://www.aiforthisjob.com/terms',
  ].join('\n');
  const html = `<p>Hi,</p><p>Thank you for buying the <strong>${esc(pack.name)}</strong>${paid ? ` (${esc(paid)})` : ''}. Order reference: ${esc(ref)}.</p>`
    + `<p><a href="${esc(link)}" style="display:inline-block;padding:10px 18px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none">Download your pack</a></p>`
    + `<p style="color:#666;font-size:13px">The link works until ${esc(until)}. If it expires, email <a href="mailto:${esc(support)}">${esc(support)}</a> (or just reply to this email) with your order reference and we'll send a new one.</p>`
    + `<p style="color:#666;font-size:13px">${esc(terms)}</p>`
    + `<p style="color:#666;font-size:13px">The pack is for your own use within your organisation. Please don’t resell or republish it. It is practical templates, not financial, legal or professional advice.</p>`
    + `<p>Questions or problems: <a href="mailto:${esc(support)}">${esc(support)}</a></p><p>AIForThisJob · <a href="https://www.aiforthisjob.com/terms">Terms</a></p>`;
  return { subject, text, html, replyTo: support };
}
