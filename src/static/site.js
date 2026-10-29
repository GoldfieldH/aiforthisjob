// Newsletter placeholder: stores and sends nothing.
document.querySelectorAll('.newsletter-form').forEach((f) => {
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = f.querySelector('.form-note');
    const email = f.querySelector('input[type=email]');
    if (!email.value || !email.checkValidity()) { note.textContent = 'Please enter a valid email address.'; return; }
    email.value = '';
    note.textContent = 'Thanks! The newsletter isn’t live yet, so we haven’t saved your address. Please check back soon.';
  });
});
// Copy prompt
document.querySelectorAll('.copy').forEach((b) => b.addEventListener('click', async () => {
  const text = b.parentElement.querySelector('code').innerText;
  try { await navigator.clipboard.writeText(text); b.textContent = 'Copied ✓'; } catch { b.textContent = 'Select and copy'; }
  setTimeout(() => (b.textContent = 'Copy prompt'), 2000);
}));
// Use-case filter
const grid = document.getElementById('uc-grid');
if (grid) document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach((x) => x.classList.remove('active')); c.classList.add('active');
  const f = c.dataset.filter;
  grid.querySelectorAll('.card').forEach((card) => { card.style.display = f === 'all' || card.dataset.cat === f ? '' : 'none'; });
}));
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
