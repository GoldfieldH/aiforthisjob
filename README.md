# AIForThisJob

A free, UK-based library of practical AI use cases organised by job and industry, with plain-English guides, a free ROI calculator and (later) paid prompt/agent-config packs.

Static site generator with **no dependencies** (Node 18+). Content lives in `src/data.mjs`, page templates in `src/build.mjs`, CSS/JS/favicon in `src/static/`.

Public contact: **support@aiforthisjob.com** (the only address used on the site, in pack emails and in the packs; set once in `lib/packs.mjs` as `SUPPORT_EMAIL`). Never put a personal address in this repo.

## Run locally

```bash
npm run build        # builds dist/ in PREVIEW mode (noindex)
npx serve dist       # or any static file server
```

## Deploy on Vercel (Import Git Repository)

| Setting | Value |
|---|---|
| Framework preset | **Other** |
| Root directory | `./` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | leave default (no dependencies to install) |
| Node.js version | 20.x or 22.x |
| Environment variables | optional: `SITE_URL` sets canonical URLs, sitemap, feed and llms.txt. Default: `https://www.aiforthisjob.com` (the apex redirects to www). Optional `AI_TRAINING=0` makes the launch robots.txt block AI-training crawlers (search and AI answer engines stay allowed). |

`vercel.json` gives clean URLs (`/about` instead of `/about.html`), redirects `aiforthisjob.vercel.app` to `www.aiforthisjob.com`, adds security headers and an `X-Robots-Tag: noindex, nofollow` header (remove only that header at launch).

## Preview mode vs launch

The site is currently in **preview mode**: a "Preview version" banner, `noindex` meta tags, a noindex header, and a `robots.txt` that blocks all crawlers. To launch (only once approved):

1. Change the build command to `npm run build:launch` (or set env var `PREVIEW=0`).
2. Remove the `X-Robots-Tag` header from `vercel.json`.
3. Set `SITE_URL` to the live domain.

## Content rules

Public sources only, never invent statistics, label vendor claims, no confidential or employer information, British English.

## Content expansion (branch content-expansion)
- Sections: /make-money-with-ai, /save-time-and-money, /use-agents-safely (content in `src/data-sections.mjs`).
- /latest page and /feed.xml (RSS) are generated from each entry's `added` timestamp; both are in llms.txt, and /latest is in the sitemap.
- Every use case (and each safety guide) has a "View prompt" block with a copy button.
- `npm run check` checks internal links, anchors, JSON-LD, one-H1-per-page, and sitemap/feed/llms.txt links in `dist/`.
- Motion is progressive enhancement: CSS scroll-driven animations with an IntersectionObserver/rAF fallback. Content stays visible without JS, and all motion is off under prefers-reduced-motion.

## SEO (see `npm run check`)
- Titles get " | AIForThisJob" only when they still fit in ~60 characters; meta descriptions are trimmed to 158 characters at a sentence or word boundary. Use-case titles include "AI"; override one with `seoTitle` on the entry.
- Dates come from content: `added` and an optional `updated` (ISO) on each use case or guide. Set `updated` when you materially change an entry; it drives the visible "Updated" date, Article `dateModified`, `article:modified_time` and sitemap `lastmod`. The build date is never used.
- Every page has a canonical URL, Open Graph/Twitter large-image card (`src/static/og/default.png`, 1200×630), and JSON-LD: Organization + WebSite (home, About), BreadcrumbList, Article (use cases, guides), CollectionPage/ItemList (hubs), WebApplication (ROI calculator) and Product/Offer on /packs only when packs are on sale. No FAQ/HowTo markup (Google no longer shows those rich results).
- `npm run check` fails on duplicate titles/descriptions, descriptions over 160 characters, missing or mismatched canonicals, pages missing from the sitemap, a missing og:image file, or an indexable page in a preview build.
- Run `npm run build:launch && npm run check` before launch to confirm the indexable output (robots.txt allows crawlers and lists the sitemap).
