const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
function closeMenu(returnFocus = false) {
  if (!nav || !toggle) return;
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Отвори меню');
  if (returnFocus) toggle.focus();
}
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Затвори меню' : 'Отвори меню');
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-wrap')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu(true); });
  matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
}
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const serviceSearch = document.getElementById('service-search');
if (serviceSearch) {
  const sections = [...document.querySelectorAll('main > section[id]')];
  const normalize = value => value.toLocaleLowerCase('bg').replace(/[‐‑–—-]/g, '').replace(/\s+/g, ' ').trim();
  serviceSearch.addEventListener('input', () => {
    const term = normalize(serviceSearch.value);
    let total = 0;
    sections.forEach(section => {
      const items = [...section.querySelectorAll('.service-row:not(.service-head), .info-card, .stack-list article, .quick-price-grid article')];
      let visible = 0;
      items.forEach(item => {
        item.hidden = !normalize(item.textContent).includes(term);
        if (!item.hidden) visible++;
      });
      section.hidden = visible === 0;
      total += visible;
    });
    document.getElementById('search-status').textContent = term ? (total ? `Намерени услуги: ${total}` : 'Няма резултати. Опитай друга дума или опиши задачата в запитване.') : 'Търси по име или описание на услугата.';
  });
  document.querySelectorAll('.subnav a').forEach(link => link.addEventListener('click', () => {
    serviceSearch.value = '';
    serviceSearch.dispatchEvent(new Event('input'));
  }));
}
const backTop = document.createElement('button');
backTop.className = 'back-top'; backTop.type = 'button'; backTop.textContent = '↑';
backTop.setAttribute('aria-label', 'Обратно в началото'); backTop.hidden = true;
document.body.append(backTop);
window.addEventListener('scroll', () => { backTop.hidden = window.scrollY < 650; }, { passive: true });
backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  document.querySelector('.brand')?.focus({ preventScroll: true });
});
