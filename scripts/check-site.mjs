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
const feed = readFileSync(join(DIST, 'feed.xml'), 'utf8');
if (/&(?!amp;|lt;|gt;|quot;|apos;|#)/.test(feed)) { console.error('feed.xml has unescaped &'); errors++; }
console.log(`${html.length} pages, ${links} internal links, ${ld} JSON-LD blocks checked, ${errors} problems`);
process.exit(errors ? 1 : 0);
