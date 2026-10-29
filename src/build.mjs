import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { categories, useCases, guides, sources, sections } from './data.mjs';
import { packs as catalogue, SUPPORT_EMAIL } from '../lib/packs.mjs';

const SITE = (process.env.SITE_URL || 'https://www.aiforthisjob.com').replace(/\/$/, ''); // canonical host (apex 308-redirects to www)
const PREVIEW = process.env.PREVIEW !== '0'; // default: preview mode = noindex until Greg approves launch
const OUT = new URL('../dist/', import.meta.url).pathname;
const NAME = 'AIForThisJob';
const SUPPORT = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
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
  ['/make-money-with-ai', 'Make money'],
  ['/save-time-and-money', 'Save time & money'],
  ['/use-agents-safely', 'Use agents safely'],
  ['/use-cases', 'Library'],
  ['/latest', 'Latest'],
  ['/packs', 'Packs'],
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
<meta name="theme-color" content="#fbfbfd" media="(prefers-color-scheme: light)">
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
<nav class="nav-links" aria-label="Main">${navLinks.map(([h, t]) => `<a href="${h}"${isCurrent(h) ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('')}</nav>
<a class="btn btn-sm nav-cta" href="/newsletter">Newsletter</a>
</div>${progress ? '<div class="progress" aria-hidden="true"><span></span></div>' : ''}</header>
<main id="main">${body}</main>
<footer class="site-footer"><div class="wrap footer-grid">
<div class="footer-brand"><a class="logo" href="/"><span class="logo-mark" aria-hidden="true">AI</span><span>ForThisJob</span></a><p class="muted">Which AI for which job, with honest notes on what it takes and whether it pays back. Made in the UK.</p></div>
<div><h2 class="footer-h">Explore</h2>${sections.map((s) => `<a href="/${s.slug}">${esc(s.name)}</a>`).join('')}<a href="/use-cases">All use cases</a><a href="/latest">Latest</a><a href="/roi-calculator">ROI calculator</a></div>
<div><h2 class="footer-h">By job</h2>${categories.map((c) => `<a href="/jobs/${c.slug}">${esc(c.name)}</a>`).join('')}</div>
<div><h2 class="footer-h">About</h2><a href="/about">About</a><a href="/guides">Guides</a><a href="/packs">Packs</a><a href="/newsletter">Newsletter</a><a href="/feed.xml">RSS feed</a><a href="/disclosure">Sponsor and affiliate disclosure</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="mailto:${SUPPORT_EMAIL}">Contact</a></div>
</div><div class="wrap fine">© ${new Date().getFullYear()} ${NAME}. Information only, not financial, legal or professional advice. Product names belong to their owners; no endorsement implied.</div></footer>
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

const card = (u, i = 0) => `<a class="card reveal" style="--i:${i % 6}" href="/use-cases/${u.slug}"><span class="tag">${esc(catBy[u.cat].name)}</span><h3>${esc(u.title)}</h3><p>${esc(u.summary)}</p><span class="more">Read the playbook <span aria-hidden="true">→</span></span></a>`;
const guideCard = (g, i = 0) => `<a class="card reveal" style="--i:${i % 6}" href="/guides/${g.slug}"><span class="tag tag-guide">Guide</span><h3>${esc(g.title)}</h3><p>${esc(g.summary)}</p><span class="more">Read the guide <span aria-hidden="true">→</span></span></a>`;

const signup = (id = 'signup') => `<section class="signup band-dark" id="${id}" aria-labelledby="${id}-h"><div class="wrap signup-inner reveal">
<div><p class="eyebrow">Newsletter</p><h2 id="${id}-h">One useful AI use case a week.</h2><p>A short email with a tested use case, the tools, a ready-to-use prompt and how to tell whether it pays back. No hype.</p></div>
<form class="newsletter-form" novalidate>
<label for="${id}-email" class="sr">Email address</label>
<input id="${id}-email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required>
<input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
<button class="btn" type="submit">Subscribe</button>
<p class="form-note" role="status">We’ll email you a link to confirm. Unsubscribe any time. See our <a href="/privacy">privacy notice</a>.</p>
</form></div></section>`;

const sourceList = (keys) => `<ol class="sources">${keys.map((k) => { const s = sources[k]; return `<li><a href="${s.url}" rel="noopener" target="_blank">${esc(s.title)}</a> <span class="kind">${esc(s.kind)}</span></li>`; }).join('')}</ol>`;

const promptBlock = (text, label = 'Ready-to-use prompt') => `<section class="prompt-block reveal" id="prompt" aria-labelledby="prompt-h">
<h2 id="prompt-h">${esc(label)}</h2>
<p class="muted small">Replace the [BRACKETS]. Only paste data you’re allowed to share with the tool you’re using.</p>
<details class="prompt-details">
<summary><span class="btn btn-sm">View prompt</span><span class="peek">${esc(text.split('\n')[0])}</span></summary>
<div class="prompt-wrap"><button class="copy btn btn-sm btn-ghost" type="button">Copy prompt</button><pre class="prompt"><code>${esc(text)}</code></pre></div>
</details></section>`;

const moneyDisclaimer = `<div class="callout warn disclaimer" role="note"><strong>No income promises.</strong> ${esc(secBy['make-money-with-ai'].disclaimer)}</div>`;

const layers = `<div class="layers" aria-hidden="true"><span class="layer l1" data-speed="0.25"></span><span class="layer l2" data-speed="0.45"></span><span class="layer l3" data-speed="0.65"></span><span class="layer grid-lines" data-speed="0.1"></span></div>`;

// All entries for Latest / RSS (newest first; ties keep later-defined content first)
const entries = [
  ...useCases.map((u, i) => ({ kind: 'Use case', path: `/use-cases/${u.slug}`, title: u.title, summary: u.summary, added: u.added, section: u.section, cat: catBy[u.cat].name, order: i })),
  ...guides.map((g, i) => ({ kind: 'Guide', path: `/guides/${g.slug}`, title: g.title, summary: g.summary, added: g.added, section: g.section, cat: g.section ? secBy[g.section].name : 'Guide', order: 100 + i })),
].sort((a, b) => b.added.localeCompare(a.added) || b.order - a.order);

// ---------- Home ----------
const orgLd = { '@context': 'https://schema.org', '@type': 'Organization', '@id': ORG_ID, name: NAME, url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/logo.png', width: 512, height: 512 }, email: SUPPORT_EMAIL, description: 'An independent, UK-based library of practical AI use cases organised by job and industry.', areaServed: 'GB', contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: SUPPORT_EMAIL, availableLanguage: 'en-GB' } };
const siteLd = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': WEBSITE_ID, name: NAME, url: SITE + '/', inLanguage: 'en-GB', description: 'A free library of AI use cases organised by job and industry.', publisher: { '@id': ORG_ID } };
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
  path: '/', title: `AI use cases by job, with prompts and ROI | ${NAME}`, lastmod: latestOf([...useCases, ...guides]),
  description: 'A free, plain-English library of AI use cases: ways to make money with AI, save time and money, and use agents safely. Each with tools, a ready-to-use prompt and how to measure ROI.',
  jsonld: [orgLd, siteLd], bodyClass: 'home',
  body: `
<section class="hero">${layers}<div class="wrap hero-inner">
<p class="eyebrow">Free AI use-case library</p>
<h1 class="display">The right AI for the job.<br><span class="grad">And proof it pays.</span></h1>
<p class="lede">Plain-English playbooks for real work: what AI actually does, which tools to look at, what you need first, a prompt to copy and how to measure the return.</p>
<div class="hero-cta"><a class="btn btn-lg" href="/use-cases">Browse use cases</a><a class="btn btn-lg btn-ghost" href="/roi-calculator">Work out your ROI</a></div>
<ul class="trust"><li>Sources on every entry</li><li>Vendor claims labelled</li><li>No invented stats</li></ul>
</div></section>
<div class="panels" aria-label="Three ways in">
${sections.map((s, i) => `<section class="panel ${panelTone[s.slug]}" aria-labelledby="panel-${s.slug}"><div class="wrap panel-inner reveal">
<div><p class="eyebrow">${String(i + 1).padStart(2, '0')} · ${esc(s.eyebrow)}</p><h2 class="panel-h" id="panel-${s.slug}">${esc(s.headline)}</h2><p class="lede">${esc(s.intro)}</p><a class="btn" href="/${s.slug}">${esc(s.name)} <span aria-hidden="true">→</span></a></div>
<ul class="panel-list">${sectionExamples[s.slug].map(([h, t]) => `<li><a href="${h}">${esc(t)}<span aria-hidden="true">›</span></a></li>`).join('')}</ul>
</div></section>`).join('\n')}
</div>
<section class="wrap section"><div class="section-head reveal"><h2>Browse by job or industry</h2><a href="/use-cases">See all ${useCases.length} use cases →</a></div>
<div class="grid cats">${categories.map((c, i) => `<a class="cat reveal" style="--i:${i % 6}" href="/jobs/${c.slug}"><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p><span class="count">${((n) => `${n} use case${n === 1 ? '' : 's'}`)(useCases.filter((u) => u.cat === c.slug).length)}</span></a>`).join('')}</div></section>
<section class="band-soft"><div class="wrap section"><div class="section-head reveal"><h2>Just added</h2><a href="/latest">Everything new →</a></div>
<div class="grid">${entries.slice(0, 6).map((e, i) => `<a class="card reveal" style="--i:${i}" href="${e.path}"><span class="tag">${esc(e.cat)}</span><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><span class="more">${e.kind === 'Guide' ? 'Read the guide' : 'Read the playbook'} <span aria-hidden="true">→</span></span></a>`).join('')}</div></div></section>
<section class="wrap section"><div class="section-head reveal"><h2>Popular playbooks</h2></div><div class="grid">${['draft-customer-email-replies', 'automate-repetitive-workflows', 'vibe-code-an-internal-tool', 'reconciliation-break-investigation', 'meeting-notes-and-actions', 'repurpose-content-into-social-posts'].map((s, i) => card(useCases.find((u) => u.slug === s), i)).join('')}</div></section>
<section class="wrap section"><div class="section-head reveal"><h2>New to agents and prompting? Start here</h2><a href="/guides">All guides →</a></div><div class="grid">${guides.filter((g) => !g.section).map(guideCard).join('')}</div></section>
${signup('home-signup')}`,
});

// ---------- Section index pages ----------
const sectionTitles = {
  'make-money-with-ai': 'Make money with AI: side-income ideas, effort and UK rules',
  'save-time-and-money': 'Save time and money with AI: use cases with ROI',
  'use-agents-safely': 'Use AI agents safely: permissions, testing and policy',
};
for (const s of sections) {
  const ucs = useCases.filter((u) => u.section === s.slug);
  const gds = guides.filter((g) => g.section === s.slug);
  const items = [...gds.map((g) => ({ url: `/guides/${g.slug}`, name: g.title })), ...ucs.map((u) => ({ url: `/use-cases/${u.slug}`, name: u.title }))];
  const crumbs = [['Home', '/'], [s.name, `/${s.slug}`]];
  let aside = '';
  if (s.slug === 'make-money-with-ai') aside = moneyDisclaimer;
  if (s.slug === 'save-time-and-money') aside = `<div class="callout"><strong>Does it pay back?</strong> Time saved only counts if it’s redeployed or avoids a real cost. <a href="/roi-calculator">Run your numbers in the ROI calculator</a> or read <a href="/guides/measuring-ai-roi">how to measure AI ROI</a>.</div>`;
  if (s.slug === 'use-agents-safely') aside = `<div class="callout"><strong>The short version.</strong> Give agents only the access they need, have a person approve anything sent, paid or deleted, test on real examples first, and write it down. Each guide comes with a prompt to help you do it.</div>`;
  let lists = '';
  if (gds.length) lists += `<h2 class="list-h">Guides</h2><div class="grid grid-2">${gds.map(guideCard).join('')}</div>`;
  if (ucs.length) {
    const newOnes = ucs.filter((u) => u.added > '2026-10-29T01');
    const rest = ucs.filter((u) => !newOnes.includes(u));
    if (s.slug === 'save-time-and-money' && rest.length) {
      lists += `<h2 class="list-h">New playbooks</h2><div class="grid grid-2">${newOnes.map(card).join('')}</div><h2 class="list-h">More ways to save time</h2><div class="grid grid-2">${rest.map(card).join('')}</div>`;
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
  path: '/use-cases', title: 'AI use-case library: practical AI by job', lastmod: latestOf(useCases),
  description: `${useCases.length} practical AI use cases by job and industry, each with tools, prerequisites, a ready-to-use prompt, ROI measures and sources.`,
  jsonld: [crumbsLd([['Home', '/'], ['Use cases', '/use-cases']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: useCases.map((u, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/use-cases/${u.slug}`, name: u.title })) }],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['Use cases', '/use-cases']])}
