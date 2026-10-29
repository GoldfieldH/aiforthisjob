// GET /api/download?token=...  -> checks the signed, time-limited token, then streams the pack zip from PRIVATE storage.
// Files never live in the public repo. Storage: a private Vercel Blob store (or any private HTTPS base URL needing a bearer token).
import { Readable } from 'node:stream';
import { readDownloadToken } from '../lib/delivery.mjs';
import { SUPPORT_EMAIL } from '../lib/packs.mjs';

const page = (res, status, msg) => {
  const support = process.env.SUPPORT_EMAIL || SUPPORT_EMAIL;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(status).send(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Download</title><body style="font:16px/1.5 system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem"><h1>Download</h1><p>${msg}</p><p>Email <a href="mailto:${support}">${support}</a> with your order reference and we'll send you a new link.</p><p><a href="/packs">Back to packs</a></p></body>`);
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.setHeader('Allow', 'GET, HEAD'); return res.status(405).end(); }
  const base = (process.env.PACK_FILE_BASE_URL || '').replace(/\/$/, '');
  const token = process.env.PACK_FILE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!process.env.DOWNLOAD_SECRET || !/^https:\/\//.test(base) || !token) return page(res, 503, 'Downloads are temporarily unavailable.');

  const t = readDownloadToken(req.query?.token);
  if (t.error === 'expired') return page(res, 410, 'This download link has expired.');
  if (t.error) return page(res, 403, 'This download link isn’t valid.');

  const up = await fetch(`${base}/${encodeURIComponent(t.pack.file)}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
  if (!up || !up.ok || !up.body) { console.error('download: storage fetch failed', t.pack.slug, up?.status); return page(res, 502, 'We couldn’t fetch your file just now. Please try again in a minute.'); }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${t.pack.file}"`);
  const len = up.headers.get('content-length'); if (len) res.setHeader('Content-Length', len);
  res.status(200);
  if (req.method === 'HEAD') { await up.body.cancel().catch(() => {}); return res.end(); }
  await new Promise((resolve, reject) => Readable.fromWeb(up.body).on('error', reject).pipe(res).on('finish', resolve).on('error', reject));
}
