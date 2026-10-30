// Offline tests for pack delivery: node scripts/test-webhook.mjs (Stripe and Resend are mocked; no network, no secrets).
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { Readable } from 'node:stream';

const env = {
  STRIPE_WEBHOOK_SECRET: 'whsec_test_dummy', STRIPE_SECRET_KEY: 'rk_test_dummy', RESEND_API_KEY: 're_test_dummy',
  DOWNLOAD_SECRET: 'dl_test_secret', PACK_FROM: 'AIForThisJob <orders@example.test>', SUPPORT_EMAIL: 'help@example.test',
  SITE_URL: 'https://www.example.test', PACK_FILE_BASE_URL: 'https://store.private.blob.example.test/packs', PACK_FILE_TOKEN: 'blob_dummy',
  PACK_STRIPE_IDS_EMAIL: 'plink_EMAIL,price_EMAIL', PACK_STRIPE_IDS_ADMIN: 'plink_ADMIN,price_ADMIN', PACK_STRIPE_IDS_INVOPS: 'plink_INVOPS,price_INVOPS,prod_INVOPS',
};
Object.assign(process.env, env);
const { default: webhook } = await import('../api/stripe-webhook.js');
const { default: download } = await import('../api/download.js');
const { makeDownloadToken, readDownloadToken, verifyStripeSignature } = await import('../lib/delivery.mjs');

// ---- mocks ----
const calls = { resend: [], stripe: [], blob: [] };
const sentKeys = new Set();
globalThis.fetch = async (url, opts = {}) => {
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  if (url.startsWith('https://api.resend.com/emails')) {
    const key = opts.headers['Idempotency-Key'];
    calls.resend.push({ key, body: JSON.parse(opts.body) });
    if (key === 'pack-delivery/cs_test_sendfail') return json(500, { name: 'api_error' });
    if (sentKeys.has(key)) return json(200, { id: 'email_1' }); // Resend returns the original response for a repeated key
    sentKeys.add(key); calls.sent = (calls.sent || 0) + 1; return json(200, { id: 'email_1' });
  }
  if (url.startsWith('https://api.stripe.com/v1/checkout/sessions/')) {
    calls.stripe.push(url);
    const foreign = url.includes('/cs_test_foreign');
    return json(200, { data: [{ price: { id: foreign ? 'price_OTHER' : 'price_INVOPS', product: foreign ? 'prod_OTHER' : 'prod_INVOPS' } }] });
  }
  if (url.startsWith(env.PACK_FILE_BASE_URL)) {
    calls.blob.push({ url, auth: opts.headers.Authorization }); return new Response('PK-zip-bytes', { status: 200, headers: { 'Content-Length': '12' } });
  }
  throw new Error(`unexpected fetch ${url}`);
};

const sign = (body, t = Math.floor(Date.now() / 1000), secret = env.STRIPE_WEBHOOK_SECRET) =>
  `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`;
function mockRes() {
  const res = { statusCode: 200, headers: {}, chunks: [] };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; return res; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.send = (b) => { res.body = b; return res; };
  res.end = () => res;
  return res;
}
async function post(body, sig) {
  const req = Readable.from([Buffer.from(body)]);
  Object.assign(req, { method: 'POST', headers: sig ? { 'stripe-signature': sig } : {} });
  const res = mockRes(); await webhook(req, res); return res;
}
const now = Math.floor(Date.now() / 1000);
const event = (over = {}, type = 'checkout.session.completed') => JSON.stringify({
  id: 'evt_1', type, created: now, livemode: false,
  data: { object: { object: 'checkout.session', id: 'cs_test_abc123', created: now, payment_status: 'paid', payment_link: 'plink_EMAIL',
    amount_total: 1900, currency: 'gbp', customer_details: { email: 'buyer@example.test', name: 'Test Buyer' }, ...over } },
});
let n = 0; const ok = (name) => console.log(`ok ${++n} - ${name}`);