<p class="eyebrow">The library</p><h1 class="display-s">AI use-case library</h1><p class="lede">Every playbook follows the same format: the job, what AI does, the tools, what you need first, how to measure it, a prompt to copy and the sources.</p>
<div class="filters" role="group" aria-label="Filter by job"><button class="chip active" type="button" aria-pressed="true" data-filter="all">All</button>${categories.map((c) => `<button class="chip" type="button" aria-pressed="false" data-filter="${c.slug}">${esc(c.name)}</button>`).join('')}</div>
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
  const roiLabel = u.roiLabel || 'How to measure ROI';
  const tocItems = [['what', 'What AI does'], ['tools', 'Tools'], ['first', 'What you need first'], ['measure', roiLabel], ['evidence', 'Evidence'], ['prompt', 'Prompt'], ['sources', 'Sources']];
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
<h2 id="what">What AI actually does here</h2><ul>${u.whatAIDoes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2 id="tools">Tools to look at</h2><ul>${u.tools.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<p class="muted small">Named tools are examples, not endorsements. We have no paid relationships with them at the moment; see our <a href="/disclosure">disclosure</a>.</p>
<h2 id="first">What you need first</h2><ul>${u.needFirst.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2 id="measure">${esc(roiLabel)}</h2><ul>${u.roi.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
${u.section === 'make-money-with-ai' ? '' : '<p><a class="btn btn-ghost btn-sm" href="/roi-calculator">Run the numbers in the ROI calculator →</a></p>'}
<h2 id="evidence">What the evidence says</h2><p>${esc(u.evidence)}</p>
${promptBlock(u.prompt)}
<h2 id="sources">Sources</h2>${sourceList(u.sources)}
<p class="muted small">Last updated <time datetime="${updatedOf(u)}">${niceDate(updatedOf(u))}</time>. Spotted something out of date? Email ${SUPPORT}. <a href="/about#how-we-work">How we research and check playbooks</a>.</p>
</article></div>
${related.length ? `<section class="band-soft"><div class="wrap section"><h2>Related use cases</h2><div class="grid">${related.map(card).join('')}</div></div></section>` : ''}
${signup('uc-signup')}`,
  });
}

// ---------- Guides ----------
page({
  path: '/guides', title: 'Guides to AI agents, prompting, safety and ROI', lastmod: latestOf(guides),
  description: 'Short, practical guides: what an AI agent really is, how to prompt well, how to use agents safely and how to measure whether AI pays back.',
  jsonld: [crumbsLd([['Home', '/'], ['Guides', '/guides']])],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['Guides', '/guides']])}<p class="eyebrow">Guides</p><h1 class="display-s">Guides</h1><p class="lede">Start here if “agents” and “prompting” still feel fuzzy, or if you’re about to give an agent access to real systems.</p>
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
<div class="wrap narrow"><article class="article prose">${g.body}${g.prompt ? promptBlock(g.prompt, 'A prompt to help you do this') : ''}<h2>Sources</h2>${sourceList(g.sources)}</article></div>
${more.length ? `<section class="band-soft"><div class="wrap section"><h2>Keep reading</h2><div class="grid">${more.map(guideCard).join('')}</div></div></section>` : ''}
${signup('guide-signup')}`,
  });
}

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
  description: 'Join the waiting list for a short weekly email with one tested AI use case, tools, a prompt and how to measure ROI.',
  body: `<section class="wrap narrow section"><p class="eyebrow">Newsletter</p><h1 class="display-s">The weekly use case</h1><p class="lede">One practical AI use case each week: the job, the tools, a ready-to-use prompt and how to tell if it pays back. Written in plain English, with sources.</p>
<ul><li>No hype, no “10 tools that will change your life”.</li><li>Sponsored items, when we have them, will always be clearly labelled.</li><li>Unsubscribe in one click.</li></ul></section>${signup('nl-signup')}`,
});

