// GET /api/confirm?token=...  -> adds the confirmed address to Resend contacts (and segment, if set), then redirects.
import { configured, readToken, resend } from '../lib/newsletter.js';

export default async function handler(req, res) {
  const go = (p) => { res.setHeader('Location', p); res.setHeader('Cache-Control', 'no-store'); return res.status(303).end(); };
  if (!configured()) return go('/newsletter?status=unavailable');
  const email = readToken(req.query.token);
  if (!email) return go('/newsletter?status=expired');
  const contact = { email, unsubscribed: false };
  if (process.env.RESEND_SEGMENT_ID) contact.segments = [{ id: process.env.RESEND_SEGMENT_ID }];
  const r = await resend('/contacts', contact);
  if (!r.ok && r.status !== 409) { console.error('resend contact failed', r.status, r.data); return go('/newsletter?status=error'); }
  return go('/newsletter?status=confirmed');
}
