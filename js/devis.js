// Devis — interactive quote estimator
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
    // Update language button states
    langOptions.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
    updateResult();
  }

  // Language toggle event listeners
  langOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      html.setAttribute('data-lang', btn.getAttribute('data-lang'));
      applyLanguage();
    });
  });

  // State
  let selectedService = null;
  let quantity = 1;
  let urgencyMultiplier = 1;
  let complexityMultiplier = 1;
  let currency = 'usd';
  const CDF_PER_USD = 2265;

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

  // Currency selector
  const currencyBtns = document.querySelectorAll('.currency-btn');
  currencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currency = btn.getAttribute('data-currency') === 'cdf' ? 'cdf' : 'usd';
      currencyBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
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
    const usdMin = Math.round(p.min * quantity * urgencyMultiplier * complexityMultiplier);
    const usdMax = Math.round(p.max * quantity * urgencyMultiplier * complexityMultiplier);
    const noteEl = document.getElementById('resultNote');
    const rateEl = document.getElementById('exchangeRate');
    if (currency === 'cdf') {
      const cdfMin = usdMin * CDF_PER_USD;
      const cdfMax = usdMax * CDF_PER_USD;
      const formatCdf = value => new Intl.NumberFormat(en ? 'en-US' : 'fr-FR').format(value);
      minEl.textContent = en ? `FC ${formatCdf(cdfMin)}` : `${formatCdf(cdfMin)} FC`;
      maxEl.textContent = en ? `FC ${formatCdf(cdfMax)}` : `${formatCdf(cdfMax)} FC`;
      if (noteEl) noteEl.textContent = en ? 'Indicative price in CDF. Final rate confirmed after discussion.' : 'Prix indicatif en CDF. Le tarif final sera confirmé après échange.';
    } else {
      minEl.textContent = en ? `$${usdMin}` : `${usdMin}$`;
      maxEl.textContent = en ? `$${usdMax}` : `${usdMax}$`;
      if (noteEl) noteEl.textContent = en ? 'Indicative price in USD. Final rate confirmed after discussion.' : 'Prix indicatif en USD. Le tarif final sera confirmé après échange.';
    }
    if (rateEl) rateEl.hidden = currency !== 'cdf';
  }

  // Initialize with first selection
  if (serviceCards.length > 0) {
    serviceCards[0].classList.add('active');
    selectedService = serviceCards[0].getAttribute('data-service');
    urgencyBtns[0]?.classList.add('active');
  }
  applyLanguage();
  updateResult();
})();