// ---------- Packs ----------
const buyNote = `<p class="buy-note">By buying you agree to immediate access to this digital download and that you lose your 14-day right to cancel once the download starts. Payments are processed by Stripe. <a href="/terms#right-to-cancel">Terms</a></p>`;
const waiver = `<p class="fine-print"><strong>Before you buy:</strong> packs are digital downloads you get straight after payment. By buying you agree to immediate access and that you lose your 14-day right to cancel once the download starts (Consumer Contracts Regulations 2013). This doesn’t affect your rights if a pack is faulty or not what you ordered. Stripe is the seller of record and handles VAT. See our <a href="/terms#right-to-cancel">terms</a>.</p>`;
page({
  path: '/packs', title: PACKS_ON_SALE ? 'AI prompt and agent-config packs for your job' : 'Prompt and agent-config packs (coming soon)',
  description: 'Tested, ready-to-use AI prompt and agent-configuration packs for specific jobs and industries: customer email replies, meeting admin and investment operations.',
  // Product + Offer only when the packs are really on sale, and only with facts shown on the page (name, description, price).
  jsonld: [crumbsLd([['Home', '/'], ['Packs', '/packs']]), ...(PACKS_ON_SALE ? packs.map((p) => ({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.blurb, image: SITE + OG_IMAGE.url, brand: { '@type': 'Brand', name: NAME }, category: 'Digital download', offers: { '@type': 'Offer', url: `${SITE}/packs`, price: p.price.replace(/[^0-9.]/g, ''), priceCurrency: 'GBP', availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition' } })) : [])],
  body: `<section class="wrap narrow section">${PACKS_ON_SALE ? '' : '<span class="tag">Coming soon</span>'}<h1 class="display-s">Prompt and agent-config packs</h1>
<p class="lede">The free library shows you what’s possible. A pack gives you the complete, tested kit for a job: a set of prompts, agent and tool configurations, a business-case worksheet and a checklist of controls.</p>
<div class="grid packs">${packs.map((p) => `<div class="card pack reveal"><h3>${esc(p.name)}</h3><p class="price">${esc(p.price)}</p><p>${esc(p.blurb)}</p>${PACKS_ON_SALE ? `<a class="btn" href="${esc(p.url)}" rel="noopener">Buy now</a>${buyNote}` : '<span class="btn btn-disabled" aria-disabled="true">Coming soon</span>'}</div>`).join('')}</div>
${PACKS_ON_SALE ? waiver : '<p>Prices are provisional and nothing is on sale yet. Want first access? <a href="/newsletter">Join the waiting list</a>.</p>'}
<p class="muted">Payments are processed securely by Stripe. We never see your card details.</p></section>`,
});

// ---------- Terms ----------
page({
  path: '/terms', title: 'Terms of sale',
  description: 'Terms of sale for AIForThisJob digital packs, including your cancellation rights.',
  body: `<section class="wrap narrow section prose"><h1>Terms of sale</h1>
<p class="muted">Draft: to be reviewed before packs go on sale.</p>
<h2>Who we are</h2><p>${NAME} is run from the UK. Contact: ${SUPPORT}.</p>
<h2>What you’re buying</h2><p>Packs are digital content (documents and files) for your own use within your organisation. Please don’t resell or republish them.</p>
<h2>Price and payment</h2><p>Prices are shown in pounds sterling and include any VAT due. Payments are processed by Stripe. Stripe acts as the seller of record through Stripe Managed Payments, which means Stripe sells the pack to you on our behalf and works out, collects and pays any VAT due.</p>
<h2 id="right-to-cancel">Digital downloads and your right to cancel</h2><p>Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 you normally have 14 days to cancel an online purchase. Packs are digital downloads that you can access straight after payment. By buying a pack you agree to get immediate access to it, and you accept that you lose your 14-day right to cancel once the download starts. We say this next to every Buy button and repeat it in your delivery email.</p>
<p>This doesn’t affect your other rights. If a file is faulty, won’t open, or isn’t the pack you ordered, email ${SUPPORT} and we’ll fix it, send the right file or refund you.</p>
<h2>If something’s wrong</h2><p>Under the Consumer Rights Act 2015, digital content must be of satisfactory quality, fit for purpose and as described. If a pack isn’t, email ${SUPPORT} and we’ll fix it, replace it or refund you.</p>
<h2>Lost or expired download link</h2><p>Download links last 7 days. If yours has expired, email ${SUPPORT} with your order reference and we’ll send a new one.</p>
<h2>No professional advice</h2><p>Packs are practical templates, not financial, legal, regulatory or professional advice. Check anything important against your own organisation’s policies.</p></section>`,
});

// ---------- About ----------
page({
  path: '/about', title: 'About AIForThisJob',
  description: 'Why AIForThisJob exists: to help people pick the right AI tool for a real job and measure honestly whether it pays back.',
  body: `<section class="wrap narrow section prose"><h1>About ${NAME}</h1>
<p class="lede">Lots of people are being told to “use AI” without being told what for, which tool, or how to know whether it worked.</p>
<p>${NAME} is a UK-based, independent library of practical AI use cases organised by job and industry. Each one explains what AI really does, which kinds of tools to look at, what you need in place first, a ready-to-use prompt, and how to measure the return.</p>
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
<ul><li><strong>Paid packs</strong> of tested prompts and configurations.</li>
<li><strong>Affiliate links:</strong> some tool links may earn us a commission if you sign up. This won’t change what you pay.</li>
<li><strong>Sponsorships and featured listings</strong> in the newsletter and directory.</li></ul>
<h2>Our promises</h2>
<ul><li>Sponsored content and paid listings will be labelled “Sponsored” or “Ad”, in line with UK advertising rules (CAP Code).</li>
<li>Affiliate links will be marked as affiliate links.</li>
<li>Payment never buys a recommendation in a use-case playbook, and sponsors don’t see or edit our editorial content.</li></ul></section>`,
});

// ---------- Privacy ----------
page({
  path: '/privacy', title: 'Privacy',
  description: 'Privacy basics for AIForThisJob: what we collect (currently nothing) and how that will change at launch.',
  body: `<section class="wrap narrow section prose"><h1>Privacy</h1>
<p class="muted">Basic notice for the preview version. A full privacy policy will be published before we collect any personal data.</p>
<h2>What we collect now</h2>
<ul><li><strong>Newsletter:</strong> if you sign up, we send one confirmation email. Your address is only added to our list once you click the link in it (double opt-in). We store it with our email provider, Resend, and use it only to send the newsletter. Every email has a one-click unsubscribe link.</li>
<li><strong>Purchases:</strong> payments are handled by Stripe, which processes your card and billing details under its own privacy policy. We receive your name, email and what you bought so we can deliver the pack and keep tax records.</li>
<li><strong>ROI calculator:</strong> runs entirely in your browser. Nothing you enter is sent to us.</li>
<li><strong>Cookies:</strong> we set no tracking or advertising cookies.</li>
<li><strong>Hosting logs:</strong> our host (Vercel) may process technical data such as IP addresses to deliver and secure the site.</li></ul>
<h2>When we launch the newsletter</h2>
<p>We’ll collect your email address only with your consent, use it only to send the newsletter, name the email provider we use, and let you unsubscribe at any time. You’ll have your rights under UK GDPR, including access and deletion, and the right to complain to the <a href="https://ico.org.uk/" rel="noopener">Information Commissioner’s Office</a>.</p>
<h2>Contact</h2><p>For privacy questions or to use your rights, email ${SUPPORT}.</p></section>`,
});

// ---------- 404 ----------
// Full site chrome so visitors can carry on; always noindex and never in the sitemap.
page({
  path: '/404', file: '404.html', noindex: true, sitemap: false, title: 'Page not found',
  description: 'That page doesn’t exist. Browse the AI use-case library or start from the home page.',
  body: `<section class="wrap narrow section"><p class="eyebrow">404</p><h1 class="display-s">Page not found</h1><p class="lede">That page doesn’t exist (yet).</p>
<ul><li><a href="/use-cases">Browse all use cases</a></li>${sections.map((x) => `<li><a href="/${x.slug}">${esc(x.name)}</a></li>`).join('')}<li><a href="/guides">Guides</a></li><li><a href="/">Home</a></li></ul>
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
<description>New practical AI use cases and guides: make money with AI, save time and money, and use agents safely. Plain English, sourced, no invented stats.</description>
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
console.log(`Built ${files.length} files to dist/ (SITE=${SITE}, PREVIEW=${PREVIEW})`);
