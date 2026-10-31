window.__aiftj = true;
// Newsletter signup: double opt-in via /api/subscribe (Resend). Falls back gracefully if not configured yet.
document.querySelectorAll('.newsletter-form').forEach((f) => {
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = f.querySelector('.form-note');
    const email = f.querySelector('input[type=email]');
    const btn = f.querySelector('button');
    if (!email.value || !email.checkValidity()) { note.textContent = 'Please enter a valid email address.'; return; }
    btn.disabled = true; note.textContent = 'Sending…';
    try {
      const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, website: (f.elements.website || {}).value || '' }) });
      if (r.ok) { email.value = ''; note.textContent = 'Nearly there: check your inbox and click the link to confirm.'; }
      else if (r.status === 503) note.textContent = 'The newsletter isn’t live yet, so we haven’t saved your address. Please check back soon.';
      else if (r.status === 400) note.textContent = 'Please enter a valid email address.';
      else note.textContent = 'Sorry, something went wrong. Please try again in a minute.';
    } catch { note.textContent = 'Sorry, something went wrong. Please try again in a minute.'; }
    btn.disabled = false;
  });
});
// Newsletter status banner after confirmation redirect
const st = new URLSearchParams(location.search).get('status');
if (st && location.pathname === '/newsletter') {
  const msg = { confirmed: 'You’re subscribed. Thanks! The first email will arrive soon.', expired: 'That confirmation link has expired or isn’t valid. Please sign up again.', error: 'Sorry, something went wrong on our side and we couldn’t confirm your subscription. Your link still works for 48 hours, so please try it again later.', unavailable: 'The newsletter isn’t live yet.' }[st];
  if (msg) { const d = document.createElement('div'); d.className = 'status-banner'; d.setAttribute('role', 'status'); d.textContent = msg; document.querySelector('main').prepend(d); }
}
// Copy prompt
document.querySelectorAll('.copy').forEach((b) => b.addEventListener('click', async () => {
  const label = b.dataset.label || 'Copy prompt';
  const code = b.parentElement.querySelector('code');
  if (!code) return;
  try { await navigator.clipboard.writeText(code.innerText); b.textContent = 'Copied ✓'; } catch { b.textContent = 'Select and copy'; }
  setTimeout(() => { b.textContent = label; }, 2000);
}));
// Filters (ideas by job, and little useful things). Items tagged "both" stay visible in Work and Home.
document.querySelectorAll('.filters[data-filter-for]').forEach((bar) => {
  const grid = document.getElementById(bar.dataset.filterFor);
  if (!grid) return;
  bar.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
    bar.querySelectorAll('.chip').forEach((x) => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
    c.classList.add('active'); c.setAttribute('aria-pressed', 'true');
    const f = c.dataset.filter;
    grid.querySelectorAll('[data-cat],[data-aud]').forEach((card) => {
      const key = card.dataset.cat || card.dataset.aud;
      const show = f === 'all' || key === f || key === 'both';
      card.style.display = show ? '' : 'none';
    });
  }));
});
// ROI calculator
const roi = document.getElementById('roi');
if (roi) {
  const gbp = (n) => (n < 0 ? '−' : '') + '£' + Math.abs(Math.round(n)).toLocaleString('en-GB');
  const calc = () => {
    const v = (k) => Math.max(0, parseFloat(roi.elements[k].value) || 0);
    const hours = v('hours') * v('people') * 52 / 12;
    const redeploy = Math.min(100, v('redeploy')) / 100;
    const value = hours * v('rate') * redeploy;
    const cost = v('tool') + v('review') * v('rate');
    const net = value - cost;
    const setup = v('setup') * v('rate');
    const set = (id, t, neg) => { const el = document.getElementById(id); el.textContent = t; el.classList.toggle('neg', !!neg); };
    set('o-hours', Math.round(hours).toLocaleString('en-GB') + ' hours');
    set('o-value', gbp(value));
    set('o-cost', gbp(cost));
    set('o-net', gbp(net), net < 0);
    set('o-setup', gbp(setup));
    set('o-payback', net > 0 ? (setup === 0 ? 'Immediate' : (setup / net < 1 ? 'Under 1 month' : (setup / net).toFixed(1) + ' months')) : 'Never at these numbers', net <= 0);
    const year = net * 12 - setup;
    set('o-year', gbp(year), year < 0);
  };
  roi.addEventListener('input', calc); calc();
}

