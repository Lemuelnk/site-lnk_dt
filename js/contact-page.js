// Contact page (contact.html) — bilingual + form submission
(function () {
  const html = document.documentElement;
  const saved = localStorage.getItem('lnk-lang');
  const param = new URLSearchParams(location.search).get('lang');
  const initialLang = param === 'en' ? 'en' : (saved === 'en' ? 'en' : 'fr');
  html.setAttribute('data-lang', initialLang);

  // Language toggle elements (defined at top level)
  const langOptions = document.querySelectorAll('.language-option');

  function applyLanguage() {
    const lang = html.getAttribute('data-lang');
    const en = lang === 'en';
    localStorage.setItem('lnk-lang', lang);
    document.querySelectorAll('[data-lang-fr][data-lang-en]').forEach(el => {
      const fr = el.getAttribute('data-lang-fr');
      const enText = el.getAttribute('data-lang-en');
      if (fr && enText) {
        el.textContent = en ? enText : fr;
      }
    });
    const messageField = document.getElementById('contactMessage');
    if (messageField) messageField.placeholder = en
      ? messageField.getAttribute('data-placeholder-en')
      : messageField.getAttribute('data-placeholder-fr');
    const privacyLink = document.querySelector('[data-privacy-link]');
    if (privacyLink) privacyLink.href = en ? 'politique-confidentialite-en.html' : 'politique-confidentialite.html';
    // Update language button states
    langOptions.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  applyLanguage();

  // Language toggle event listeners
  langOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      html.setAttribute('data-lang', btn.getAttribute('data-lang'));
      applyLanguage();
    });
  });

  // Turnstile
  const siteKey = html.getAttribute('data-turnstile-site-key');
  function loadTurnstile() {
    if (window.turnstile) { window.turnstile.reset?.(); return; }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (window.turnstile) window.turnstile.render('.cf-turnstile', { sitekey: siteKey, callback: () => {} });
    };
    document.body.appendChild(s);
  }
  if (siteKey) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadTurnstile);
    else loadTurnstile();
  }

  // Form
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('contactFeedback');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    feedback.textContent = '';
    const name = form.querySelector('[name=name]').value.trim();
    const email = form.querySelector('[name=email]').value.trim();
    const subject = form.querySelector('[name=subject]').value.trim();
    const projectType = form.querySelector('[name=projectType]').value;
    const budget = form.querySelector('[name=budget]').value;
    const deadline = form.querySelector('[name=deadline]').value;
    const message = form.querySelector('[name=message]').value.trim();
    if (!name || !email || !message) {
      feedback.textContent = html.getAttribute('data-lang') === 'en'
        ? 'Please fill in all required fields.'
        : 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    const turnstileToken = window.turnstile?.getResponse() || '';
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, projectType, budget, deadline, message, 'cf-turnstile-response': turnstileToken })
      });
      const data = await res.json();
      if (res.ok) {
        feedback.textContent = html.getAttribute('data-lang') === 'en'
          ? 'Message sent! We will get back to you soon.'
          : 'Message envoyé ! Nous vous répondrons bientôt.';
        feedback.className = 'form-feedback success';
        form.reset();
        if (window.turnstile) window.turnstile.reset();
      } else {
        feedback.textContent = data.message || (html.getAttribute('data-lang') === 'en'
          ? 'An error occurred. Please try again.'
          : 'Une erreur est survenue. Veuillez réessayer.');
        feedback.className = 'form-feedback error';
      }
    } catch {
      feedback.textContent = html.getAttribute('data-lang') === 'en'
        ? 'Connection error. Please try again.'
        : 'Erreur de connexion. Veuillez réessayer.';
      feedback.className = 'form-feedback error';
    }
  });
})();