// ---- webhook ----
{ const b = event(); const r = await post(b, sign(b, now, 'whsec_wrong')); assert.equal(r.statusCode, 400); assert.equal(r.body.error, 'bad_signature'); ok('bad signature rejected'); }
{ const r = await post(event(), null); assert.equal(r.statusCode, 400); ok('missing signature rejected'); }
{ const b = event(); const r = await post(b.replace('1900', '1'), sign(b)); assert.equal(r.statusCode, 400); ok('tampered body rejected'); }
{ const b = event(); const r = await post(b, sign(b, now - 301)); assert.equal(r.statusCode, 400); ok('timestamp older than 5 minutes rejected'); }
{ const b = event(); assert.equal(verifyStripeSignature(Buffer.from(b), `t=${now},v1=deadbeef,${sign(b).split(',')[1]}`, env.STRIPE_WEBHOOK_SECRET), true); ok('any matching v1 accepted (secret rotation)'); }
{ const b = event({ payment_status: 'unpaid' }); const r = await post(b, sign(b)); assert.equal(r.statusCode, 200); assert.equal(r.body.ignored, 'unpaid'); assert.equal(calls.resend.length, 0); ok('unpaid session ignored with 2xx, no email'); }
{ const b = event({}, 'payment_intent.created'); const r = await post(b, sign(b)); assert.equal(r.statusCode, 200); assert.equal(r.body.ignored, 'event_type'); ok('irrelevant event type -> 2xx'); }
{
  const b = event(); const r = await post(b, sign(b));
  assert.equal(r.statusCode, 200); assert.equal(r.body.delivered, 'email-replies');
  assert.equal(calls.resend.length, 1); assert.equal(calls.sent, 1); assert.equal(calls.stripe.length, 0);
  const { key, body } = calls.resend[0];
  assert.equal(key, 'pack-delivery/cs_test_abc123'); assert.deepEqual(body.to, ['buyer@example.test']);
  assert.equal(body.from, env.PACK_FROM); assert.equal(body.reply_to, env.SUPPORT_EMAIL);
  assert.match(body.text, /Customer Email Replies Pack \(£19\.00\)/); assert.match(body.text, /14-day right to cancel/);
  assert.match(body.text, /https:\/\/www\.example\.test\/api\/download\?token=/); assert.doesNotMatch(body.text, /newsletter|unsubscribe/i);
  ok('paid -> exactly one Resend call with idempotency key, link and terms reminder');
  const r2 = await post(b, sign(b));
  assert.equal(r2.statusCode, 200); assert.equal(calls.sent, 1);
  assert.equal(calls.resend[1].key, calls.resend[0].key); assert.deepEqual(calls.resend[1].body, calls.resend[0].body);
  ok('replay -> 2xx, same key and identical body, no second send');
}
{
  const b = event({ id: 'cs_test_inv', payment_link: 'plink_unknown', amount_total: 4900 }); const r = await post(b, sign(b));
  assert.equal(r.statusCode, 200); assert.equal(r.body.delivered, 'investment-ops-roi'); assert.equal(calls.stripe.length, 1);
  ok('unknown payment link -> line items lookup maps price/product to pack');
}
{
  const saved = process.env.PACK_STRIPE_IDS_INVOPS; process.env.PACK_STRIPE_IDS_INVOPS = '';
  const b = event({ id: 'cs_test_none', payment_link: 'plink_unknown' }); const r = await post(b, sign(b));
  process.env.PACK_STRIPE_IDS_INVOPS = saved; assert.equal(r.statusCode, 500); ok('paid but unmapped -> 5xx so Stripe retries after config fix');
}
async function withLogs(fn) {
  const logged = []; const errors = [];
  const log = console.log; const err = console.error;
  console.log = (...a) => { logged.push(a.map(String).join(' ')); };
  console.error = (...a) => { errors.push(a.map(String).join(' ')); };
  try { return { result: await fn(), logged, errors }; }
  finally { console.log = log; console.error = err; }
}
const quiet = (line) => !line.includes('@') && !line.includes('buyer') && !line.includes('payload') && !line.includes('plink_') && !line.includes('price_');
{
  const before = { resend: calls.resend.length, stripe: calls.stripe.length, sent: calls.sent };
  const b = event({ id: 'cs_test_foreign', payment_link: 'plink_OTHER' });
  const { result, logged, errors } = await withLogs(() => post(b, sign(b)));
  assert.equal(result.statusCode, 200); assert.deepEqual(result.body, { ignored: true });
  assert.equal(calls.resend.length, before.resend); assert.equal(calls.sent, before.sent); assert.equal(calls.stripe.length, before.stripe + 1);
  assert.deepEqual(logged, ['stripe-webhook: ignored not_our_pack evt_1']); assert.deepEqual(errors, []);
  assert.ok(logged.every(quiet)); ok('foreign payment link and price -> 200 ignored, no email, short log');
}
{
  const before = { resend: calls.resend.length, stripe: calls.stripe.length };
  const b = event({ id: 'cs_test_foreign_async', payment_link: 'plink_OTHER' }, 'checkout.session.async_payment_succeeded');
  const { result, logged, errors } = await withLogs(() => post(b, sign(b)));
  assert.equal(result.statusCode, 200); assert.deepEqual(result.body, { ignored: true });
  assert.equal(calls.resend.length, before.resend); assert.equal(calls.stripe.length, before.stripe + 1);
  assert.deepEqual(logged, ['stripe-webhook: ignored not_our_pack evt_1']); assert.deepEqual(errors, []);
  ok('async_payment_succeeded for another payment link -> 200 ignored');
}
{
  const before = { resend: calls.resend.length, stripe: calls.stripe.length };
  const b = event({ id: 'cs_test_nolink', payment_link: null });
  const { result, logged, errors } = await withLogs(() => post(b, sign(b)));
  assert.equal(result.statusCode, 200); assert.deepEqual(result.body, { ignored: true });
  assert.equal(calls.resend.length, before.resend); assert.equal(calls.stripe.length, before.stripe);
  assert.deepEqual(logged, ['stripe-webhook: ignored no_payment_link evt_1']); assert.deepEqual(errors, []);
  assert.ok(logged.every(quiet)); ok('no payment link -> 200 ignored, no lookup, no email');
}
{
  const before = { resend: calls.resend.length, stripe: calls.stripe.length };
  const b = event({ id: 'cs_test_nolink2', payment_link: '' });
  const { result, logged } = await withLogs(() => post(b, sign(b)));
  assert.equal(result.statusCode, 200); assert.deepEqual(result.body, { ignored: true });
  assert.equal(calls.resend.length, before.resend); assert.equal(calls.stripe.length, before.stripe);
  assert.deepEqual(logged, ['stripe-webhook: ignored no_payment_link evt_1']);
  ok('blank payment link -> 200 ignored');
}
{
  const before = { resend: calls.resend.length, stripe: calls.stripe.length };
  const b = event({ id: 'cs_test_othersite', payment_link: 'plink_EMAIL', metadata: { site: 'other-shop' } });
  const { result, logged, errors } = await withLogs(() => post(b, sign(b)));
  assert.equal(result.statusCode, 200); assert.deepEqual(result.body, { ignored: true });
  assert.equal(calls.resend.length, before.resend); assert.equal(calls.stripe.length, before.stripe);
  assert.deepEqual(logged, ['stripe-webhook: ignored other_site evt_1']); assert.deepEqual(errors, []);
  assert.ok(logged.every(quiet)); assert.ok(!logged.join('\n').includes('other-shop'));
  ok('metadata.site other than aiforthisjob -> 200 ignored, even if the payment link is ours');
}
{
  const b = event({ id: 'cs_test_tagged', metadata: { site: 'aiforthisjob' } });
  const r = await post(b, sign(b));
  assert.equal(r.statusCode, 200); assert.equal(r.body.delivered, 'email-replies');
  ok('metadata.site aiforthisjob still delivers our pack');
}
{
  const b = event({ id: 'cs_test_emptymeta', metadata: { site: '  ' } });
  const r = await post(b, sign(b));
  assert.equal(r.statusCode, 200); assert.equal(r.body.delivered, 'email-replies');
  ok('blank metadata.site is not treated as another site');
}
{
  const b = event({ id: 'cs_test_badsig', payment_link: null, metadata: { site: 'other-shop' } });
  const { result, logged } = await withLogs(() => post(b, sign(b, now, 'whsec_wrong')));
  assert.equal(result.statusCode, 400); assert.equal(result.body.error, 'bad_signature');
  assert.deepEqual(logged, []); ok('bad signature is rejected before ignore rules');
}
{
  const saved = process.env.RESEND_API_KEY; delete process.env.RESEND_API_KEY;
  const b = event({ id: 'cs_test_noconfig', payment_link: 'plink_OTHER', metadata: { site: 'other-shop' } });
  const { result, errors } = await withLogs(() => post(b, sign(b)));
  process.env.RESEND_API_KEY = saved;
  assert.equal(result.statusCode, 503); assert.equal(result.body.error, 'not_configured');
  assert.ok(errors.some((line) => line.includes('not configured') && !line.includes('@')));
  ok('missing config stays 503 for an unrelated event');
}
{
  const b = event({ id: 'cs_test_sendfail' });
  const { result, errors } = await withLogs(() => post(b, sign(b)));
  assert.equal(result.statusCode, 502); assert.equal(result.body.error, 'send_failed');
  assert.ok(errors.some((line) => line.includes('resend send failed') && !line.includes('@')));
  ok('resend failure on our pack stays 502 so Stripe retries');
}
{ const res = mockRes(); await webhook({ method: 'GET', headers: {} }, res); assert.equal(res.statusCode, 405); ok('GET -> 405'); }

