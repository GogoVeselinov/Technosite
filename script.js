const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const form = document.getElementById('contact-form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const service = data.get('service') || '';
    const message = data.get('message') || '';

    const subject = encodeURIComponent(`Запитване: ${service}`);
    const body = encodeURIComponent(
      `Здравейте,

Казвам се ${name}.
Имейл за обратна връзка: ${email}
Услуга: ${service}

Описание:
${message}

Поздрави,
${name}`
    );

    window.location.href = `mailto:hello@technotandem.bg?subject=${subject}&body=${body}`;
  });
}
