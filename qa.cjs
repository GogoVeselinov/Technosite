const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require(path.join(process.env.TEMP, 'technosite-qa/node_modules/jsdom'));
const pages = fs.readdirSync('.').filter(p => p.endsWith('.html'));
const script = fs.readFileSync('assets/js/main.js', 'utf8');
function open(file, query = '') {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { url: `http://localhost:4173/${file}${query}`, runScripts: 'outside-only' });
  dom.window.matchMedia = () => ({ matches: false, addEventListener() { } });
  dom.window.HTMLElement.prototype.scrollIntoView = function () { };
  dom.window.eval(script);
  if (file === 'contact.html') dom.window.eval(fs.readFileSync('assets/js/contact.js', 'utf8'));
  return dom;
}
for (const file of pages) {
  const dom = open(file), d = dom.window.document;
  assert.equal(d.querySelectorAll('main').length, 1, file);
  assert.equal(d.querySelectorAll('h1').length, 1, file);
  assert.equal(d.querySelectorAll('footer').length, 1, file);
  assert.equal(d.querySelectorAll('nav [aria-current="page"]').length, 1, file);
  const ids = [...d.querySelectorAll('[id]')].map(e => e.id);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${file}`);
  for (const el of d.querySelectorAll('[href], [src]')) {
    const ref = el.getAttribute('href') || el.getAttribute('src');
    if (/^(https?:|mailto:|tel:)/.test(ref)) continue;
    const url = new URL(ref, `http://local/${file}`), target = url.pathname.slice(1);
    assert.ok(fs.existsSync(target), `${file}: missing ${ref}`);
    if (url.hash) {
      const targetDoc = new JSDOM(fs.readFileSync(target, 'utf8')).window.document;
      assert.ok(targetDoc.getElementById(url.hash.slice(1)), `${file}: missing anchor ${ref}`);
    }
  }
  const toggle = d.querySelector('.menu-toggle');
  toggle.click(); assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  d.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  console.log(`PASS ${file}: structure, links, menu`);
}
const searchDom = open('services.html'), sd = searchDom.window.document;
const search = sd.querySelector('#service-search');
for (const term of ['лаптоп', 'Wi-Fi', 'zzzzzzz', '']) {
  search.value = term; search.dispatchEvent(new searchDom.window.Event('input'));
  const count = [...sd.querySelectorAll('.service-row:not(.service-head),.info-card,.stack-list article,.quick-price-grid article')].filter(e => !e.hidden).length;
  assert.ok(term === 'zzzzzzz' ? count === 0 : count > 0, term);
}
console.log('PASS search: Cyrillic, Wi-Fi normalization, empty results, reset');
for (const [key, expected] of [['web', 'Сайт / хостинг'], ['business', 'Абонаментна поддръжка']]) {
  const dom = open('contact.html', `?service=${key}`), d = dom.window.document, f = d.querySelector('form');
  assert.equal(f.elements.service.value, expected);
  f.elements.name.value = 'Тест'; f.elements.email.value = 'test@example.com'; f.elements.message.value = 'Тестово запитване';
  assert.equal(f.action, 'https://formsubmit.co/gogoveselinov55@gmail.com');
  assert.equal(f.method, 'post');
  assert.equal(f.elements._template.value, 'table');
  assert.equal(f.elements._captcha, undefined, 'Keep provider CAPTCHA enabled');
  const sent = new dom.window.Event('submit', { cancelable: true });
  f.dispatchEvent(sent);
  assert.equal(sent.defaultPrevented, false, 'Allow native POST');
  assert.equal(f.querySelector('[type="submit"]').disabled, true);
  assert.equal(f.elements.message.value, 'Тестово запитване', 'Do not erase data before confirmation');
  const duplicate = new dom.window.Event('submit', { cancelable: true });
  f.dispatchEvent(duplicate);
  assert.equal(duplicate.defaultPrevented, true, 'Prevent double submission');
  dom.window.dispatchEvent(new dom.window.Event('pageshow'));
  assert.equal(f.querySelector('[type="submit"]').disabled, false, 'Back navigation unlocks form');
  f.elements.name.value = '   ';
  f.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  assert.equal(f.elements.name.validity.valid, false);
  f.elements.name.value = 'Тест';
  f.elements._honey.value = 'spam';
  const spam = new dom.window.Event('submit', { cancelable: true });
  f.dispatchEvent(spam);
  assert.equal(spam.defaultPrevented, true, 'Block filled honeypot');
  dom.window.close();
}
console.log('PASS inquiry: recipient, native POST, CAPTCHA, service selection, validation, duplicate prevention, recovery, honeypot');