// ---- download tokens ----
{
  const t = makeDownloadToken('meeting-admin', 'cs_1', now + 3600);
  assert.equal(readDownloadToken(t).pack.slug, 'meeting-admin'); ok('valid token accepted');
  assert.equal(readDownloadToken(makeDownloadToken('meeting-admin', 'cs_1', now - 1)).error, 'expired'); ok('expired token rejected');
  const [p, s] = t.split('.'); const forged = Buffer.from(JSON.stringify({ p: 'investment-ops-roi', r: 'cs_1', x: now + 3600 })).toString('base64url');
  assert.equal(readDownloadToken(`${forged}.${s}`).error, 'invalid'); assert.equal(readDownloadToken(`${p}.${s.slice(0, -2)}xx`).error, 'invalid');
  assert.equal(readDownloadToken('').error, 'invalid'); ok('tampered/forged/empty token rejected');
  const dl = async (token) => { const res = mockRes(); const out = []; res.write = (c) => { out.push(c); return true; };
    const { Writable } = await import('node:stream'); const w = new Writable({ write(c, _e, cb) { out.push(c); cb(); } });
    Object.assign(w, { setHeader: res.setHeader, status: (c) => { res.statusCode = c; return w; }, send: (b) => { res.body = b; return w; } });
    await download({ method: 'GET', query: { token } }, w); return { ...res, out: Buffer.concat(out.map((c) => Buffer.from(c))).toString() }; };
  const good = await dl(t); assert.equal(good.statusCode, 200); assert.equal(good.out, 'PK-zip-bytes');
  assert.equal(calls.blob[0].url, `${env.PACK_FILE_BASE_URL}/aiforthisjob-meeting-admin-pack.zip`); assert.equal(calls.blob[0].auth, 'Bearer blob_dummy');
  assert.match(good.headers['content-disposition'], /attachment/); assert.match(good.headers['cache-control'], /no-store/); ok('download streams file from private storage with bearer token');
  assert.equal((await dl(makeDownloadToken('meeting-admin', 'cs_1', now - 1))).statusCode, 410);
  assert.equal((await dl(`${forged}.${s}`)).statusCode, 403); assert.equal(calls.blob.length, 1); ok('download: expired -> 410, tampered -> 403, storage never hit');
}
console.log(`\nAll ${n} checks passed.`);
