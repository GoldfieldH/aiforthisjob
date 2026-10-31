// Checks the built site in dist/: internal links and anchors resolve, JSON-LD parses, feed/sitemap are well-formed-ish.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const DIST = new URL('../dist/', import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const all = walk(DIST);
const html = all.filter((f) => f.endsWith('.html'));
const resolve = (path) => {
  const clean = path.split('#')[0].split('?')[0];
  if (clean === '/' || clean === '') return join(DIST, 'index.html');
  const base = join(DIST, clean);
  for (const c of [base, base + '.html', join(base, 'index.html')]) if (existsSync(c) && statSync(c).isFile()) return c;
  return null;
};
const idsOf = (file) => new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
let errors = 0, links = 0, ld = 0;
for (const f of html) {
  const src = readFileSync(f, 'utf8');
  const rel = '/' + f.slice(DIST.length);
  for (const m of src.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|data:)/.test(u)) continue;
    links++;
    if (u.startsWith('#')) { if (u.length > 1 && !idsOf(f).has(u.slice(1))) { console.error(`BROKEN ANCHOR ${rel} -> ${u}`); errors++; } continue; }
    const target = resolve(u);
    if (!target) { console.error(`BROKEN ${rel} -> ${u}`); errors++; continue; }
    const hash = u.split('#')[1];
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) { console.error(`BROKEN ANCHOR ${rel} -> ${u}`); errors++; }
  }
  for (const m of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    ld++;
    try { const j = JSON.parse(m[1]); if (!j['@context'] || !j['@type']) throw new Error('missing @context/@type'); } catch (e) { console.error(`BAD JSON-LD ${rel}: ${e.message}`); errors++; }
  }
  if ((src.match(/<h1[\s>]/g) || []).length !== 1 && !rel.endsWith('404.html')) { console.error(`H1 COUNT ${rel}`); errors++; }
}
// sitemap + feed + llms links point at built pages
const site = (readFileSync(join(DIST, 'sitemap.xml'), 'utf8').match(/<loc>(https?:\/\/[^/<]+)/) || [])[1];
for (const file of ['sitemap.xml', 'feed.xml', 'llms.txt']) {
  const src = readFileSync(join(DIST, file), 'utf8');
  for (const m of src.matchAll(new RegExp(site.replace(/[.]/g, '\\.') + '(/[^<\\s)"]*)', 'g'))) {
    links++;
    if (!resolve(m[1])) { console.error(`BROKEN in ${file}: ${m[1]}`); errors++; }
  }
}
// SEO checks: unique titles/descriptions, lengths, canonical, social image, robots meta vs sitemap.
const PREVIEW = /Disallow: \/\s*$/m.test(readFileSync(join(DIST, 'robots.txt'), 'utf8')) && !/Sitemap:/.test(readFileSync(join(DIST, 'robots.txt'), 'utf8'));
const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const inSitemap = new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1]));
const decode = (t) => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const seen = { title: new Map(), desc: new Map() };
let warnings = 0;
for (const f of html) {
  const src = readFileSync(f, 'utf8');
  const rel = '/' + f.slice(DIST.length);
  const path = rel === '/index.html' ? '/' : rel.replace(/\.html$/, '');
  const title = decode((src.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((src.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const robots = (src.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  const noindex = /noindex/.test(robots);
  if (!title) { console.error(`NO TITLE ${rel}`); errors++; }
  if (!desc) { console.error(`NO DESCRIPTION ${rel}`); errors++; }
  if (desc.length > 160) { console.error(`DESCRIPTION > 160 chars (${desc.length}) ${rel}`); errors++; }
  if (title.length > 65) { console.warn(`warn: title ${title.length} chars ${rel}`); warnings++; }
  if (!robots) { console.error(`NO ROBOTS META ${rel}`); errors++; }
  if (PREVIEW && !noindex) { console.error(`PREVIEW BUILD BUT INDEXABLE ${rel}`); errors++; }
  if (!noindex || PREVIEW) {
    if (!rel.endsWith('404.html') && !rel.endsWith('thanks.html')) {
      for (const [k, v] of [['title', title], ['desc', desc]]) { if (seen[k].has(v)) { console.error(`DUPLICATE ${k} ${rel} = ${seen[k].get(v)}`); errors++; } else seen[k].set(v, rel); }
      const canon = (src.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      if (!canon || !/^https:\/\//.test(canon)) { console.error(`NO ABSOLUTE CANONICAL ${rel}`); errors++; }
      else if (new URL(canon).pathname !== path) { console.error(`CANONICAL MISMATCH ${rel} -> ${canon}`); errors++; }
      if (!inSitemap.has(path)) { console.error(`NOT IN SITEMAP ${path}`); errors++; }
    }
  }
  if (!PREVIEW && noindex && inSitemap.has(path)) { console.error(`NOINDEX PAGE IN SITEMAP ${path}`); errors++; }
  const og = (src.match(/<meta property="og:image" content="https?:\/\/[^/"]+([^"]+)"/) || [])[1];
  if (!og || !resolve(og)) { console.error(`MISSING og:image file ${rel}`); errors++; }
}
if (inSitemap.has('/404')) { console.error('404 page is in the sitemap'); errors++; }
if (inSitemap.has('/thanks')) { console.error('thanks page is in the sitemap'); errors++; }
const thanks = html.find((f) => f.endsWith('thanks.html'));
if (!thanks) { console.error('MISSING thanks.html'); errors++; }
else {
  const robots = (readFileSync(thanks, 'utf8').match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  if (robots !== 'noindex, follow') { console.error(`THANKS ROBOTS expected "noindex, follow", got "${robots}"`); errors++; }
}
const banned = /plain(?:[-\s]+)british english|plain(?:[-\s]+)english/i;
for (const f of all) {
  if (!/\.(html|xml|txt|css|js|svg)$/.test(f)) continue;
  const src = readFileSync(f, 'utf8');
  if (banned.test(src)) { console.error(`BANNED PHRASE in ${f.slice(DIST.length)}`); errors++; }
}
console.log(`mode: ${PREVIEW ? 'PREVIEW (noindex, robots.txt blocks all)' : 'LAUNCH (indexable)'}; ${inSitemap.size} sitemap URLs; ${warnings} warnings`);
const feed = readFileSync(join(DIST, 'feed.xml'), 'utf8');
if (/&(?!amp;|lt;|gt;|quot;|apos;|#)/.test(feed)) { console.error('feed.xml has unescaped &'); errors++; }
console.log(`${html.length} pages, ${links} internal links, ${ld} JSON-LD blocks checked, ${errors} problems`);
process.exit(errors ? 1 : 0);
