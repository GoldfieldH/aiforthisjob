// POST /api/subscribe  { email, website? }  -> sends a confirmation email (double opt-in). Stores nothing until confirmed.
import { EMAIL_RE, configured, makeToken, resend } from '../lib/newsletter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (!configured()) return res.status(503).json({ error: 'not_configured' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (body.website) return res.status(200).json({ ok: true }); // honeypot: bots fill the hidden field
  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'invalid_email' });

  const site = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '');
  const link = `${site}/api/confirm?token=${encodeURIComponent(makeToken(email))}`;
  const r = await resend('/emails', {
    from: process.env.NEWSLETTER_FROM, // e.g. "AIForThisJob <newsletter@aiforthisjob.com>"
    to: [email],
    subject: 'Please confirm your AIForThisJob subscription',
    text: `Hi,\n\nPlease confirm you want the weekly AIForThisJob email (one practical AI use case a week):\n\n${link}\n\nThe link works for 48 hours. If you didn't ask for this, ignore this email and you won't hear from us.\n\nAIForThisJob`,
    html: `<p>Hi,</p><p>Please confirm you want the weekly AIForThisJob email (one practical AI use case a week).</p><p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#1d4ed8;color:#fff;border-radius:6px;text-decoration:none">Confirm my subscription</a></p><p style="color:#666;font-size:13px">The link works for 48 hours. If you didn't ask for this, ignore this email and you won't hear from us.</p>`,
  });
  if (!r.ok) { console.error('resend send failed', r.status, r.data); return res.status(502).json({ error: 'send_failed' }); }
  return res.status(200).json({ ok: true });
}
