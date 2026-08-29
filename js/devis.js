// Devis — interactive quote estimator
(function () {
  const html = document.documentElement;
  const saved = localStorage.getItem('lnk-lang');
  const param = new URLSearchParams(location.search).get('lang');
  const initialLang = param === 'en' ? 'en' : (saved === 'en' ? 'en' : 'fr');
  html.setAttribute('data-lang', initialLang);

  const langOptions = document.querySelectorAll('.language-option');
  const steps = document.querySelectorAll('.devis-step');
  const nextBtns = document.querySelectorAll('.next-step');
  const prevBtns = document.querySelectorAll('.prev-step');
  const calculator = document.querySelector('.devis-calculator');
  const options = document.querySelector('.devis-options');

  // Step 1 is currently rendered outside .devis-step in the HTML.
  // Treat those direct children as the first wizard step so Back/Next works
  // exactly like the other steps without changing the visual structure.
  const firstStepElements = options
    ? Array.from(options.children).filter(el => !el.classList.contains('devis-step'))
    : [];

  // Create the missing wizard progress indicators from the actual five steps.
  let progress = document.querySelector('.devis-steps-nav');
  if (!progress && options) {
    progress = document.createElement('div');
    progress.className = 'devis-steps-nav';
    progress.setAttribute('aria-label', 'Quote progress');
    progress.innerHTML = [1, 2, 3, 4, 5]
      .map(step => `<span class="step-indicator${step === 1 ? ' active' : ''}" data-step="${step}" aria-label="Step ${step}">${step}</span>`)
      .join('');
    options.prepend(progress);
  }
  const indicators = document.querySelectorAll('.step-indicator');

  function applyLanguage() {
    const lang = html.getAttribute('data-lang');
    const en = lang === 'en';
    localStorage.setItem('lnk-lang', lang);

    document.querySelectorAll('[data-lang-fr][data-lang-en]').forEach(el => {
      const fr = el.getAttribute('data-lang-fr');
      const enText = el.getAttribute('data-lang-en');
      if (fr && enText) el.textContent = en ? enText : fr;
    });

    langOptions.forEach(btn => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    updateRateDisplay();
    updateResult();
  }

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
  let CDF_PER_USD = 2265; // Fallback rate

  let lastFetchedDate = null;

  async function fetchExchangeRate() {
    const rateEl = document.getElementById('exchangeRate');
    if (rateEl) {
      const lang = html.getAttribute('data-lang');
      rateEl.textContent = lang === 'en' ? 'Updating exchange rate...' : 'Mise à jour du taux de change...';
    }

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data && data.rates && data.rates.CDF) {
        CDF_PER_USD = Math.round(data.rates.CDF);
        lastFetchedDate = data.date;
        updateRateDisplay(data.date);
        updateResult();
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      updateRateDisplay(); // Use current date and fallback rate
    }
  }

  function updateRateDisplay(dateStr) {
    const rateEl = document.getElementById('exchangeRate');
    if (!rateEl) return;
    
    const date = (dateStr || lastFetchedDate) ? new Date(dateStr || lastFetchedDate) : new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const lang = html.getAttribute('data-lang');
    const formattedDate = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', options);
    const formattedRate = new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'fr-FR').format(CDF_PER_USD);

    if (lang === 'en') {
      rateEl.innerHTML = `<i data-lucide="info" style="width: 14px; height: 14px; margin-right: 6px;"></i> Indicative rate: 1 USD = ${formattedRate} CDF · ${formattedDate}`;
    } else {
      rateEl.innerHTML = `<i data-lucide="info" style="width: 14px; height: 14px; margin-right: 6px;"></i> Taux indicatif : 1 USD = ${formattedRate} FC · ${formattedDate}`;
    }
    rateEl.style.display = 'flex';
    rateEl.style.alignItems = 'center';
    rateEl.style.justifyContent = 'center';
    if (window.lucide) window.lucide.createIcons();
  }

  function goToStep(stepNumber) {
    const safeStep = Math.min(5, Math.max(1, Number(stepNumber) || 1));

    // Hide every step first.
    steps.forEach(step => step.classList.remove('active'));
    
    // Also handle step 1 visibility if it's not a .devis-step
    if (options) {
      const isFirstStep = safeStep === 1;
      firstStepElements.forEach(el => {
        if (!el.classList.contains('devis-steps-nav')) {
          el.style.display = isFirstStep ? '' : 'none';
        }
      });
    }

    // Show the requested step.
    const currentStep = document.querySelector(`.devis-step[data-step="${safeStep}"]`);
    if (currentStep) currentStep.classList.add('active');

    indicators.forEach(indicator => {
      const indicatorStep = Number(indicator.getAttribute('data-step'));
      indicator.classList.toggle('active', indicatorStep === safeStep);
      indicator.classList.toggle('completed', indicatorStep < safeStep);
      indicator.setAttribute('aria-current', indicatorStep === safeStep ? 'step' : 'false');
    });

    if (calculator && stepNumber !== 1) {
      window.scrollTo({
        top: calculator.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  }

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(parseInt(btn.getAttribute('data-next'), 10));
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(parseInt(btn.getAttribute('data-prev'), 10));
    });
  });

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
    if (quantity > 1) {
      quantity--;
      if (qtyValue) qtyValue.textContent = quantity;
      updateResult();
    }
  });
  qtyPlus?.addEventListener('click', () => {
    if (quantity < 99) {
      quantity++;
      if (qtyValue) qtyValue.textContent = quantity;
      updateResult();
    }
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
      const complexity = btn.getAttribute('data-complexity');
      if (complexity === 'simple') complexityMultiplier = 0.8;
      else if (complexity === 'premium') complexityMultiplier = 1.4;
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
    if (!minEl || !maxEl) return;

    const en = html.getAttribute('data-lang') === 'en';
    const noteEl = document.getElementById('resultNote');
    const rateEl = document.getElementById('exchangeRate');

    if (!selectedService || !prices[selectedService]) {
      minEl.textContent = '—';
      maxEl.textContent = '—';
      return;
    }

    const p = prices[selectedService];
    const usdMin = Math.round(p.min * quantity * urgencyMultiplier * complexityMultiplier);
    const usdMax = Math.round(p.max * quantity * urgencyMultiplier * complexityMultiplier);

    if (currency === 'cdf') {
      const cdfMin = usdMin * CDF_PER_USD;
      const cdfMax = usdMax * CDF_PER_USD;
      const formatCdf = value => new Intl.NumberFormat(en ? 'en-US' : 'fr-FR').format(value);
      minEl.textContent = en ? `FC ${formatCdf(cdfMin)}` : `${formatCdf(cdfMin)} FC`;
      maxEl.textContent = en ? `FC ${formatCdf(cdfMax)}` : `${formatCdf(cdfMax)} FC`;
      if (noteEl) noteEl.textContent = en
        ? 'Indicative price in CDF. Final rate confirmed after discussion.'
        : 'Prix indicatif en CDF. Le tarif final sera confirmé après échange.';
    } else {
      minEl.textContent = en ? `$${usdMin}` : `${usdMin}$`;
      maxEl.textContent = en ? `$${usdMax}` : `${usdMax}$`;
      if (noteEl) noteEl.textContent = en
        ? 'Indicative price in USD. Final rate confirmed after discussion.'
        : 'Prix indicatif en USD. Le tarif final sera confirmé après échange.';
    }

    // Always show rate for transparency, but maybe style it differently or keep it.
    if (rateEl) rateEl.style.display = 'block';
  }

  // Initialize defaults.
  if (serviceCards.length > 0) {
    serviceCards[0].classList.add('active');
    selectedService = serviceCards[0].getAttribute('data-service');
  }
  urgencyBtns[0]?.classList.add('active');
  complexityBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-complexity') === 'standard'));

  // Start on step 1 and then apply language/result state.
  goToStep(1);
  applyLanguage();
  updateResult();
  fetchExchangeRate();
})();
