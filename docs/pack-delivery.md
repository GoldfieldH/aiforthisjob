# Pack delivery (Stripe Payment Link → email with download link)

No secrets in this file. All values below are set in Vercel → Project `aiforthisjob` → Settings → Environment Variables.
Do everything in the **Stripe sandbox** first; repeat in live mode only when Greg approves launch.

## How it works
1. Buyer pays through a Stripe Payment Link (the Buy now buttons, `PACK_LINK_*`).
2. Stripe sends `checkout.session.completed` (and optionally `checkout.session.async_payment_succeeded`) to `POST /api/stripe-webhook`. The function checks the `Stripe-Signature` first (HMAC-SHA256 over the raw body, 5-minute tolerance). Ignore rules run only after that check succeeds.
3. It identifies the pack from the session's Payment Link id, falling back to the line items' price/product ids (`PACK_STRIPE_IDS_*`, read with a restricted key). The Stripe account also takes payments that are not these packs. A verified paid event is acknowledged with HTTP 200 and `{ignored:true}` when it is not ours: `metadata.site` is set and is not `aiforthisjob`, the session has no Payment Link, or the Payment Link and the line items match none of the configured pack ids. Nothing is emailed. The function writes one log line, `stripe-webhook: ignored <reason> <event id>` (no email address and no payload). Stripe does not retry that event.
4. It emails the buyer (Resend) a thank-you with a signed download link valid 7 days. The Resend `Idempotency-Key` is `pack-delivery/<session id>`, so Stripe retries don't send twice (Resend keeps keys for 24 hours). Buyers are **not** added to the newsletter.
5. `GET /api/download?token=…` checks the signature and expiry, then streams the zip from a **private** Vercel Blob store. Zips never go in this repo.

