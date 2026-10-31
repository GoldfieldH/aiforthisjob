import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { categories, useCases, guides, sources, sections } from './data.mjs';
import { packs as catalogue, SUPPORT_EMAIL } from '../lib/packs.mjs';
import { ADDED, goals, littleThings, startGuide, atWorkGuide, goalPrompt, goalGood, requirePaths } from './data-paths.mjs';

requirePaths(sources);

const SITE = (process.env.SITE_URL || 'https://www.aiforthisjob.com').replace(/\/$/, ''); // canonical host (apex 308-redirects to www)
// On Vercel, launch mode is only Production. VERCEL_ENV is set by the platform
// (production, preview, or development), so this does not depend on a dashboard env var,
// and a dashboard PREVIEW value cannot make a branch preview indexable or hold Production back.
// Locally there is no VERCEL_ENV: `npm run build` stays noindex, `npm run build:launch` sets PREVIEW=0.
const PREVIEW = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV !== 'production'
  : process.env.PREVIEW !== '0';
const OUT = new URL('../dist/', import.meta.url).pathname;
const NAME = 'AIForThisJob';
const SUPPORT = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
// The company that runs the site and sells the packs. Licence number as given on its Services Licence.
const COMPANY = 'Kaloozo FZ-LLC';
const ONE_OFF = 'One-off payment. No subscription.';
const COMPANY_ADDRESS = 'Compass Building, Al Hulaila Industrial Zone-FZ, Ras Al Khaimah, United Arab Emirates';
const COMPANY_LICENCE = '47037196';
const LEGAL_UPDATED = '30 October 2026';
// Dates shown and sent to search engines come from content (added / optional updated), never the build date,
// so a rebuild doesn't fake freshness (Google: dates and sitemap lastmod must reflect real changes).
const OG_IMAGE = { url: '/og/default.png', width: 1200, height: 630, alt: 'AIForThisJob: the right AI for the job, and how to tell if it pays back' };
const ORG_ID = SITE + '/#organization';
const WEBSITE_ID = SITE + '/#website';
const TITLE_MAX = 60; // Google shows roughly 50-60 characters of a title link
const DESC_MAX = 158; // snippets are usually cut around 150-160 characters
// Stripe Payment Links are public URLs, set per environment in Vercel (test links now, live links at launch).
const packs = catalogue.map((p) => ({ ...p, key: p.linkEnv, url: (process.env[p.linkEnv] || '').trim() }));
const PACKS_ON_SALE = packs.every((p) => /^https:\/\/buy\.stripe\.com\//.test(p.url));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const catBy = Object.fromEntries(categories.map((c) => [c.slug, c]));
const secBy = Object.fromEntries(sections.map((s) => [s.slug, s]));
const files = [];
const urls = [];
const day = (iso) => iso.slice(0, 10);
const updatedOf = (x) => x.updated || x.added;
const latestOf = (list) => list.map(updatedOf).sort().pop();
// Append the brand only when the whole title still fits; long titles keep their keywords instead.
const seoTitle = (t) => (t.length + NAME.length + 3 <= TITLE_MAX ? `${t} | ${NAME}` : t);
// Trim a description to whole sentences, or whole words with an ellipsis, within DESC_MAX.
function metaDesc(text, max = DESC_MAX) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const stop = cut.lastIndexOf('. ');
  if (stop > max * 0.55) return cut.slice(0, stop + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…';
}
// "Customer support" -> "customer support", but keep acronyms such as "HR".
const lcName = (n) => (/^[A-Z]{2}/.test(n) ? n : n.charAt(0).toLowerCase() + n.slice(1));
// Use-case titles get "AI" in them for search, without doubling up on "with".
// A few titles read better with AI at the front; edit here (or add `seoTitle` to the entry in data).
const ucTitleOverrides = {
  'test-a-business-idea-cheaply': 'Use AI to test a small business idea before you spend money',
  'sell-templates-from-your-expertise': 'Use AI to turn your expertise into templates to sell',
  'job-ads-and-application-admin': 'Write job adverts and organise applications with AI',
  'freelance-faster-with-ai': 'Use AI to freelance faster at work you’re already good at',
};
const ucTitle = (u) => u.seoTitle || ucTitleOverrides[u.slug] || (/\bAI\b/.test(u.title) ? u.title : `${u.title} ${/\bwith\b/.test(u.title) ? 'using' : 'with'} AI`);
const niceDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });

function write(path, content) {
  const p = join(OUT, path);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  files.push(path);
}

const navLinks = [
  ['/start', 'Start here', (p) => p === '/start'],
  ['/use-cases', 'Ideas by job', (p) => p === '/use-cases' || p.startsWith('/use-cases/') || p.startsWith('/jobs/')],
  ['/guides', 'Guides', (p) => p === '/guides' || p.startsWith('/guides/')],
  ['/packs', 'Packs', (p) => p === '/packs'],
];

function page({ path, title, description, body, jsonld = [], type = 'website', progress = false, bodyClass = '', lastmod = null, published = null, modified = null, noindex = false, sitemap = true, file = null }) {
  const url = SITE + (path === '/' ? '/' : path);
  const fullTitle = path === '/' ? title : seoTitle(title);
  description = metaDesc(description);
  if (sitemap && !noindex) urls.push({ path, lastmod });
  const robots = PREVIEW || noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  const ld = jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n');
  const isCurrent = (href) => path === href || path.startsWith(href + '/');
  const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '' : `<link rel="canonical" href="${url}">\n`}<meta name="robots" content="${robots}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${NAME}">
