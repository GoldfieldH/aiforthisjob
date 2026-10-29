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
| Environment variables | optional: `SITE_URL` (e.g. `https://aiforthisjob.com`) sets canonical URLs, sitemap and llms.txt. Default: `https://aiforthisjob.vercel.app` |

`vercel.json` gives clean URLs (`/about` instead of `/about.html`) and adds an `X-Robots-Tag: noindex, nofollow` header.

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