## Environment variables
| Variable | Value | Notes |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | Signing secret of this endpoint (different in sandbox and live). `STRIPE_WEBHOOK_SECRET_LIVE` is obsolete and is not read; do not set it. |
| `STRIPE_SECRET_KEY` | `rk_test_…` / `rk_live_…` | **Restricted key**: Checkout Sessions = Read, everything else None. Only used if the Payment Link id doesn't match. |
| `DOWNLOAD_SECRET` | long random string | e.g. `openssl rand -base64 48`. Changing it invalidates all sent links. |
| `PACK_FROM` | `AIForThisJob <orders@aiforthisjob.com>` | Optional; falls back to `NEWSLETTER_FROM`. Must be on the verified Resend domain. |
| `SUPPORT_EMAIL` | `support@aiforthisjob.com` | Optional; this is the default (set in `lib/packs.mjs`). Reply-to and refund/contact address in the email and on the download page. Forwards via ImprovMX. Never use a personal address. |
| `PACK_FILE_BASE_URL` | `https://<store-id>.private.blob.vercel-storage.com/packs` | Private Blob store URL + folder, no trailing slash. |
| `BLOB_READ_WRITE_TOKEN` | added automatically | Created when the Blob store is connected to the project. `PACK_FILE_TOKEN` overrides it if set. |
| `PACK_STRIPE_IDS_EMAIL` | `plink_…,price_…` | Comma-separated Stripe ids for the Email Replies pack (slug `email-replies`). |
| `PACK_STRIPE_IDS_ADMIN` | `plink_…,price_…` | Meeting Notes & Admin pack (`meeting-admin`). |
| `PACK_STRIPE_IDS_INVOPS` | `plink_…,price_…` | Investment Ops AI ROI pack (`investment-ops-roi`). |
| `PACK_LINK_EMAIL` / `_ADMIN` / `_INVOPS` | `https://buy.stripe.com/…` | Unchanged: the Buy now buttons (baked in at build time, so redeploy after changing). |
| `RESEND_API_KEY`, `SITE_URL` | already set | `SITE_URL` builds the download link (defaults to https://www.aiforthisjob.com). |
| `RESEND_CONTACTS_API_KEY` | needed for newsletter | A **full-access** Resend key, used only by `/api/confirm` to add contacts. `RESEND_API_KEY` can stay sending-only. |

Sandbox ids (account `acct_1UVgkC5sR1r9qUgp`, test mode):
- `PACK_STRIPE_IDS_EMAIL=plink_1UVhtC5sR1r9qUgpQZzdIXao,price_1UVhsp5sR1r9qUgp7I497Re2`
- `PACK_STRIPE_IDS_ADMIN=plink_1UVhtH5sR1r9qUgpzLhIF9V4,price_1UVhsu5sR1r9qUgpCAsvDVPi`
- `PACK_STRIPE_IDS_INVOPS=plink_1UVhtK5sR1r9qUgpH5SoBVoP,price_1UVhsw5sR1r9qUgpWfXhuiGx`

Live mode has different ids: replace these when the live Payment Links exist.

## Payment link redirect (Dashboard only)

The site does not set this. Stripe Payment Links send the browser somewhere after payment only if you turn the redirect on. Do it for **each** pack link the site already sells (the three `PACK_LINK_*` links), in test mode and again in live mode. Edit the existing links. A new link would need a new env value and a redeploy, and the Buy buttons would keep pointing at the old one until then.

For each Payment Link:

1. Stripe Dashboard → **Product catalogue** → **Payment Links** (or **Payment links** in the search box). Switch to **Test mode** first.
2. Open the link → **Edit**.
3. Find **After payment**.
4. Choose **Don’t show confirmation page**.
5. In the URL field that appears, enter exactly `https://www.aiforthisjob.com/thanks`
6. Save.

Repeat for the email, meeting-admin and investment-ops links. Then repeat all three in **live mode** when those live links exist.

Don’t append `{CHECKOUT_SESSION_ID}` unless you mean to. The thank-you page doesn’t read it. The download still arrives by email from the webhook. The page only tells the buyer to check that inbox.

## Setup steps
### 1. Private storage (Vercel Blob, no new account)
1. Vercel → `aiforthisjob` → Storage → Create → Blob → Access **Private** → name `aiforthisjob-packs` (region London `lhr1` if offered) → connect to Production and Preview. This adds `BLOB_READ_WRITE_TOKEN`.
2. Upload the three zips into the `packs/` folder with exactly these names:
   ```bash
   vercel blob put aiforthisjob-email-replies-pack.zip      --pathname packs/aiforthisjob-email-replies-pack.zip      --access private
   vercel blob put aiforthisjob-meeting-admin-pack.zip      --pathname packs/aiforthisjob-meeting-admin-pack.zip      --access private
   vercel blob put aiforthisjob-investment-ops-roi-pack.zip --pathname packs/aiforthisjob-investment-ops-roi-pack.zip --access private
   ```
   (Or upload from the store's page in the dashboard, keeping the same pathnames and no random suffix.)
3. Copy the store URL from `vercel blob list` and set `PACK_FILE_BASE_URL=https://<store-id>.private.blob.vercel-storage.com/packs`.

### 2. Stripe webhook (sandbox first)
1. Stripe Dashboard (sandbox) → Developers → Webhooks → Add destination → events: `checkout.session.completed` (optionally `checkout.session.async_payment_succeeded`) → endpoint `https://www.aiforthisjob.com/api/stripe-webhook`.
2. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Developers → API keys → Create restricted key: Checkout Sessions **Read**, all else None → `STRIPE_SECRET_KEY`.
4. Set `DOWNLOAD_SECRET`, `SUPPORT_EMAIL`, `PACK_FROM` and the `PACK_STRIPE_IDS_*` above, then redeploy.
5. **Live later:** repeat steps 1–3 in live mode (new `whsec_`, `rk_live_`, live `PACK_STRIPE_IDS_*` and `PACK_LINK_*`), then redeploy. Put the live signing secret in `STRIPE_WEBHOOK_SECRET`. `STRIPE_WEBHOOK_SECRET_LIVE` is obsolete.

### 3. Test
- Offline: `npm test` (signs fixtures; Stripe and Resend mocked).
- Local with Stripe CLI (sandbox): `stripe listen --forward-to localhost:3000/api/stripe-webhook` (use its `whsec_` locally with `vercel dev`), then `stripe trigger checkout.session.completed`. Triggered fixtures are not our packs (no matching Payment Link), so the handler returns 200 `{ignored:true}` and sends no email. To test delivery, pay through a `PACK_LINK_*` test link below.
- End to end (sandbox): open a `PACK_LINK_*` test link, pay with card `4242 4242 4242 4242`, any future date/CVC, your own email. Check: webhook delivery shows 200 in Stripe, the email arrives, the link downloads the right zip, and resending the event from Stripe doesn't send a second email.

## Failure behaviour
- Bad/missing signature or timestamp older than 5 minutes → 400 (Stripe shows the failure). The signature is checked before any ignore decision.
- Other event types, unpaid sessions → 200, nothing sent.
- Paid events that are not ours (`metadata.site` set to something other than `aiforthisjob`, no Payment Link, or a Payment Link and line items that match none of the configured `PACK_STRIPE_IDS_*`) → 200 `{ignored:true}`, nothing emailed, one short log line. Stripe does not retry or email a failure.
- Missing config, a paid session we cannot map because a `PACK_STRIPE_IDS_*` value is empty, Stripe lookup error, no buyer email on our own pack, Resend failure → 5xx, so Stripe retries for up to 3 days once fixed.
- Logs contain only the Stripe event id, an ignore reason (`other_site`, `no_payment_link`, `not_our_pack`) and status codes, never emails or payloads.
- A retry more than 24 hours after a successful send could send a second (identical) email, because Resend forgets idempotency keys after 24 hours.
