import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { categories, useCases, guides, sources } from './data.mjs';

const SITE = (process.env.SITE_URL || 'https://aiforthisjob.vercel.app').replace(/\/$/, '');
const PREVIEW = process.env.PREVIEW !== '0'; // default: preview mode = noindex until Greg approves launch
const OUT = new URL('../dist/', import.meta.url).pathname;
const NAME = 'AIForThisJob';
const TODAY = new Date().toISOString().slice(0, 10);
// Stripe Payment Links are public URLs, set per environment in Vercel (test links now, live links at launch).
const packs = [
  { key: 'PACK_LINK_EMAIL', name: 'Customer Email Replies Pack', price: '£19', blurb: 'Reply-drafting prompts for common customer emails, a tone-of-voice template, an FAQ assistant set-up and escalation rules so nothing risky goes out unchecked.' },
  { key: 'PACK_LINK_ADMIN', name: 'Meeting Notes & Admin Pack', price: '£19', blurb: 'Prompts and workflows for meeting notes and actions, inbox triage, receipts and expense categories, plus a simple checklist for what to automate first.' },
  { key: 'PACK_LINK_INVOPS', name: 'Investment Ops AI ROI Pack', price: '£49', blurb: 'Prompts for reconciliation breaks, settlement exceptions (UK T+1) and KYC/onboarding, an ROI business-case worksheet and a governance and controls checklist.' },
].map((p) => ({ ...p, url: (process.env[p.key] || '').trim() }));
const PACKS_ON_SALE = packs.every((p) => /^https:\/\/buy\.stripe\.com\//.test(p.url));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const catBy = Object.fromEntries(categories.map((c) => [c.slug, c]));
const files = [];
const urls = [];

function write(path, content) {
  const p = join(OUT, path);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  files.push(path);
}

function page({ path, title, description, body, jsonld = [], type = 'website' }) {
  const url = SITE + (path === '/' ? '/' : path);
  const fullTitle = path === '/' ? title : `${title} | ${NAME}`;
  urls.push(path);
  const ld = jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');
  const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${PREVIEW ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${NAME}">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css">
${ld}
</head>
<body>
${PREVIEW ? '<div class="preview-bar">Preview version: not yet launched. Content is for review.</div>' : ''}
<header class="site-header"><div class="wrap nav">
<a class="logo" href="/"><span class="logo-mark">AI</span>ForThisJob</a>
<nav aria-label="Main"><a href="/use-cases">Use cases</a><a href="/guides">Guides</a><a href="/roi-calculator">ROI calculator</a><a href="/packs">Packs</a><a class="btn btn-sm" href="/newsletter">Newsletter</a></nav>
</div></header>
<main>${body}</main>
<footer class="site-footer"><div class="wrap footer-grid">
<div><a class="logo" href="/"><span class="logo-mark">AI</span>ForThisJob</a><p class="muted">Which AI tool for which job, with honest notes on what it takes and whether it pays back. Made in the UK.</p></div>
<div><h3>Browse</h3>${categories.map((c) => `<a href="/jobs/${c.slug}">${esc(c.name)}</a>`).join('')}</div>
<div><h3>Learn</h3>${guides.map((g) => `<a href="/guides/${g.slug}">${esc(g.title.split(':')[0].split('?')[0])}</a>`).join('')}<a href="/roi-calculator">ROI calculator</a></div>
<div><h3>About</h3><a href="/about">About</a><a href="/packs">Packs</a><a href="/newsletter">Newsletter</a><a href="/disclosure">Sponsor and affiliate disclosure</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a></div>
</div><div class="wrap fine">© ${new Date().getFullYear()} ${NAME}. Information only, not financial, legal or professional advice. Product names belong to their owners; no endorsement implied.</div></footer>
<script src="/site.js" defer></script>
</body>
</html>`;
  write(path === '/' ? 'index.html' : path.slice(1) + '.html', html);
}

const crumbsLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + p })),
});
const crumbsHtml = (items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([n, p], i) => i === items.length - 1 ? `<span>${esc(n)}</span>` : `<a href="${p}">${esc(n)}</a>`).join(' / ')}</nav>`;

const card = (u) => `<a class="card" href="/use-cases/${u.slug}"><span class="tag">${esc(catBy[u.cat].name)}</span><h3>${esc(u.title)}</h3><p>${esc(u.summary)}</p><span class="more">Read the playbook →</span></a>`;

const signup = (id = 'signup') => `<section class="signup" id="${id}"><div class="wrap signup-inner">
<div><h2>One useful AI use case a week</h2><p>A short email with a tested use case, the tools, a ready-to-use prompt and how to measure whether it pays back. No hype.</p></div>
<form class="newsletter-form" novalidate>
<label for="${id}-email" class="sr">Email address</label>
<input id="${id}-email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required>
<input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
<button class="btn" type="submit">Subscribe</button>
<p class="form-note" role="status">We’ll email you a link to confirm. Unsubscribe any time. See our <a href="/privacy">privacy notice</a>.</p>
</form></div></section>`;

const sourceList = (keys) => `<ol class="sources">${keys.map((k) => { const s = sources[k]; return `<li><a href="${s.url}" rel="noopener" target="_blank">${esc(s.title)}</a> <span class="kind">${esc(s.kind)}</span></li>`; }).join('')}</ol>`;

// ---------- Home ----------
const orgLd = { '@context': 'https://schema.org', '@type': 'Organization', name: NAME, url: SITE + '/', logo: SITE + '/favicon.svg' };
const siteLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: NAME, url: SITE + '/', inLanguage: 'en-GB', description: 'A free library of AI use cases organised by job and industry.' };
page({
  path: '/', title: `${NAME}: which AI tool for which job, and does it pay back?`,
  description: 'A free, plain-English library of AI use cases organised by job and industry: what AI really does, which tools to use, what you need first, a ready-to-use prompt and how to measure ROI.',
  jsonld: [orgLd, siteLd],
  body: `
<section class="hero"><div class="wrap">
<p class="eyebrow">Free AI use-case library</p>
<h1>Find the right AI tool for the job, and know whether it pays back.</h1>
<p class="lede">Plain-English playbooks for real work. Each one covers what AI actually does, which tools to look at, what you need in place first, a ready-to-use prompt and how to measure the return. For small businesses, vibe coders and operations teams.</p>
<div class="hero-cta"><a class="btn" href="/use-cases">Browse use cases</a><a class="btn btn-ghost" href="/roi-calculator">Work out your ROI</a></div>
<ul class="trust"><li>Sources on every entry</li><li>Vendor claims labelled</li><li>No invented stats</li></ul>
</div></section>
<section class="wrap section"><h2>Browse by job or industry</h2>
<div class="grid cats">${categories.map((c) => `<a class="cat" href="/jobs/${c.slug}"><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p><span class="count">${useCases.filter((u) => u.cat === c.slug).length} use cases</span></a>`).join('')}</div></section>
<section class="wrap section"><h2>Popular playbooks</h2><div class="grid">${['draft-customer-email-replies', 'automate-repetitive-workflows', 'vibe-code-an-internal-tool', 'reconciliation-break-investigation', 'meeting-notes-and-actions', 'repurpose-content-into-social-posts'].map((s) => card(useCases.find((u) => u.slug === s))).join('')}</div>
<p><a href="/use-cases">See all ${useCases.length} use cases →</a></p></section>
<section class="wrap section"><h2>Confused by agents and prompting? Start here</h2><div class="grid">${guides.map((g) => `<a class="card" href="/guides/${g.slug}"><span class="tag">Guide</span><h3>${esc(g.title)}</h3><p>${esc(g.summary)}</p></a>`).join('')}</div></section>
${signup('home-signup')}`,
});

// ---------- Use case index ----------
page({
  path: '/use-cases', title: 'AI use-case library',
  description: `${useCases.length} practical AI use cases by job and industry, each with tools, prerequisites, a ready-to-use prompt, ROI measures and sources.`,
  jsonld: [crumbsLd([['Home', '/'], ['Use cases', '/use-cases']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: useCases.map((u, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/use-cases/${u.slug}`, name: u.title })) }],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['Use cases', '/use-cases']])}
<h1>AI use-case library</h1><p class="lede">Every playbook follows the same format: the job, what AI does, the tools, what you need first, how to measure ROI, a prompt to copy and the sources.</p>
<div class="filters" role="group" aria-label="Filter by job"><button class="chip active" data-filter="all">All</button>${categories.map((c) => `<button class="chip" data-filter="${c.slug}">${esc(c.name)}</button>`).join('')}</div>
<div class="grid" id="uc-grid">${useCases.map((u) => card(u).replace('<a class="card"', `<a class="card" data-cat="${u.cat}"`)).join('')}</div></section>${signup('lib-signup')}`,
});

// ---------- Category pages ----------
for (const c of categories) {
  const list = useCases.filter((u) => u.cat === c.slug);
  page({
    path: `/jobs/${c.slug}`, title: `AI for ${c.name.toLowerCase()}: use cases and tools`,
    description: `${c.blurb} Practical AI use cases for ${c.name.toLowerCase()}, with tools, prompts and ROI measures.`,
    jsonld: [crumbsLd([['Home', '/'], ['Use cases', '/use-cases'], [c.name, `/jobs/${c.slug}`]])],
    body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['Use cases', '/use-cases'], [c.name, `/jobs/${c.slug}`]])}
<h1>AI for ${esc(c.name.toLowerCase())}</h1><p class="lede">${esc(c.blurb)}</p>
<div class="grid">${list.map(card).join('')}</div>
<p class="muted">More ${esc(c.name.toLowerCase())} use cases are on the way. <a href="/newsletter">Get them by email</a>.</p></section>`,
  });
}

// ---------- Use case pages ----------
for (const u of useCases) {
  const c = catBy[u.cat];
  const crumbs = [['Home', '/'], ['Use cases', '/use-cases'], [c.name, `/jobs/${c.slug}`], [u.title, `/use-cases/${u.slug}`]];
  const related = useCases.filter((x) => x.cat === u.cat && x.slug !== u.slug).slice(0, 3);
  page({
    path: `/use-cases/${u.slug}`, title: `${u.title}: AI use case`, type: 'article',
    description: `${u.summary} Tools, prerequisites, ROI measures and a ready-to-use prompt.`.slice(0, 300),
    jsonld: [crumbsLd(crumbs), {
      '@context': 'https://schema.org', '@type': 'Article', headline: u.title, description: u.summary, inLanguage: 'en-GB',
      dateModified: TODAY, author: { '@type': 'Organization', name: NAME }, publisher: { '@type': 'Organization', name: NAME },
      about: c.name, citation: u.sources.map((k) => sources[k].url), mainEntityOfPage: `${SITE}/use-cases/${u.slug}`,
    }],
    body: `<article class="wrap narrow section">${crumbsHtml(crumbs)}
<span class="tag">${esc(c.name)}</span>
<h1>${esc(u.title)}</h1>
<p class="lede">${esc(u.summary)}</p>
<div class="callout"><strong>The job:</strong> ${esc(u.job)}</div>
<h2>What AI actually does here</h2><ul>${u.whatAIDoes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2>Tools to look at</h2><ul>${u.tools.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<p class="muted small">Named tools are examples, not endorsements. We have no paid relationships with them at the moment; see our <a href="/disclosure">disclosure</a>.</p>
<h2>What you need first</h2><ul>${u.needFirst.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2>How to measure ROI</h2><ul>${u.roi.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<p><a class="btn btn-ghost btn-sm" href="/roi-calculator">Run the numbers in the ROI calculator →</a></p>
<h2>What the evidence says</h2><p>${esc(u.evidence)}</p>
<h2>Ready-to-use prompt</h2>
<p class="muted small">Replace the [BRACKETS]. Only paste data you’re allowed to share with the tool you’re using.</p>
<div class="prompt-wrap"><button class="copy btn btn-sm" type="button">Copy prompt</button><pre class="prompt"><code>${esc(u.prompt)}</code></pre></div>
<h2>Sources</h2>${sourceList(u.sources)}
<p class="muted small">Last reviewed ${TODAY}. Spotted something out of date? We’ll add a feedback route at launch.</p>
${related.length ? `<h2>Related use cases</h2><div class="grid">${related.map(card).join('')}</div>` : ''}
</article>${signup('uc-signup')}`,
  });
}

// ---------- Guides ----------
page({
  path: '/guides', title: 'Plain-English guides to AI agents, prompting and ROI',
  description: 'Short, practical guides: what an AI agent really is, how to prompt well, and how to measure whether AI pays back.',
  jsonld: [crumbsLd([['Home', '/'], ['Guides', '/guides']])],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['Guides', '/guides']])}<h1>Guides</h1><p class="lede">Start here if “agents” and “prompting” still feel fuzzy.</p><div class="grid">${guides.map((g) => `<a class="card" href="/guides/${g.slug}"><span class="tag">Guide</span><h3>${esc(g.title)}</h3><p>${esc(g.summary)}</p></a>`).join('')}</div></section>`,
});
for (const g of guides) {
  const crumbs = [['Home', '/'], ['Guides', '/guides'], [g.title, `/guides/${g.slug}`]];
  page({
    path: `/guides/${g.slug}`, title: g.title, description: g.summary, type: 'article',
    jsonld: [crumbsLd(crumbs), { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.summary, inLanguage: 'en-GB', dateModified: TODAY, author: { '@type': 'Organization', name: NAME }, citation: g.sources.map((k) => sources[k].url) }],
    body: `<article class="wrap narrow section prose">${crumbsHtml(crumbs)}<span class="tag">Guide</span><h1>${esc(g.title)}</h1><p class="lede">${esc(g.summary)}</p>${g.body}<h2>Sources</h2>${sourceList(g.sources)}</article>${signup('guide-signup')}`,
  });
}

// ---------- ROI calculator ----------
page({
  path: '/roi-calculator', title: 'Free AI ROI calculator',
  description: 'Work out the monthly saving and payback period of an AI tool or agent from hours saved, team size, hourly cost, tool cost and set-up time.',
  jsonld: [crumbsLd([['Home', '/'], ['ROI calculator', '/roi-calculator']]), { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'AI ROI calculator', applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' }, url: SITE + '/roi-calculator' }],
  body: `<section class="wrap section">${crumbsHtml([['Home', '/'], ['ROI calculator', '/roi-calculator']])}
<h1>AI ROI calculator</h1><p class="lede">A quick, honest estimate of whether an AI use case pays back. Everything runs in your browser and nothing is stored or sent.</p>
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
  body: `<section class="wrap narrow section"><h1>The weekly use case</h1><p class="lede">One practical AI use case each week: the job, the tools, a ready-to-use prompt and how to tell if it pays back. Written in plain English, with sources.</p>
<ul><li>No hype, no “10 tools that will change your life”.</li><li>Sponsored items, when we have them, will always be clearly labelled.</li><li>Unsubscribe in one click.</li></ul></section>${signup('nl-signup')}`,
});

// ---------- Packs ----------
const waiver = `<p class="fine-print"><strong>Before you buy:</strong> packs are digital content you download straight after payment. When you check out, you’ll be asked to agree that the download starts immediately and that you then lose your 14-day right to cancel (Consumer Contracts Regulations 2013). This doesn’t affect your statutory rights if a pack is faulty or not as described. Prices include any VAT due. See our <a href="/terms">terms</a>.</p>`;
page({
  path: '/packs', title: PACKS_ON_SALE ? 'Prompt and agent-config packs' : 'Prompt and agent-config packs (coming soon)',
  description: 'Tested, ready-to-use prompt and agent-configuration packs for specific jobs and industries.',
  body: `<section class="wrap narrow section">${PACKS_ON_SALE ? '' : '<span class="tag">Coming soon</span>'}<h1>Prompt and agent-config packs</h1>
<p class="lede">The free library shows you what’s possible. A pack gives you the complete, tested kit for a job: a set of prompts, agent and tool configurations, a business-case worksheet and a checklist of controls.</p>
<div class="grid packs">${packs.map((p) => `<div class="card pack"><h3>${esc(p.name)}</h3><p class="price">${esc(p.price)}</p><p>${esc(p.blurb)}</p>${PACKS_ON_SALE ? `<a class="btn" href="${esc(p.url)}" rel="noopener">Buy now</a>` : '<span class="btn btn-disabled" aria-disabled="true">Coming soon</span>'}</div>`).join('')}</div>
${PACKS_ON_SALE ? waiver : '<p>Prices are provisional and nothing is on sale yet. Want first access? <a href="/newsletter">Join the waiting list</a>.</p>'}
<p class="muted">Payments are processed securely by Stripe. We never see your card details.</p></section>`,
});

// ---------- Terms ----------
page({
  path: '/terms', title: 'Terms of sale',
  description: 'Terms of sale for AIForThisJob digital packs, including your cancellation rights.',
  body: `<section class="wrap narrow section prose"><h1>Terms of sale</h1>
<p class="muted">Draft: to be reviewed before packs go on sale.</p>
<h2>Who we are</h2><p>${NAME} is run from the UK. Contact: <a href="mailto:hello@aiforthisjob.com">hello@aiforthisjob.com</a>.</p>
<h2>What you’re buying</h2><p>Packs are digital content (documents and files) for your own use within your organisation. Please don’t resell or republish them.</p>
<h2>Price and payment</h2><p>Prices are shown in pounds sterling and include any VAT due. Payment is taken by Stripe at checkout.</p>
<h2>Your right to cancel</h2><p>Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 you normally have 14 days to cancel. For digital content supplied immediately, you’ll be asked at checkout to agree that supply starts straight away and to acknowledge that you then lose that right to cancel. We’ll confirm this in your receipt email.</p>
<h2>If something’s wrong</h2><p>Under the Consumer Rights Act 2015, digital content must be of satisfactory quality, fit for purpose and as described. If a pack isn’t, email us and we’ll fix it, replace it or refund you.</p>
<h2>No professional advice</h2><p>Packs are practical templates, not financial, legal, regulatory or professional advice. Check anything important against your own organisation’s policies.</p></section>`,
});

// ---------- About ----------
page({
  path: '/about', title: 'About AIForThisJob',
  description: 'Why AIForThisJob exists: to help people pick the right AI tool for a real job and measure honestly whether it pays back.',
  body: `<section class="wrap narrow section prose"><h1>About ${NAME}</h1>
<p class="lede">Lots of people are being told to “use AI” without being told what for, which tool, or how to know whether it worked.</p>
<p>${NAME} is a UK-based, independent library of practical AI use cases organised by job and industry. Each one explains what AI really does, which kinds of tools to look at, what you need in place first, a ready-to-use prompt, and how to measure the return.</p>
<h2>Our rules</h2>
<ul><li><strong>Sources on everything.</strong> Every playbook links to public sources.</li>
<li><strong>No invented statistics.</strong> If we can’t source a number, we don’t use it.</li>
<li><strong>Vendor claims are labelled</strong> as vendor claims.</li>
<li><strong>Human checked.</strong> We use AI to help research and draft; a person reviews before anything is published.</li>
<li><strong>No confidential information.</strong> Industry playbooks use public information only.</li></ul>
<p>Nothing here is financial, legal, regulatory or professional advice. Check anything important with a qualified adviser and your own organisation’s policies.</p></section>`,
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
<p>We’ll collect your email address only with your consent, use it only to send the newsletter, name the email provider we use, and let you unsubscribe at any time. You’ll have your rights under UK GDPR, including access and deletion, and the right to complain to the <a href="https://ico.org.uk/" rel="noopener">Information Commissioner’s Office</a>.</p></section>`,
});

// ---------- 404 ----------
write('404.html', `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | ${NAME}</title><meta name="robots" content="noindex"><link rel="stylesheet" href="/styles.css"></head><body><main class="wrap narrow section"><h1>Page not found</h1><p>That page doesn’t exist (yet). Try the <a href="/use-cases">use-case library</a> or go <a href="/">home</a>.</p></main></body></html>`);

// ---------- robots, sitemap, llms.txt ----------
write('robots.txt', PREVIEW
  ? `# Preview version: not yet launched\nUser-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((p) => `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('llms.txt', `# ${NAME}

> A free, UK-based library of practical AI use cases organised by job and industry. Each entry gives the job, what AI does, tool types and named example tools, prerequisites (data and controls), how to measure ROI, a ready-to-use prompt and public sources. Vendor claims are labelled; no statistics are invented.

## Use cases
${useCases.map((u) => `- [${u.title}](${SITE}/use-cases/${u.slug}): ${u.summary}`).join('\n')}

## Guides
${guides.map((g) => `- [${g.title}](${SITE}/guides/${g.slug}): ${g.summary}`).join('\n')}

## Tools
- [AI ROI calculator](${SITE}/roi-calculator): monthly saving and payback period from hours saved, people, hourly cost, tool cost and set-up time. Time saved only counts if redeployed.

## Optional
- [About](${SITE}/about)
- [Sponsor and affiliate disclosure](${SITE}/disclosure)
`);

// ---------- static assets ----------
for (const f of ['styles.css', 'site.js', 'favicon.svg']) copyFileSync(new URL(`./static/${f}`, import.meta.url), join(OUT, f));
files.push('styles.css', 'site.js', 'favicon.svg');
console.log(`Built ${files.length} files to dist/ (SITE=${SITE}, PREVIEW=${PREVIEW})`);