<meta property="og:locale" content="en_GB">
<meta property="og:image" content="${SITE}${OG_IMAGE.url}">
<meta property="og:image:width" content="${OG_IMAGE.width}">
<meta property="og:image:height" content="${OG_IMAGE.height}">
<meta property="og:image:alt" content="${esc(OG_IMAGE.alt)}">
${published ? `<meta property="article:published_time" content="${published}">\n<meta property="article:modified_time" content="${modified || published}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}${OG_IMAGE.url}">
<meta name="twitter:image:alt" content="${esc(OG_IMAGE.alt)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="${NAME}: latest use cases and guides" href="/feed.xml">
<script>document.documentElement.classList.add('js');setTimeout(function(){if(!window.__aiftj)document.documentElement.classList.remove('js')},2500)</script>
<link rel="stylesheet" href="/styles.css">
${ld}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
${PREVIEW ? '<div class="preview-bar">Preview version: not yet launched. Content is for review.</div>' : ''}
<header class="site-header"><div class="wrap nav">
<a class="logo" href="/" aria-label="${NAME} home"><span class="logo-mark" aria-hidden="true">AI</span><span>ForThisJob</span></a>
<nav class="nav-links" aria-label="Main">${navLinks.map(([h, t, on]) => `<a href="${h}"${on(path) ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav>
<div class="nav-tools"><a class="btn btn-sm nav-buy" href="/packs"${isCurrent('/packs') ? ' aria-current="page"' : ''}>Buy</a><a class="btn btn-sm nav-cta" href="/newsletter">Newsletter</a></div>
</div>${progress ? '<div class="progress" aria-hidden="true"><span></span></div>' : ''}</header>
<main id="main">${body}</main>
<footer class="site-footer"><div class="wrap footer-grid">
<div class="footer-brand"><a class="logo" href="/"><span class="logo-mark" aria-hidden="true">AI</span><span>ForThisJob</span></a><p class="muted">Which AI for which job, with honest notes on what it takes and whether it pays back. Written for UK readers.</p></div>
<div><h2 class="footer-h">Explore</h2><a href="/start">Start here</a><a href="/at-work">AI at work</a><a href="/get-done">What do you want to get done?</a><a href="/little-things">Little useful things</a>${sections.map((s) => `<a href="/${s.slug}">${esc(s.name)}</a>`).join('')}<a href="/use-cases">All use cases</a><a href="/latest">Latest</a><a href="/roi-calculator">ROI calculator</a></div>
<div><h2 class="footer-h">By job</h2>${categories.map((c) => `<a href="/jobs/${c.slug}">${esc(c.name)}</a>`).join('')}</div>
<div><h2 class="footer-h">About</h2><a href="/about">About</a><a href="/guides">Guides</a><a href="/packs">Packs</a><a href="/newsletter">Newsletter</a><a href="/feed.xml">RSS feed</a><a href="/disclosure">Sponsor and affiliate disclosure</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="mailto:${SUPPORT_EMAIL}">Contact</a></div>
</div><div class="wrap fine">© ${new Date().getFullYear()} ${COMPANY}. ${NAME} is run by ${COMPANY}. Packs are sold by ${COMPANY}. Information only, not financial, legal or professional advice. Product names belong to their owners; no endorsement implied.</div></footer>
${path === '/packs' ? '' : `<a class="btn buy-fab" href="/packs"><span>Buy packs</span><span class="buy-fab-note">${ONE_OFF}</span></a>`}
<script src="/site.js" defer></script>
</body>
</html>`;
  write(file || (path === '/' ? 'index.html' : path.slice(1) + '.html'), html);
}

const crumbsLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + (p === '/' ? '/' : p) })),
});
const crumbsHtml = (items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([n, p], i) => i === items.length - 1 ? `<span aria-current="page">${esc(n)}</span>` : `<a href="${p}">${esc(n)}</a>`).join('<span class="sep" aria-hidden="true">›</span>')}</nav>`;

const card = (u, i = 0) => `<a class="card reveal" style="--i:${i % 6}" href="/use-cases/${u.slug}"><span class="tag">${esc(catBy[u.cat].name)}</span><h3>${esc(u.title)}</h3><p>${esc(u.summary)}</p><span class="more">See how</span></a>`;
const guideCard = (g, i = 0) => `<a class="card reveal" style="--i:${i % 6}" href="/guides/${g.slug}"><span class="tag tag-guide">Guide</span><h3>${esc(g.title)}</h3><p>${esc(g.summary)}</p><span class="more">Read the guide</span></a>`;

const signup = (id = 'signup') => `<section class="signup band-dark" id="${id}" aria-labelledby="${id}-h"><div class="wrap signup-inner reveal">
<div><p class="eyebrow">Newsletter</p><h2 id="${id}-h">One useful AI use case a week.</h2><p>A short email with a practical use case, the tools, a ready-to-use prompt and how to tell whether it pays back. No hype.</p></div>
<form class="newsletter-form" novalidate>
<label for="${id}-email" class="sr">Email address</label>
<input id="${id}-email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required>
<input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
<button class="btn" type="submit">Subscribe</button>
<p class="form-note" role="status">We’ll email you a link to confirm. Unsubscribe any time. See our <a href="/privacy">privacy notice</a>.</p>
</form></div></section>`;

const sourceList = (keys) => `<ol class="sources">${keys.map((k) => { const s = sources[k]; return `<li><a href="${s.url}" rel="noopener" target="_blank">${esc(s.title)}</a> <span class="kind">${esc(s.kind)}</span></li>`; }).join('')}</ol>`;

const highlightSlots = (escaped) => escaped.replace(/\[([^\]\n]+)\]/g, '<mark class="slot">[$1]</mark>');
const promptBlock = (text, label = 'Ready-to-use prompt', id = 'prompt') => `<section class="prompt-block reveal" id="${esc(id)}" aria-labelledby="${esc(id)}-h">
<h2 id="${esc(id)}-h">${esc(label)}</h2>
<p class="muted small">Highlighted <mark class="slot">[brackets]</mark> are the parts you replace. Only paste information you’re allowed to share with the tool you’re using.</p>
<details class="prompt-details" open>
<summary><span class="btn btn-sm">The prompt</span><span class="peek">${esc(text.split('\n')[0])}</span></summary>
<div class="prompt-wrap"><button class="copy btn btn-sm btn-ghost" type="button" data-label="Copy prompt">Copy prompt</button><pre class="prompt"><code>${highlightSlots(esc(text))}</code></pre></div>
</details></section>`;
// Guide pages sometimes include a prompt in the body, not only in the prompt field.
function decorateInlinePrompts(html) {
  return html.replace(/<pre class="prompt"><code>([\s\S]*?)<\/code><\/pre>/g, (_, raw) => `<p class="muted small">Highlighted <mark class="slot">[brackets]</mark> are the parts you replace. Only paste information you’re allowed to share.</p><div class="prompt-wrap"><button class="copy btn btn-sm btn-ghost" type="button" data-label="Copy prompt">Copy prompt</button><pre class="prompt"><code>${highlightSlots(esc(raw))}</code></pre></div>`);
}
const wantMore = `<aside class="callout want-more"><h2>Want a bigger kit?</h2><p>You can copy every prompt on this page and use it today. A pack is the longer set for one job, if you want that later. ${ONE_OFF}</p><p><a class="btn btn-ghost btn-sm" href="/packs">See the packs</a></p></aside>`;
const linkList = (links = []) => links.length ? `<ul class="inline-links">${links.map((l) => { const ext = /^https?:/.test(l.href); return `<li><a href="${esc(l.href)}"${ext ? ' rel="noopener" target="_blank"' : ''}>${esc(l.label || l.title)}</a></li>`; }).join('')}</ul>` : '';
const goalPicker = () => {
  const groups = [['work', 'At work'], ['home', 'At home'], ['either', 'I’m not sure']];
  return `<div class="goal-groups">${groups.map(([key, label]) => {
    const items = goals.filter((g) => g.audience === key);
    return `<div><p class="goal-label">${label}</p><div class="goal-list">${items.map((g) => `<a class="choice" href="/get-done/${g.slug}"><strong>${esc(g.title)}</strong><span>${esc(g.card)}</span></a>`).join('')}</div></div>`;
  }).join('')}</div>`;
};
const audLabel = { work: 'At work', home: 'At home', both: 'Work or home', either: 'Not sure' };

const moneyDisclaimer = `<div class="callout warn disclaimer" role="note"><strong>No income promises.</strong> ${esc(secBy['make-money-with-ai'].disclaimer)}</div>`;

const layers = `<div class="layers" aria-hidden="true"><span class="layer l1" data-speed="0.25"></span><span class="layer l2" data-speed="0.45"></span><span class="layer l3" data-speed="0.65"></span><span class="layer grid-lines" data-speed="0.1"></span></div>`;

// All entries for Latest / RSS (newest first; ties keep later-defined content first)
const entries = [
  ...useCases.map((u, i) => ({ kind: 'Use case', path: `/use-cases/${u.slug}`, title: u.title, summary: u.summary, added: u.added, section: u.section, cat: catBy[u.cat].name, order: i })),
  ...guides.map((g, i) => ({ kind: 'Guide', path: `/guides/${g.slug}`, title: g.title, summary: g.summary, added: g.added, section: g.section, cat: g.section ? secBy[g.section].name : 'Guide', order: 100 + i })),
].sort((a, b) => b.added.localeCompare(a.added) || b.order - a.order);

// ---------- Home ----------
const orgLd = { '@context': 'https://schema.org', '@type': 'Organization', '@id': ORG_ID, name: NAME, url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/logo.png', width: 512, height: 512 }, email: SUPPORT_EMAIL, description: 'Practical, realistic AI use cases organised by job and industry: what to try, what to keep a human on and how to tell it pays back.', parentOrganization: { '@type': 'Organization', name: COMPANY }, areaServed: 'GB', contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: SUPPORT_EMAIL, availableLanguage: 'en-GB' } };
const siteLd = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': WEBSITE_ID, name: NAME, url: SITE + '/', inLanguage: 'en-GB', description: 'You’ve got the AI tools. Now what? A free library of practical AI use cases organised by job and industry.', publisher: { '@id': ORG_ID } };
const orgRef = { '@type': 'Organization', '@id': ORG_ID, name: NAME, url: SITE + '/' };
const articleLd = ({ headline, description, path, added, updated, extra = {} }) => ({
  '@context': 'https://schema.org', '@type': 'Article', headline, description, inLanguage: 'en-GB',
  image: [SITE + OG_IMAGE.url], datePublished: added, dateModified: updated || added,
  author: orgRef, publisher: orgRef, isPartOf: { '@id': WEBSITE_ID }, mainEntityOfPage: SITE + path, ...extra,
});
const sectionExamples = {
  'make-money-with-ai': useCases.filter((u) => u.section === 'make-money-with-ai').slice(0, 3).map((u) => [`/use-cases/${u.slug}`, u.title]),
  'save-time-and-money': ['draft-customer-email-replies', 'audit-software-subscriptions', 'compare-supplier-quotes'].map((s) => [`/use-cases/${s}`, useCases.find((u) => u.slug === s).title]),
  'use-agents-safely': guides.filter((g) => g.section === 'use-agents-safely').slice(0, 3).map((g) => [`/guides/${g.slug}`, g.title]),
};
const panelTone = { 'make-money-with-ai': 'band-light', 'save-time-and-money': 'band-soft', 'use-agents-safely': 'band-dark' };
page({
  path: '/', title: 'You’ve got the AI tools. Now what? AI use cases by job', lastmod: latestOf([...useCases, ...guides, { added: ADDED }]),
  description: 'You’ve got the AI tools. Now what? A first page if you’re new, a first week if work just switched a tool on, and ideas for the job you do.',
  jsonld: [orgLd, siteLd], bodyClass: 'home',
  body: `
<section class="hero">${layers}<div class="wrap hero-inner">
<p class="eyebrow">Free AI ideas for real jobs</p>
<h1 class="display">You’ve got the AI tools.<br><span class="grad">Now what?</span></h1>
<p class="lede">The tool is the easy bit. Knowing what to try first is the hard bit. If you’ve never typed a prompt, start here. If work just turned one on, there’s a page for that week. If you already know the job, go straight to the ideas.</p>
<div class="hero-cta"><a class="btn btn-lg" href="/start">Start here (5 min)</a><a class="btn btn-lg btn-ghost" href="/use-cases">Find ideas for my job</a></div>
<ul class="trust"><li>Sources on every entry</li><li>Vendor claims labelled</li><li>No invented stats</li></ul>
<p class="hero-quiet"><a href="/roi-calculator">Already running a project? Work out whether it pays back</a></p>
</div></section>
<section class="wrap section follow" aria-labelledby="situations-h">
<h2 id="situations-h">Pick your situation</h2>
<p class="lede">Three ways in. Pick the one that sounds like your week.</p>
<div class="situations">
<a class="situation" href="/start"><h3>I’m new to AI</h3><p>You’ve never typed a prompt. Open a free chat tool and try one useful thing.</p><span class="more">Start here</span></a>
<a class="situation" href="/at-work"><h3>I’ve just been given AI at work</h3><p>You know the job. See what you’re allowed to paste, then try five small tasks.</p><span class="more">Your first week</span></a>
<a class="situation" href="/use-cases"><h3>I know my job</h3><p>Skip the intro. Ideas for the work you already do, each with a prompt you can change.</p><span class="more">Ideas by job</span></a>
</div>
<h2 id="picker-h">What do you want to get done?</h2>
<p class="lede">Pick the closest job. You’ll get one prompt to copy, a note on what a good answer looks like, and a next step.</p>
${goalPicker()}
<p class="more-row"><a href="/get-done">All the short paths</a> · <a href="/little-things">Little useful things to copy</a></p>
</section>
<div class="panels" aria-label="Three ways in">
${sections.map((s, i) => `<section class="panel ${panelTone[s.slug]}" aria-labelledby="panel-${s.slug}"><div class="wrap panel-inner reveal">
<div><p class="eyebrow">${esc(s.eyebrow)}</p><h2 class="panel-h" id="panel-${s.slug}">${esc(s.headline)}</h2><p class="lede">${esc(s.intro)}</p><a class="btn" href="/${s.slug}">${esc(s.name)}</a></div>
<ul class="panel-list">${sectionExamples[s.slug].map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul>
</div></section>`).join('\n')}
</div>
<section class="wrap section"><div class="section-head reveal"><h2>Browse by job or industry</h2><a href="/use-cases">See all ${useCases.length} ideas</a></div>
<div class="grid cats">${categories.map((c, i) => { const n = useCases.filter((u) => u.cat === c.slug).length; const count = n < 3 ? 'A few ideas' : `${n} ideas`; return `<a class="cat reveal" style="--i:${i % 6}" href="/jobs/${c.slug}"><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p><span class="count">${count}</span></a>`; }).join('')}</div></section>
<section class="band-soft"><div class="wrap section"><div class="section-head reveal"><h2>Just added</h2><a href="/latest">Everything new</a></div>
<div class="grid">${entries.slice(0, 6).map((e, i) => `<a class="card reveal" style="--i:${i}" href="${e.path}"><span class="tag">${esc(e.cat)}</span><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><span class="more">${e.kind === 'Guide' ? 'Read the guide' : 'See how'}</span></a>`).join('')}</div></div></section>
<section class="wrap section"><div class="section-head reveal"><h2>Popular ideas</h2></div><div class="grid">${['draft-customer-email-replies', 'automate-repetitive-workflows', 'vibe-code-an-internal-tool', 'spreadsheet-formulas-with-ai', 'meeting-notes-and-actions', 'repurpose-content-into-social-posts'].map((s, i) => card(useCases.find((u) => u.slug === s), i)).join('')}</div></section>
<section class="wrap section"><div class="section-head reveal"><h2>Short guides if the words still feel fuzzy</h2><a href="/guides">All guides</a></div><div class="grid">${guides.filter((g) => !g.section).map(guideCard).join('')}</div></section>
${signup('home-signup')}`,
});

// ---------- Section index pages ----------
const sectionTitles = {
  'make-money-with-ai': 'Make money with AI: side-income ideas, effort and UK rules',
  'save-time-and-money': 'Save time and money with AI: ideas you can check',
  'use-agents-safely': 'Use AI agents safely: permissions, testing and policy',
};
for (const s of sections) {
  const ucs = useCases.filter((u) => u.section === s.slug);
  const gds = guides.filter((g) => g.section === s.slug);
  const items = [...gds.map((g) => ({ url: `/guides/${g.slug}`, name: g.title })), ...ucs.map((u) => ({ url: `/use-cases/${u.slug}`, name: u.title }))];
  const crumbs = [['Home', '/'], [s.name, `/${s.slug}`]];
  let aside = '';
  if (s.slug === 'make-money-with-ai') aside = moneyDisclaimer;
  if (s.slug === 'save-time-and-money') aside = `<div class="callout"><strong>Does it pay back?</strong> Time saved only counts if it’s redeployed or avoids a real cost. <a href="/roi-calculator">Run your numbers in the calculator</a> or read <a href="/guides/measuring-ai-roi">how to tell whether it pays back</a>.</div>`;
  if (s.slug === 'use-agents-safely') aside = `<div class="callout"><strong>The short version.</strong> Give agents only the access they need, have a person approve anything sent, paid or deleted, test on real examples first, and write it down. Each guide comes with a prompt to help you do it.</div>`;
  let lists = '';
  if (gds.length) lists += `<h2 class="list-h">Guides</h2><div class="grid grid-2">${gds.map(guideCard).join('')}</div>`;
  if (ucs.length) {
    const newOnes = ucs.filter((u) => u.added > '2026-10-29T01');
    const rest = ucs.filter((u) => !newOnes.includes(u));
    if (s.slug === 'save-time-and-money' && rest.length) {
      lists += `<h2 class="list-h">New ideas</h2><div class="grid grid-2">${newOnes.map(card).join('')}</div><h2 class="list-h">More ways to save time</h2><div class="grid grid-2">${rest.map(card).join('')}</div>`;
    } else lists += `<h2 class="list-h">${s.slug === 'make-money-with-ai' ? 'Ideas' : 'Use cases'}</h2><div class="grid grid-2">${ucs.map(card).join('')}</div>`;
  }
  if (s.slug === 'use-agents-safely') {
    const rel = ['daily-inbox-triage', 'website-faq-assistant', 'automate-repetitive-workflows'].map((x) => useCases.find((u) => u.slug === x));
    lists += `<h2 class="list-h">Use cases where these controls matter most</h2><div class="grid grid-2">${rel.map(card).join('')}</div>`;
  }
  page({
    path: `/${s.slug}`, title: sectionTitles[s.slug] || `${s.name}: practical guides and use cases`, lastmod: latestOf([...ucs, ...gds]),
    description: s.intro,
    jsonld: [crumbsLd(crumbs), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: s.name, description: s.intro, inLanguage: 'en-GB', url: `${SITE}/${s.slug}`, mainEntity: { '@type': 'ItemList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + it.url, name: it.name })) } }],
    body: `<section class="section-hero ${panelTone[s.slug]}">${layers}<div class="wrap">${crumbsHtml(crumbs)}<p class="eyebrow">${esc(s.eyebrow)}</p><h1 class="display">${esc(s.headline)}</h1><p class="lede">${esc(s.intro)}</p></div></section>
<div class="wrap section sticky-layout">
<aside class="sticky-col"><div class="sticky-inner"><h2 class="sr">About this section</h2>${aside}<p class="muted small">${items.length} entries · <a href="/latest">See what’s new</a></p></div></aside>
<div class="scroll-col">${lists}</div>
</div>${signup('sec-signup')}`,
  });
}

// ---------- Latest ----------
page({
  path: '/latest', title: 'Latest AI use cases and guides', lastmod: latestOf([...useCases, ...guides]),
  description: 'The newest additions to the AIForThisJob library, newest first. Also available as an RSS feed.',
  jsonld: [crumbsLd([['Home', '/'], ['Latest', '/latest']]), { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Latest additions', itemListOrder: 'https://schema.org/ItemListOrderDescending', itemListElement: entries.map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + e.path, name: e.title })) }],
  body: `<section class="wrap narrow section">${crumbsHtml([['Home', '/'], ['Latest', '/latest']])}
<p class="eyebrow">What’s new</p><h1 class="display-s">Latest additions</h1><p class="lede">Every new use case and guide, newest first. Follow along with the <a href="/feed.xml">RSS feed</a> or <a href="/newsletter">the newsletter</a>.</p>
<ol class="timeline">${entries.map((e) => `<li class="reveal"><time datetime="${e.added}">${niceDate(e.added)}</time><a href="${e.path}"><span class="tag">${esc(e.kind)} · ${esc(e.cat)}</span><strong>${esc(e.title)}</strong><span class="muted">${esc(e.summary)}</span></a></li>`).join('')}</ol>
</section>${signup('latest-signup')}`,
});

// ---------- Use case index ----------
page({
  path: '/use-cases', title: 'Ideas by job: practical AI you can try', lastmod: latestOf(useCases),
  description: `${useCases.length} practical AI ideas by job, each with tools, what you need first, a prompt to copy and a way to tell if it’s worth it.`,
  jsonld: [crumbsLd([['Home', '/'], ['Use cases', '/use-cases']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: useCases.map((u, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/use-cases/${u.slug}`, name: u.title })) }],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['Use cases', '/use-cases']])}
<p class="eyebrow">The library</p><h1 class="display-s">Ideas by job</h1><p class="lede">Each idea follows the same shape: the job, how AI helps, what you need first, a prompt to copy, and how to tell if it’s worth it. Sources stay at the bottom.</p>
<div class="filters" data-filter-for="uc-grid" role="group" aria-label="Filter by job"><button class="chip active" type="button" aria-pressed="true" data-filter="all">All</button>${categories.map((c) => `<button class="chip" type="button" aria-pressed="false" data-filter="${c.slug}">${esc(c.name)}</button>`).join('')}</div>
<div class="grid" id="uc-grid">${useCases.map((u, i) => card(u, i).replace('<a class="card', `<a data-cat="${u.cat}" class="card`)).join('')}</div></section>${signup('lib-signup')}`,
});

// ---------- Category pages ----------
for (const c of categories) {
  const list = useCases.filter((u) => u.cat === c.slug);
  page({
    path: `/jobs/${c.slug}`, title: `AI for ${lcName(c.name)}: use cases and tools`, lastmod: list.length ? latestOf(list) : null,
    description: `${c.blurb} Practical AI use cases for ${lcName(c.name)}, with tools, prompts and ways to measure them.`,
    jsonld: [crumbsLd([['Home', '/'], ['Use cases', '/use-cases'], [c.name, `/jobs/${c.slug}`]]), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `AI for ${lcName(c.name)}`, description: c.blurb, inLanguage: 'en-GB', url: `${SITE}/jobs/${c.slug}`, isPartOf: { '@id': WEBSITE_ID }, mainEntity: { '@type': 'ItemList', itemListElement: list.map((u, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/use-cases/${u.slug}`, name: u.title })) } }],
    body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['Use cases', '/use-cases'], [c.name, `/jobs/${c.slug}`]])}
<h1 class="display-s">AI for ${esc(lcName(c.name))}</h1><p class="lede">${esc(c.blurb)}</p>
${c.slug === 'side-income' ? moneyDisclaimer : ''}
<div class="grid">${list.map(card).join('')}</div>
<p class="muted">More ${esc(lcName(c.name))} use cases are on the way. <a href="/newsletter">Get them by email</a>.</p></section>`,
  });
}

// ---------- Use case pages ----------
const toc = (items) => `<aside class="toc" aria-label="On this page"><div class="toc-inner"><p class="toc-h">On this page</p><ul>${items.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ul><a class="btn btn-sm" href="#prompt">View prompt</a></div></aside>`;
for (const u of useCases) {
  const c = catBy[u.cat];
  const s = secBy[u.section];
  const crumbs = [['Home', '/'], [s.name, `/${s.slug}`], [u.title, `/use-cases/${u.slug}`]];
  const related = useCases.filter((x) => x.cat === u.cat && x.slug !== u.slug).slice(0, 3);
  const roiLabel = u.roiLabel || 'Is it worth it?';
  const tocItems = [['what', 'How AI helps'], ['tools', 'Tools you can use'], ['first', 'Before you start'], ['prompt', 'Prompt'], ['measure', roiLabel], ['evidence', 'What research shows'], ['sources', 'Sources']];
  page({
    path: `/use-cases/${u.slug}`, title: ucTitle(u), type: 'article', progress: true,
    lastmod: updatedOf(u), published: u.added, modified: updatedOf(u),
    description: ((d) => (d.length <= DESC_MAX ? d : u.summary))(`${u.summary} Tools, what you need first, how to measure it and a ready-to-use prompt.`),
    jsonld: [crumbsLd(crumbs), articleLd({ headline: u.title, description: u.summary, path: `/use-cases/${u.slug}`, added: u.added, updated: u.updated,
      extra: { about: c.name, articleSection: s.name, citation: u.sources.map((k) => sources[k].url) } })],
    body: `<header class="article-hero"><div class="wrap article-grid article-head"><div class="toc-spacer" aria-hidden="true"></div><div>${crumbsHtml(crumbs)}
<div class="tags"><a class="tag" href="/jobs/${c.slug}">${esc(c.name)}</a><a class="tag tag-guide" href="/${s.slug}">${esc(s.name)}</a></div>
<h1 class="display-s">${esc(u.title)}</h1>
<p class="lede">${esc(u.summary)}</p>
<p class="meta muted small">By the ${NAME} team · Added <time datetime="${u.added}">${niceDate(u.added)}</time>${u.updated ? ` · Updated <time datetime="${u.updated}">${niceDate(u.updated)}</time>` : ''} · <a href="#prompt">Jump to the prompt ↓</a></p>
</div></div></header>
<div class="wrap article-grid">
${toc(tocItems)}
<article class="article">
<div class="callout"><strong>The job:</strong> ${esc(u.job)}</div>
${u.section === 'make-money-with-ai' ? `<div class="glance"><div><span>Effort</span><p>${esc(u.effort)}</p></div><div><span>Cost to start</span><p>${esc(u.startCost)}</p></div></div>${moneyDisclaimer}` : ''}
<h2 id="what">How AI helps</h2><ul>${u.whatAIDoes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2 id="tools">Tools you can use</h2><ul>${u.tools.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<p class="muted small">Named tools are examples, not endorsements. We have no paid relationships with them at the moment; see our <a href="/disclosure">disclosure</a>.</p>
<h2 id="first">Before you start</h2><ul>${u.needFirst.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
${promptBlock(u.prompt)}
<h2 id="measure">${esc(roiLabel)}</h2><ul>${u.roi.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
${u.section === 'make-money-with-ai' ? '' : '<p><a class="btn btn-ghost btn-sm" href="/roi-calculator">Run the numbers in the calculator</a></p>'}
<h2 id="evidence">What research shows</h2><p>${esc(u.evidence)}</p>
<h2 id="sources">Sources</h2>${sourceList(u.sources)}
<p class="muted small">Last updated <time datetime="${updatedOf(u)}">${niceDate(updatedOf(u))}</time>. Spotted something out of date? Email ${SUPPORT}. <a href="/about#how-we-work">How we check these pages</a>.</p>
</article></div>
${related.length ? `<section class="band-soft"><div class="wrap section"><h2>Related use cases</h2><div class="grid">${related.map(card).join('')}</div></div></section>` : ''}
${signup('uc-signup')}`,
  });
}

// ---------- Guides ----------
page({
  path: '/guides', title: 'Guides: prompting, safety and whether AI is worth it', lastmod: latestOf(guides),
  description: 'Short, practical guides: how to ask an AI tool for what you want, how to keep data safe, and how to tell if a tool is worth keeping.',
  jsonld: [crumbsLd([['Home', '/'], ['Guides', '/guides']])],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['Guides', '/guides']])}<p class="eyebrow">Guides</p><h1 class="display-s">Guides</h1><p class="lede">Short reads if the words still feel fuzzy, or if you are about to let a tool read email, files or anything you would not want sent by mistake.</p>
<h2 class="list-h">Getting started</h2><div class="grid">${guides.filter((g) => !g.section).map(guideCard).join('')}</div>
<h2 class="list-h">Use agents safely</h2><div class="grid">${guides.filter((g) => g.section === 'use-agents-safely').map(guideCard).join('')}</div></section>`,
});
for (const g of guides) {
  const s = g.section ? secBy[g.section] : null;
  const crumbs = s ? [['Home', '/'], [s.name, `/${s.slug}`], [g.title, `/guides/${g.slug}`]] : [['Home', '/'], ['Guides', '/guides'], [g.title, `/guides/${g.slug}`]];
  const more = s ? guides.filter((x) => x.section === g.section && x.slug !== g.slug) : guides.filter((x) => !x.section && x.slug !== g.slug);
  page({
    path: `/guides/${g.slug}`, title: g.title, description: g.summary, type: 'article', progress: true,
    lastmod: updatedOf(g), published: g.added, modified: updatedOf(g),
    jsonld: [crumbsLd(crumbs), articleLd({ headline: g.title, description: g.summary, path: `/guides/${g.slug}`, added: g.added, updated: g.updated,
      extra: { ...(s ? { articleSection: s.name } : {}), citation: g.sources.map((k) => sources[k].url) } })],
    body: `<header class="article-hero"><div class="wrap narrow">${crumbsHtml(crumbs)}<div class="tags"><span class="tag tag-guide">${s ? esc(s.name) : 'Guide'}</span></div><h1 class="display-s">${esc(g.title)}</h1><p class="lede">${esc(g.summary)}</p><p class="meta muted small">By the ${NAME} team · Added <time datetime="${g.added}">${niceDate(g.added)}</time>${g.updated ? ` · Updated <time datetime="${g.updated}">${niceDate(g.updated)}</time>` : ''}${g.prompt ? ' · <a href="#prompt">Jump to the prompt ↓</a>' : ''}</p></div></header>
<div class="wrap narrow"><article class="article prose">${decorateInlinePrompts(g.body)}${g.prompt ? promptBlock(g.prompt, 'A prompt to help you do this') : ''}<h2>Sources</h2>${sourceList(g.sources)}</article></div>
${more.length ? `<section class="band-soft"><div class="wrap section"><h2>Keep reading</h2><div class="grid">${more.map(guideCard).join('')}</div></div></section>` : ''}
${signup('guide-signup')}`,
  });
}

// ---------- Start, at work, guided paths, little things ----------
const stepsHtml = (steps) => `<ol class="steps">${steps.map((s) => `<li><h2>${esc(s.title)}</h2>${s.paras.map((p) => `<p>${esc(p)}</p>`).join('')}${linkList(s.links)}</li>`).join('')}</ol>`;
const nextHtml = (items) => `<ul class="next-list">${items.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul>`;
const thingLinks = (slugs) => linkList(slugs.map((slug) => ({ href: `/little-things#thing-${slug}`, label: littleThings.find((t) => t.slug === slug).title })));

page({
  path: '/start', title: startGuide.title, description: startGuide.description, type: 'article',
  lastmod: ADDED, published: ADDED, modified: ADDED,
  jsonld: [crumbsLd([['Home', '/'], ['Start here', '/start']]), articleLd({ headline: startGuide.title, description: startGuide.description, path: '/start', added: ADDED, extra: { citation: startGuide.sources.map((k) => sources[k].url) } })],
  body: `<header class="article-hero"><div class="wrap narrow">${crumbsHtml([['Home', '/'], ['Start here', '/start']])}<p class="eyebrow">About five minutes</p><h1 class="display-s">${esc(startGuide.title)}</h1><p class="lede">${esc(startGuide.lede)}</p><p class="meta"><a href="/get-done">I already know the task</a> · <a href="/at-work">This is for work</a></p></div></header>
<div class="wrap narrow"><article class="article">
${stepsHtml(startGuide.steps)}
${promptBlock(goalPrompt({ thing: startGuide.promptThing }), 'Your first prompt')}
<h2 id="safety">${esc(startGuide.safetyTitle)}</h2>
<div class="safety">${startGuide.safety.map((s) => `<article><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></article>`).join('')}</div>
<h2 id="next">Now pick something real</h2>
<p>These are ordinary jobs at home: letters, money admin and job hunting. Each one has a longer guide, a prompt and the sources.</p>
${linkList(startGuide.more)}
<p><a href="/newsletter">Or get one useful idea by email</a>. The newsletter is optional. This page is enough to start.</p>
${wantMore}
<h2 id="sources">Sources</h2>${sourceList(startGuide.sources)}
</article></div>${signup('start-signup')}`,
});

page({
  path: '/at-work', title: atWorkGuide.title, description: atWorkGuide.description, type: 'article',
  lastmod: ADDED, published: ADDED, modified: ADDED,
  jsonld: [crumbsLd([['Home', '/'], ['AI at work', '/at-work']]), articleLd({ headline: atWorkGuide.title, description: atWorkGuide.description, path: '/at-work', added: ADDED, extra: { citation: atWorkGuide.sources.map((k) => sources[k].url) } })],
  body: `<header class="article-hero"><div class="wrap narrow">${crumbsHtml([['Home', '/'], ['AI at work', '/at-work']])}<p class="eyebrow">Your first week</p><h1 class="display-s">${esc(atWorkGuide.title)}</h1><p class="lede">${esc(atWorkGuide.lede)}</p>
<p class="meta">Jump to a job: ${goals.filter((g) => g.audience === 'work').map((g) => `<a href="/get-done/${g.slug}">${esc(g.title)}</a>`).join(' · ')}</p></div></header>
<div class="wrap narrow"><article class="article">
<h2 id="allowed">Check what your employer allows</h2>
<ul>${atWorkGuide.checks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2 id="dont-paste">What not to paste</h2>
<p>When you are unsure, use a made-up example and say that it is fake. The longer version is <a href="/guides/protecting-data-when-using-ai">keeping data safe when you use AI tools</a>.</p>
<ul>${atWorkGuide.avoid.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2 id="quick-wins">Five quick wins</h2>
<p>Each of these already has a full page: the tools, a prompt and the sources. Try one, not all five.</p>
<ol class="wins">${atWorkGuide.wins.map((w) => `<li><a href="${esc(w.href)}">${esc(w.title)}</a>. ${esc(w.text)}</li>`).join('')}</ol>
<h2 id="try-one">Try one email in two minutes</h2>
<p>Use an email you are allowed to share, or rewrite a made-up one. The brackets are the only part you fill in.</p>
${promptBlock(goalPrompt({ thing: atWorkGuide.promptThing }), 'A prompt you can use today')}
<h2 id="thirty-minutes">Got an idea? Test it in 30 minutes</h2>
<p>This is a small test, not a business case. You are looking for “useful enough to try again”, and for what went wrong.</p>
<ol class="steps steps-tight">${atWorkGuide.thirty.map((x) => `<li><p>${esc(x)}</p></li>`).join('')}</ol>
<h2 id="guides">Guides that already fit this</h2>
${linkList(atWorkGuide.guides)}
<p><a href="/use-cases">Or browse ideas by job</a>.</p>
${wantMore}
<h2 id="sources">Sources</h2>${sourceList(atWorkGuide.sources)}
</article></div>${signup('work-signup')}`,
});

page({
  path: '/get-done', title: 'What do you want to get done?',
  description: 'Pick a small job, at work or at home, and get a first prompt, what a good result looks like, and a next step.',
  lastmod: ADDED,
  jsonld: [crumbsLd([['Home', '/'], ['What do you want to get done?', '/get-done']]), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'What do you want to get done?', description: 'Pick a small job, at work or at home, and get a first prompt, what a good result looks like, and a next step.', inLanguage: 'en-GB', url: `${SITE}/get-done`, isPartOf: { '@id': WEBSITE_ID }, mainEntity: { '@type': 'ItemList', itemListElement: goals.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/get-done/${g.slug}`, name: g.title })) } }],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['What do you want to get done?', '/get-done']])}
<p class="eyebrow">A short path</p><h1 class="display-s">What do you want to get done?</h1>
<p class="lede">Pick the closest job. You get a first thought, a prompt to copy, what a good result looks like, and one next step. The prompts are free. A pack is only for later, if you want a bigger kit.</p>
${goalPicker()}
<p class="more-row"><a href="/little-things">Or copy a little useful thing</a> · <a href="/start">I’m new to the tools</a> · <a href="/at-work">This is for work</a></p>
${wantMore}
</section>`,
});

for (const g of goals) {
  const crumbs = [['Home', '/'], ['What do you want to get done?', '/get-done'], [g.title, `/get-done/${g.slug}`]];
  page({
    path: `/get-done/${g.slug}`, title: g.title, description: g.lede, type: 'article',
    lastmod: ADDED, published: ADDED, modified: ADDED,
    jsonld: [crumbsLd(crumbs), articleLd({ headline: g.title, description: g.lede, path: `/get-done/${g.slug}`, added: ADDED, extra: { citation: g.sources.map((k) => sources[k].url) } })],
    body: `<header class="article-hero"><div class="wrap narrow">${crumbsHtml(crumbs)}<p class="eyebrow">${esc(audLabel[g.audience])}</p><h1 class="display-s">${esc(g.title)}</h1><p class="lede">${esc(g.lede)}</p></div></header>
<div class="wrap narrow"><article class="article">
<h2 id="thought">First thought</h2><p>${esc(g.thought)}</p>
${promptBlock(goalPrompt(g), 'First prompt')}
<h2 id="good">What good looks like</h2><ul>${goalGood(g).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2 id="next">Next step</h2>${nextHtml(g.next)}
<h2 id="also">Other small things that help</h2>${thingLinks(g.also)}
${wantMore}
<h2 id="sources">Sources</h2>${sourceList(g.sources)}
</article></div>`,
  });
}

page({
  path: '/little-things', title: 'Little useful things to copy',
  description: `${littleThings.length} short, free prompts you can copy: emails, notes, plans, decisions, meals and a few you may not have thought of.`,
  lastmod: ADDED,
  jsonld: [crumbsLd([['Home', '/'], ['Little useful things', '/little-things']]), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Little useful things to copy', description: `${littleThings.length} short prompts you can copy for work and home.`, inLanguage: 'en-GB', url: `${SITE}/little-things`, isPartOf: { '@id': WEBSITE_ID }, mainEntity: { '@type': 'ItemList', itemListElement: littleThings.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/little-things#thing-${t.slug}`, name: t.title })) } }],
  body: `<section class="wrap narrow section">${crumbsHtml([['Home', '/'], ['Little useful things', '/little-things']])}
<p class="eyebrow">Free to copy</p><h1 class="display-s">Little useful things</h1>
<p class="lede">Short prompts for one job. Copy one, fill in the highlighted brackets, and edit the result. A good answer is a draft you can check, including the surprising ones: a week from a messy list, three lines from a rambling email, questions before a call you are dreading.</p>
<div class="filters" data-filter-for="things-grid" role="group" aria-label="Filter by where you are"><button class="chip active" type="button" aria-pressed="true" data-filter="all">All</button><button class="chip" type="button" aria-pressed="false" data-filter="work">Work</button><button class="chip" type="button" aria-pressed="false" data-filter="home">Home</button></div>
<ul class="jump">${littleThings.map((t) => `<li><a href="#thing-${t.slug}">${esc(t.title)}</a></li>`).join('')}</ul>
<div id="things-grid" class="stack">${littleThings.map((t) => `<article class="thing" id="thing-${t.slug}" data-aud="${t.audience}">
<span class="tag">${esc(audLabel[t.audience])}</span>
<h2>${esc(t.title)}</h2>
<h3>Why this works</h3>
<p>${esc(t.why)}</p>
${promptBlock(t.prompt, 'Copy this prompt', `prompt-${t.slug}`)}
<h3>What good looks like</h3>
<ul>${t.good.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h3>Sources</h3>${sourceList(t.sources)}
</article>`).join('')}</div>
${wantMore}
</section>`,
});

// ---------- ROI calculator ----------
page({
  path: '/roi-calculator', title: 'Free AI ROI calculator',
  description: 'Work out the monthly saving and payback period of an AI tool or agent from hours saved, team size, hourly cost, tool cost and set-up time.',
  jsonld: [crumbsLd([['Home', '/'], ['ROI calculator', '/roi-calculator']]), { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'AI ROI calculator', applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' }, url: SITE + '/roi-calculator' }],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['ROI calculator', '/roi-calculator']])}
<p class="eyebrow">Free tool</p><h1 class="display-s">AI ROI calculator</h1><p class="lede">A quick, honest estimate of whether an AI use case pays back. Everything runs in your browser and nothing is stored or sent.</p>
<div class="calc">
<form id="roi" class="calc-form" novalidate>
<label>Hours saved per person per week<input type="number" name="hours" min="0" step="0.5" value="3"></label>
<label>Number of people<input type="number" name="people" min="0" step="1" value="4"></label>
<label>Hourly cost per person (£, include employer costs)<input type="number" name="rate" min="0" step="1" value="30"></label>
<label>Tool cost per month (£, all seats and usage)<input type="number" name="tool" min="0" step="1" value="150"></label>
<label>One-off set-up time (hours: configuring, testing, training)<input type="number" name="setup" min="0" step="1" value="20"></label>
<label>Ongoing review time per month (hours spent checking AI output)<input type="number" name="review" min="0" step="1" value="4"></label>
<label>Share of saved time that is genuinely redeployed (%)<input type="number" name="redeploy" min="0" max="100" step="5" value="70"></label>
</form>
<div class="calc-out" aria-live="polite">
<div class="metric"><span>Gross time saved per month</span><strong id="o-hours">–</strong></div>
<div class="metric"><span>Value of redeployed time per month</span><strong id="o-value">–</strong></div>
<div class="metric"><span>Monthly cost (tool + review time)</span><strong id="o-cost">–</strong></div>
<div class="metric big"><span>Net monthly saving</span><strong id="o-net">–</strong></div>
<div class="metric"><span>One-off set-up cost</span><strong id="o-setup">–</strong></div>
<div class="metric big"><span>Payback period</span><strong id="o-payback">–</strong></div>
<div class="metric"><span>First-year net return</span><strong id="o-year">–</strong></div>
</div></div>
<div class="callout warn"><strong>Time saved only counts if it’s redeployed.</strong> Hours saved are a financial return only if they go into other valuable work or avoid a real cost (overtime, a hire, a contractor). Small savings scattered across many people often vanish, so set the “redeployed” percentage honestly.</div>
<h2>How it’s calculated</h2>
<ul class="small">
<li>Monthly hours = hours per person per week × people × 52 ÷ 12.</li>
<li>Value = monthly hours × hourly cost × redeployed %.</li>
<li>Monthly cost = tool cost + review hours × hourly cost.</li>
<li>Payback (months) = set-up hours × hourly cost ÷ net monthly saving.</li>
</ul>
<p>Not sure what to measure? Read <a href="/guides/measuring-ai-roi">how to tell whether an AI use case pays back</a>.</p>
</section>`,
});

// ---------- Newsletter ----------
page({
  path: '/newsletter', title: 'Newsletter: one useful AI use case a week',
  description: 'Join the waiting list for a short weekly email with one practical AI use case, tools, a prompt and how to measure ROI.',
  body: `<section class="wrap narrow section"><p class="eyebrow">Newsletter</p><h1 class="display-s">The weekly use case</h1><p class="lede">One useful AI idea each week. The job, the tools, a prompt you can copy, and how to tell if it pays back. Short, specific, and sourced.</p>
<ul><li>No hype, no “10 tools that will change your life”.</li><li>Sponsored items, when we have them, will always be clearly labelled.</li><li>Unsubscribe in one click.</li></ul></section>${signup('nl-signup')}`,
});

// ---------- Packs ----------
const buyNote = `<p class="buy-note">By buying you agree to immediate access to this digital download and that you lose your 14-day right to cancel once the download starts. Packs are sold by ${COMPANY}. Payments are processed securely by Stripe. <a href="/terms#right-to-cancel">Terms</a></p>`;
const waiver = `<p class="fine-print"><strong>Before you buy:</strong> packs are digital downloads you get straight after payment. By buying you agree to immediate access and that you lose your 14-day right to cancel once the download starts (Consumer Contracts Regulations 2013). This doesn’t affect your rights if a pack is faulty or not what you ordered. Packs are sold by ${COMPANY}. Prices are shown in pounds sterling (GBP). The price shown is the total payable, unless checkout states otherwise. Payments are processed securely by Stripe. See our <a href="/terms#right-to-cancel">terms</a>.</p>`;
page({
  path: '/packs', title: PACKS_ON_SALE ? 'Packs for one job, one-off payment' : 'Packs for one job (coming soon)',
  description: 'Optional kits for one job: more prompts, templates and checklists. One-off payment, no subscription. The free pages work without a pack.',
  // Product + Offer only when the packs are really on sale, and only with facts shown on the page (name, description, price).
  jsonld: [crumbsLd([['Home', '/'], ['Packs', '/packs']]), ...(PACKS_ON_SALE ? packs.map((p) => ({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.blurb, image: SITE + OG_IMAGE.url, brand: { '@type': 'Brand', name: NAME }, category: 'Digital download', offers: { '@type': 'Offer', url: `${SITE}/packs`, price: p.price.replace(/[^0-9.]/g, ''), priceCurrency: 'GBP', availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition' } })) : [])],
  body: `<section class="wrap narrow section">${PACKS_ON_SALE ? '' : '<span class="tag">Coming soon</span>'}<h1 class="display-s">Packs for one job</h1>
<p class="lede">This page is the optional bit. You can try an idea with the free prompts first. A pack is the longer kit for one job: more prompts, templates and checklists. The Investment Ops pack is the only one with a worksheet for a business case.</p>
<p>Next: read what a pack includes, then use Buy now if you want it. You’ll get the files by email.</p>
<p class="billing-note">${ONE_OFF}</p>
<div class="grid packs">${packs.map((p) => `<div class="card pack reveal" id="pack-${esc(p.slug)}"><h3>${esc(p.name)}</h3><div class="pack-offer"><p class="price">${esc(p.price)}</p><p class="billing-note">${ONE_OFF}</p>${PACKS_ON_SALE ? `<a class="btn" data-pack-buy href="${esc(p.url)}" rel="noopener">Buy now</a>` : '<span class="btn btn-disabled" aria-disabled="true">Coming soon</span>'}</div>${PACKS_ON_SALE ? buyNote : ''}<p>${esc(p.blurb)}</p></div>`).join('')}</div>
${PACKS_ON_SALE ? waiver : '<p>Prices are provisional and nothing is on sale yet. Want first access? <a href="/newsletter">Join the waiting list</a>.</p>'}
<p class="muted">Packs are sold by ${COMPANY}. Payments are processed securely by Stripe. We never see your card details. After you pay, you’ll come back to <a href="/thanks">a short thank-you page</a>. The download link arrives by email.</p></section>`,
});

// ---------- Thank you (Stripe Payment Links redirect here) ----------
page({
  path: '/thanks', title: 'Your pack is on its way',
  description: 'You’ve paid for a pack. The download link goes to the email you used at checkout. It can take a couple of minutes, and the link works for 7 days.',
  lastmod: ADDED,
  jsonld: [crumbsLd([['Home', '/'], ['Your pack', '/thanks']])],
  body: `<section class="wrap narrow section">${crumbsHtml([['Home', '/'], ['Your pack', '/thanks']])}
<p class="eyebrow">After you pay</p>
<h1 class="display-s">Your pack is on its way</h1>
<p class="lede">This is the page you land on after checkout. Your files aren’t on this page. They arrive by email, so we know they reached the address you typed.</p>
<p class="billing-note">${ONE_OFF} We won’t charge you again for this pack.</p>
<h2>What to do next</h2>
<ol class="steps">
<li><h2>Check your inbox</h2><p>Look for a message to the address you used at checkout. Give it a couple of minutes, and check spam if it’s quiet.</p></li>
<li><h2>Download the zip</h2><p>The link in that email works for 7 days. If it expires, email ${SUPPORT} with your order reference and we’ll send a new one.</p></li>
<li><h2>Tell us if the file is wrong</h2><p>If it won’t open, or it isn’t the pack you ordered, email ${SUPPORT}. We’ll fix it, send the right file, or refund you.</p></li>
</ol>
<p>If you paid by a method that takes time to clear, the email goes out when the payment clears, not the moment you click pay.</p>
<div class="callout"><strong>While you wait.</strong> The free prompts are still there. <a href="/start">Start here</a> if you’re new, or <a href="/at-work">the first week at work</a> if that’s you. <a href="/little-things">Copy a small prompt</a>.</div>
<p class="fine-print">Packs are digital downloads from ${COMPANY}. By buying, you agreed to immediate access, and you lose the 14-day right to cancel once the download starts (Consumer Contracts Regulations 2013). That doesn’t affect your rights if a pack is faulty or not what you ordered. <a href="/terms#right-to-cancel">Terms</a>.</p>
</section>`,
});

// ---------- Terms ----------
page({
  path: '/terms', title: 'Terms of sale',
  description: 'Terms of sale for AIForThisJob digital packs: who sells them, how payment works, your cancellation rights and what to do if something’s wrong.',
  body: `<section class="wrap narrow section prose"><h1>Terms of sale</h1>
<p class="muted">Last updated ${LEGAL_UPDATED}.</p>
<h2>Who we are</h2><p>${NAME} is run by ${COMPANY}, ${COMPANY_ADDRESS} (Services Licence number ${COMPANY_LICENCE}). Packs are sold by ${COMPANY}. In these terms, “we” and “us” mean ${COMPANY}. Contact: ${SUPPORT}.</p>
<h2>Your legal rights</h2><p>If you buy as a consumer, nothing in these terms takes away or limits your legal rights. If you live in the UK, that includes your rights under the Consumer Rights Act 2015 and the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013.</p>
<h2>What you’re buying</h2><p>Packs are digital content (documents and files) for your own use within your organisation. Please don’t resell or republish them.</p>
<h2>Price and payment</h2><p>Prices are shown in pounds sterling (GBP). The price shown is the total payable, unless checkout states otherwise. Packs are sold by ${COMPANY}. Payments are processed securely by Stripe.</p>
<h2 id="right-to-cancel">Digital downloads and your right to cancel</h2><p>Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 you normally have 14 days to cancel an online purchase. Packs are digital downloads that you can access straight after payment. By buying a pack you agree to get immediate access to it, and you accept that you lose your 14-day right to cancel once the download starts. We say this next to every Buy button and repeat it in your delivery email.</p>
<p>This doesn’t affect your other rights. If a file is faulty, won’t open, or isn’t the pack you ordered, email ${SUPPORT} and we’ll fix it, send the right file or refund you.</p>
<h2>If something’s wrong</h2><p>Under the Consumer Rights Act 2015, digital content must be of satisfactory quality, fit for purpose and as described. If a pack isn’t, email ${SUPPORT} and we’ll fix it, replace it or refund you.</p>
<h2>Lost or expired download link</h2><p>Download links last 7 days. If yours has expired, email ${SUPPORT} with your order reference and we’ll send a new one.</p>
<h2>No professional advice</h2><p>Packs are practical templates, not financial, legal, regulatory or professional advice. Check anything important against your own organisation’s policies.</p>
<h2>Complaints and disputes</h2><p>If you’re unhappy, please email ${SUPPORT} first and we’ll try to put it right. If you’re a consumer, you keep the protection of the mandatory consumer laws of the country where you live. If you live in the UK, you can bring a claim in the courts of the part of the UK where you live.</p>
<h2>Your personal data</h2><p>Our <a href="/privacy">privacy notice</a> explains what we collect when you buy a pack and how we use it.</p></section>`,
});

// ---------- About ----------
page({
  path: '/about', title: 'About AIForThisJob',
  description: 'Why AIForThisJob exists: to help people pick the right AI tool for a real job and measure honestly whether it pays back.',
  body: `<section class="wrap narrow section prose"><h1>About ${NAME}</h1>
<p class="lede">Lots of people are being told to “use AI” without being told what for, which tool, or how to know whether it worked.</p>
<p>${NAME} is an independent library of practical AI use cases organised by job and industry, written for UK readers. Each one explains what AI really does, which kinds of tools to look at, what you need in place first, a ready-to-use prompt, and how to measure the return.</p>
<h2 id="how-we-work">How we research and check playbooks</h2>
<p>Each playbook starts from the job, not the tool. We read the public sources listed at the bottom of every page (regulators, government guidance, independent research and vendor documentation), note what the evidence does and doesn’t show, and write down what you need in place before you start. Every page shows the date it was added and, when it changes, the date it was updated.</p>
<h2>Our rules</h2>
<ul><li><strong>Sources on everything.</strong> Every playbook links to public sources.</li>
<li><strong>No invented statistics.</strong> If we can’t source a number, we don’t use it.</li>
<li><strong>Vendor claims are labelled</strong> as vendor claims.</li>
<li><strong>Human checked.</strong> We use AI to help research and draft; a person reviews before anything is published.</li>
<li><strong>No confidential information.</strong> Industry playbooks use public information only.</li></ul>
<p>Nothing here is financial, legal, regulatory or professional advice. Check anything important with a qualified adviser and your own organisation’s policies.</p>
<h2>Contact</h2><p>Questions, corrections or a use case you’d like covered: email ${SUPPORT}.</p></section>`,
  jsonld: [crumbsLd([['Home', '/'], ['About', '/about']]), { '@context': 'https://schema.org', '@type': 'AboutPage', name: `About ${NAME}`, url: SITE + '/about', inLanguage: 'en-GB', isPartOf: { '@id': WEBSITE_ID }, about: { '@id': ORG_ID } }, orgLd],
});

// ---------- Disclosure ----------
page({
  path: '/disclosure', title: 'Sponsor and affiliate disclosure',
  description: 'How AIForThisJob makes money and how we label sponsored content and affiliate links.',
  body: `<section class="wrap narrow section prose"><h1>Sponsor and affiliate disclosure</h1>
<p><strong>Current status:</strong> we have no sponsors, paid listings or affiliate links at the moment. Tools are mentioned because they fit the job.</p>
<h2>How we plan to make money</h2>
<ul><li><strong>Paid packs</strong> of ready-to-use prompts, templates and checklists.</li>
<li><strong>Affiliate links:</strong> some tool links may earn us a commission if you sign up. This won’t change what you pay.</li>
<li><strong>Sponsorships and featured listings</strong> in the newsletter and directory.</li></ul>
<h2>Our promises</h2>
<ul><li>Sponsored content and paid listings will be labelled “Sponsored” or “Ad”, in line with UK advertising rules (CAP Code).</li>
<li>Affiliate links will be marked as affiliate links.</li>
<li>Payment never buys a recommendation in a use-case playbook, and sponsors don’t see or edit our editorial content.</li></ul></section>`,
});

// ---------- Privacy ----------
page({
  path: '/privacy', title: 'Privacy notice',
  description: 'How AIForThisJob uses personal data: newsletter sign-ups, pack purchases, support emails and hosting logs, who helps us, and your rights under UK GDPR.',
  body: `<section class="wrap narrow section prose"><h1>Privacy notice</h1>
<p class="muted">Last updated ${LEGAL_UPDATED}.</p>
<h2>Who we are</h2><p>${NAME} is run by ${COMPANY}, ${COMPANY_ADDRESS}. Packs are sold by ${COMPANY}. We are the controller of the personal data described here, which means we decide how it’s used. For anything about your data, email ${SUPPORT}.</p>
<h2>What we collect and why</h2>
<ul><li><strong>Newsletter.</strong> If you enter your email address, we send you one email asking you to confirm. We don’t store your address until you click the link in it, and the link stops working after 48 hours. Once you confirm, we keep your address on our mailing list with our email provider, Resend, and use it only to send the newsletter. Every newsletter has a one-click unsubscribe link. <em>Lawful basis: your consent, which you can withdraw at any time by unsubscribing.</em></li>
<li><strong>Buying a pack.</strong> Packs are sold by ${COMPANY}. Stripe processes the payment for us and handles your card details; we never see them. Stripe shares the order details with us, such as your name, email address, country and what you bought. We use your email address to send your download link and your order details to help with support and to keep the business and tax records the law requires. <em>Lawful basis: to deliver what you bought (contract), and to meet our legal obligations for records.</em></li>
<li><strong>Emails to support.</strong> If you email ${SUPPORT_EMAIL}, we receive your email address and whatever you write, and use them to reply and keep a record of what we agreed. <em>Lawful basis: our legitimate interest in answering you, or to deliver what you bought if it’s about an order.</em></li>
<li><strong>Hosting logs.</strong> Like any website, our host records technical data such as IP addresses, browser type and the pages requested, to deliver the site and keep it secure. <em>Lawful basis: our legitimate interest in running a secure website.</em></li>
<li><strong>ROI calculator.</strong> It runs entirely in your browser. Nothing you enter is sent to us.</li>
<li><strong>Cookies.</strong> We don’t set any cookies, and we don’t use analytics, advertising or tracking tools.</li></ul>
<p>We don’t sell your data, and we don’t use it for automated decisions about you.</p>
<h2>Who helps us</h2>
<p>We use these service providers, who process data for the purposes above:</p>
<ul><li><strong>Stripe</strong> as payment processor for ${COMPANY}, to take checkout payments. Stripe is not the seller of the packs. It uses your payment details under <a href="https://stripe.com/privacy" rel="noopener">its own privacy policy</a>.</li>
<li><strong>Resend</strong> to send the newsletter, confirmation emails and download emails, and to hold the mailing list.</li>
<li><strong>Vercel</strong> to host the website and store the pack files.</li>
<li><strong>ImprovMX</strong> to forward emails sent to ${SUPPORT_EMAIL} to our mailbox.</li></ul>
<h2>Sending data outside the UK</h2><p>${COMPANY} is based in the United Arab Emirates, and some of our service providers are based in the United States or process data there. When personal data leaves the UK, we rely on the safeguards in our providers’ data protection terms, such as contract clauses approved for transfers out of the UK. Email ${SUPPORT} if you’d like more detail.</p>
<h2>How long we keep it</h2>
<ul><li><strong>Newsletter:</strong> while you’re subscribed. If you unsubscribe, we may keep a record that you did, so we don’t email you again. Ask us if you want your address deleted completely.</li>
<li><strong>Confirmation links:</strong> work for 48 hours. <strong>Download links:</strong> work for 7 days.</li>
<li><strong>Orders and support emails:</strong> for as long as we need them for support and for the business and tax records the law requires.</li>
<li><strong>Hosting logs:</strong> for the limited period our host keeps them.</li></ul>
<h2>Your rights</h2><p>Under UK data protection law (UK GDPR) you have the right to ask for a copy of your data, to have it corrected or deleted, to restrict or object to how we use it, to have it moved to another service, and to withdraw your consent at any time. Email ${SUPPORT} and we’ll reply within one month.</p>
<h2>Complaints</h2><p>If you’re unhappy with how we’ve handled your data, please tell us first at ${SUPPORT}. You also have the right to complain to the UK regulator, the <a href="https://ico.org.uk/make-a-complaint/" rel="noopener">Information Commissioner’s Office (ICO)</a>.</p>
<h2>Changes</h2><p>If we change how we use your data, we’ll update this notice and the date at the top.</p></section>`,
});

// ---------- 404 ----------
// Full site chrome so visitors can carry on; always noindex and never in the sitemap.
page({
  path: '/404', file: '404.html', noindex: true, sitemap: false, title: 'Page not found',
  description: 'That page doesn’t exist. Browse the AI use-case library or start from the home page.',
  body: `<section class="wrap narrow section"><p class="eyebrow">404</p><h1 class="display-s">Page not found</h1><p class="lede">That page doesn’t exist (yet).</p>
<ul><li><a href="/start">Start here</a></li><li><a href="/at-work">AI at work</a></li><li><a href="/get-done">What do you want to get done?</a></li><li><a href="/use-cases">Ideas by job</a></li>${sections.map((x) => `<li><a href="/${x.slug}">${esc(x.name)}</a></li>`).join('')}<li><a href="/guides">Guides</a></li><li><a href="/">Home</a></li></ul>
<p class="muted">If you followed a link here from our site, please tell us: ${SUPPORT}.</p></section>`,
});

// ---------- robots, sitemap, llms.txt ----------
// Launch policy: search engines and AI answer engines (which cite and link back) are welcome.
// AI-training crawlers are allowed too by default (set AI_TRAINING=0 to opt out); this never affects Google Search
// ranking or AI Overviews, which are controlled by Googlebot alone. /api/ is server endpoints, not content.
const AI_TRAINING = process.env.AI_TRAINING !== '0';
const searchBots = ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Applebot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
const trainingBots = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent'];
write('robots.txt', PREVIEW
  ? `# Preview version: not yet launched\nUser-agent: *\nDisallow: /\n`
  : `# ${NAME}: crawling policy
# Search and AI answer engines: welcome.
${searchBots.map((b) => `User-agent: ${b}`).join('\n')}
Allow: /
Disallow: /api/

# AI training crawlers: ${AI_TRAINING ? 'allowed' : 'not allowed'}.
${trainingBots.map((b) => `User-agent: ${b}`).join('\n')}
${AI_TRAINING ? 'Allow: /\nDisallow: /api/' : 'Disallow: /'}

User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ path: p, lastmod }) => `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc>${lastmod ? `<lastmod>${day(lastmod)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`);
write('llms.txt', `# ${NAME}

> A free, UK-based library of practical AI use cases organised by job and industry. Each entry gives the job, what AI does, tool types and named example tools, prerequisites (data and controls), how to measure ROI, a ready-to-use prompt and public sources. Vendor claims are labelled; no statistics are invented.

## Start here
- [New to AI](${SITE}/start): ${startGuide.lede}
- [Just been given AI at work](${SITE}/at-work): ${atWorkGuide.lede}
- [What do you want to get done?](${SITE}/get-done): pick one job and get a first prompt, what good looks like, and a next step.
${goals.map((g) => `- [${g.title}](${SITE}/get-done/${g.slug}): ${g.lede}`).join('\n')}
- [Little useful things](${SITE}/little-things): ${littleThings.length} short prompts you can copy, for work and for home.

## Sections
${sections.map((x) => `- [${x.name}](${SITE}/${x.slug}): ${x.intro}`).join('\n')}
- [Latest additions](${SITE}/latest): every new use case and guide, newest first. RSS: ${SITE}/feed.xml

Note on "Make money with AI": entries describe effort, start-up cost and rules (HMRC, ASA). They make no income promises and contain no earnings figures.

## Use cases
${useCases.map((u) => `- [${u.title}](${SITE}/use-cases/${u.slug}): ${u.summary}`).join('\n')}

## Guides
${guides.map((g) => `- [${g.title}](${SITE}/guides/${g.slug}): ${g.summary}`).join('\n')}

## Tools
- [AI ROI calculator](${SITE}/roi-calculator): monthly saving and payback period from hours saved, people, hourly cost, tool cost and set-up time. Time saved only counts if redeployed.

## Packs
- [Prompt and agent-config packs](${SITE}/packs): paid, ready-to-use kits for specific jobs.

## Optional
- [RSS feed](${SITE}/feed.xml)
- [About](${SITE}/about)
- [Sponsor and affiliate disclosure](${SITE}/disclosure)

Contact: ${SUPPORT_EMAIL}
`);

// ---------- RSS feed ----------
const xml = (t) => esc(t).replace(/'/g, '&apos;');
const rfc822 = (iso) => new Date(iso).toUTCString();
write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${NAME}: latest AI use cases and guides</title>
<link>${SITE}/latest</link>
<atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
<description>New practical AI use cases and guides: make money with AI, save time and money, and use agents safely. Specific, sourced, no invented stats.</description>
<language>en-gb</language>
<lastBuildDate>${rfc822(entries[0].added)}</lastBuildDate>
${entries.map((e) => `<item>
<title>${xml(e.title)}</title>
<link>${SITE}${e.path}</link>
<guid isPermaLink="true">${SITE}${e.path}</guid>
<pubDate>${rfc822(e.added)}</pubDate>
<category>${xml(e.cat)}</category>
<description>${xml(e.summary)}</description>
</item>`).join('\n')}
</channel>
</rss>
`);

// ---------- static assets ----------
const assets = ['styles.css', 'site.js', 'favicon.svg', 'logo.png', 'apple-touch-icon.png', 'og/default.png'];
mkdirSync(join(OUT, 'og'), { recursive: true });
for (const f of assets) copyFileSync(new URL(`./static/${f}`, import.meta.url), join(OUT, f));
files.push(...assets);
console.log(`Built ${files.length} files to dist/ (SITE=${SITE}, PREVIEW=${PREVIEW}, MODE=${PREVIEW ? 'PREVIEW' : 'LAUNCH'})`);
