// Shared helpers for the newsletter double opt-in. No dependencies; secrets come from Vercel env vars only.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const TTL_MS = 1000 * 60 * 60 * 48; // confirmation links last 48 hours

const b64u = (s) => Buffer.from(s).toString('base64url');
const sign = (payload) => createHmac('sha256', process.env.NEWSLETTER_SECRET).update(payload).digest('base64url');

export function makeToken(email) {
  const payload = b64u(JSON.stringify({ e: email.toLowerCase(), t: Date.now() }));
  return `${payload}.${sign(payload)}`;
}

export function readToken(token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const good = Buffer.from(sign(payload)); const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return null;
  try {
    const { e, t } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!EMAIL_RE.test(e) || Date.now() - t > TTL_MS) return null;
    return e;
  } catch { return null; }
}

export const configured = () => Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_SECRET && process.env.NEWSLETTER_FROM);

export async function resend(path, body) {
  const r = await fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) };
}
