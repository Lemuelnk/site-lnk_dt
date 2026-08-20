// Devis — interactive quote estimator

(function () {
  const html = document.documentElement;
  const saved = localStorage.getItem('lnk-lang');
  const param = new URLSearchParams(location.search).get('lang');
  const initialLang = param === 'en' ? 'en' : (saved === 'en' ? 'en' : 'fr');
  html.setAttribute('data-lang', initialLang);

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
    const langOptions = document.querySelectorAll('.language-option');
    if (sw) sw.textContent = en ? 'FR' : 'EN';
    updateResult();
  }

  applyLanguage();
  langOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      langOptions.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      html.setAttribute('data-lang', btn.getAttribute('data-lang'));
      applyLanguage();
    });
  });

  // State
  let selectedService = null;
  let quantity = 1;
  let urgencyMultiplier = 1;
  let complexityMultiplier = 1;

  // Service selection
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedService = card.getAttribute('data-service');
      updateResult();
    });
  });

  // Quantity
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');

  qtyMinus?.addEventListener('click', () => {
    if (quantity > 1) { quantity--; qtyValue.textContent = quantity; updateResult(); }
  });
  qtyPlus?.addEventListener('click', () => {
    if (quantity < 99) { quantity++; qtyValue.textContent = quantity; updateResult(); }
  });

  // Urgency
  const urgencyBtns = document.querySelectorAll('.urgency-btn');
  urgencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      urgencyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      urgencyMultiplier = parseFloat(btn.getAttribute('data-multiplier')) || 1;
      updateResult();
    });
  });

  // Complexity
  const complexityBtns = document.querySelectorAll('.complexity-btn');
  complexityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      complexityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const c = btn.getAttribute('data-complexity');
      if (c === 'simple') complexityMultiplier = 0.8;
      else if (c === 'premium') complexityMultiplier = 1.4;
      else complexityMultiplier = 1;
      updateResult();
    });
  });

  // Price ranges per service (min, max in USD)
  const prices = {
    affiche:    { min: 5,  max: 25 },
    branding:   { min: 50, max: 200 },
    social:     { min: 5,  max: 15 },
    banniere:   { min: 10, max: 30 },
    calendrier: { min: 15, max: 40 },
    invitation: { min: 10, max: 25 },
    motion:     { min: 30, max: 100 }
  };

  function updateResult() {
    const minEl = document.getElementById('resultMin');
    const maxEl = document.getElementById('resultMax');
    const en = html.getAttribute('data-lang') === 'en';

    if (!selectedService || !prices[selectedService]) {
      minEl.textContent = '—';
      maxEl.textContent = '—';
      return;
    }

    const p = prices[selectedService];
    const finalMin = Math.round(p.min * quantity * urgencyMultiplier * complexityMultiplier);
    const finalMax = Math.round(p.max * quantity * urgencyMultiplier * complexityMultiplier);

    if (en) {
      minEl.textContent = `$${finalMin}`;
      maxEl.textContent = `$${finalMax}`;
    } else {
      minEl.textContent = `${finalMin}$`;
      maxEl.textContent = `${finalMax}$`;
    }
  }

  // Initialize with first selection
  if (serviceCards.length > 0) {
    serviceCards[0].classList.add('active');
    selectedService = serviceCards[0].getAttribute('data-service');
    urgencyBtns[0]?.classList.add('active');
  }
  updateResult();
})();
