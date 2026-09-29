// Native HTTPS form submission works on static hosting, also without JavaScript.
// Change the recipient in contact.html's form action; never add email passwords.
const inquiryForm = document.getElementById('contact-form');
if (inquiryForm) {
  const choices = { web: 'Сайт / хостинг', business: 'Абонаментна поддръжка', hardware: 'Компютър / хардуер', software: 'Windows / софтуер' };
  const selection = choices[new URLSearchParams(location.search).get('service')];
  if (selection) inquiryForm.elements.service.value = selection;
  const status = document.getElementById('send-status');
  const button = inquiryForm.querySelector('[type="submit"]');
  let sending = false;
  let recoveryTimer;
  function unlock() {
    sending = false;
    clearTimeout(recoveryTimer);
    button.disabled = false;
    button.textContent = 'Изпрати запитване →';
    inquiryForm.removeAttribute('aria-busy');
  }
  window.addEventListener('pageshow', () => { unlock(); status.textContent = ''; });
  inquiryForm.addEventListener('input', event => {
    event.target.setCustomValidity?.('');
    if (!sending) status.textContent = '';
  });
  inquiryForm.addEventListener('submit', event => {
    if (sending) { event.preventDefault(); return; }
    for (const name of ['name', 'message']) {
      const field = inquiryForm.elements[name];
      field.setCustomValidity(field.value.trim() ? '' : 'Моля, попълни това поле.');
    }
    if (!inquiryForm.reportValidity()) { event.preventDefault(); return; }
    if (inquiryForm.elements._honey.value) { event.preventDefault(); return; }
    if (location.protocol === 'file:') {
      event.preventDefault();
      status.textContent = 'Отвори сайта през локалния сървър или публикувания адрес, за да изпратиш запитване.';
      status.dataset.state = 'error';
      return;
    }
    sending = true;
    button.disabled = true;
    button.textContent = 'Продължаване…';
    inquiryForm.setAttribute('aria-busy', 'true');
    status.dataset.state = 'pending';
    status.textContent = 'Пренасочваме те към проверката и потвърждението за изпращане…';
    // Leave native submission intact so the provider can show its CAPTCHA,
    // recipient activation, and delivery response instead of a false success.
    recoveryTimer = setTimeout(() => {
      unlock();
      status.dataset.state = 'error';
      status.textContent = 'Ако страницата за потвърждение не се е отворила, провери връзката си. Изпращането не е потвърдено.';
    }, 20000);
  });
}