// ---------- Motion: scroll reveal, parallax fallback, progress fallback, TOC highlight ----------
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { reveals.forEach((el) => el.classList.add('in', 'done')); }
  else {
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target; el.classList.add('in'); io.unobserve(el);
      const done = () => el.classList.add('done');
      el.addEventListener('transitionend', done, { once: true }); setTimeout(done, 1600);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }
  const cssScroll = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  // Parallax fallback for browsers without scroll-driven animations (transform only; no layout work)
  const layers = [...document.querySelectorAll('.layers .layer')];
  if (!reduce && !cssScroll && layers.length) {
    let ticking = false, visible = true;
    const host = layers[0].closest('.hero, .section-hero');
    if (host && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
    const update = () => { ticking = false; if (!visible) return; const y = scrollY; layers.forEach((l) => l.style.setProperty('--y', (y * parseFloat(l.dataset.speed || 0.3)).toFixed(1) + 'px')); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }
  // Reading progress fallback
  const bar = document.querySelector('.progress span');
  if (bar && !cssScroll) {
    let t = false;
    const upd = () => { t = false; const h = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty('--p', h > 0 ? Math.min(1, scrollY / h).toFixed(4) : 0); };
    addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }
  // Highlight the current section in the table of contents
  const toc = document.querySelector('.toc');
  if (toc && 'IntersectionObserver' in window) {
    const links = new Map([...toc.querySelectorAll('li a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
    const heads = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    const tio = new IntersectionObserver((list) => list.forEach((e) => {
      if (e.isIntersecting) { links.forEach((a) => a.classList.remove('active')); const a = links.get(e.target.id); if (a) a.classList.add('active'); }
    }), { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach((h) => tio.observe(h));
  }
  // Opening the prompt via a #prompt link expands it
  const openPrompt = () => { if (location.hash === '#prompt') { const d = document.querySelector('.prompt-details'); if (d) d.open = true; } };
  addEventListener('hashchange', openPrompt); openPrompt();
})();

// Buy packs pill: hide it once a pack Buy button is actually on screen.
// The pill is in the HTML, so it stays visible with no JS and in browsers without IntersectionObserver.
(() => {
  const fab = document.querySelector('.buy-fab');
  if (!fab || !('IntersectionObserver' in window)) return;
  const buys = [...document.querySelectorAll('[data-pack-buy]')];
  if (!buys.length) return;
  const onScreen = new Set();
  const apply = () => {
    const hide = onScreen.size > 0;
    fab.classList.toggle('is-hidden', hide);
    if (hide) {
      if (document.activeElement === fab) fab.blur();
      fab.setAttribute('aria-hidden', 'true');
      fab.setAttribute('tabindex', '-1');
    } else { fab.removeAttribute('aria-hidden'); fab.removeAttribute('tabindex'); }
  };
  const headerH = () => { const h = document.querySelector('.site-header'); return h ? Math.round(h.getBoundingClientRect().height) : 0; };
  const seen = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > headerH() + 4 && r.top < innerHeight - 4;
  };
  if (buys.some(seen)) { buys.filter(seen).forEach((el) => onScreen.add(el)); apply(); }
  // Same box as seen(): ignore the strip hidden under the sticky header.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { if (e.isIntersecting && seen(e.target)) onScreen.add(e.target); else onScreen.delete(e.target); }
    apply();
  }, { rootMargin: `-${headerH()}px 0px 0px 0px`, threshold: 0 });
  buys.forEach((el) => io.observe(el));
})();
