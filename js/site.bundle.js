/* LNK_DT performance loader
   Keeps the existing UI/structure intact while avoiding one large startup bundle.
   Non-critical sections are loaded only when they are needed. */
(() => {
  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-lnk-src="${src}"]`);
    if (existing) return resolve();
    const script = document.createElement('script');
    script.src = `${src}?v=be74ee0`;
    script.dataset.lnkSrc = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const loadAll = (files) => Promise.all(files.map(loadScript));

  // Small interaction scripts: load immediately after HTML parsing.
  loadAll([
    'js/navigation.js',
    'js/hero-motion.js',
    'js/services.js',
    'js/contact.js',
    'js/footer.js'
  ]).catch(() => {});

  // Portfolio is below the fold. Load it when the section approaches the viewport,
  // with idle-time fallback for browsers without IntersectionObserver.
  let portfolioStarted = false;
  const loadPortfolio = async () => {
    if (portfolioStarted) return;
    portfolioStarted = true;
    try {
      await loadScript('js/portfolio-catalog.js');
      await loadScript('js/portfolio.js');
    } catch (_) {}
  };

  // Testimonials are both below the fold and network-backed. Do not make the
  // reviews API part of the initial page-load critical path.
  let testimonialsStarted = false;
  const loadTestimonials = async () => {
    if (testimonialsStarted) return;
    testimonialsStarted = true;
    try { await loadScript('js/testimonials.js'); } catch (_) {}
  };

  const observeSection = (selector, callback) => {
    const target = document.querySelector(selector);
    if (!target) return;
    if (!('IntersectionObserver' in window)) {
      window.setTimeout(callback, 1200);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      callback();
    }, { rootMargin: '900px 0px' });
    observer.observe(target);
  };

  observeSection('#work', loadPortfolio);
  observeSection('#testimonials', loadTestimonials);

  // Safety net: idle-load deferred sections if the visitor never scrolls.
  const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 2500));
  idle(() => loadPortfolio());
  idle(() => loadTestimonials());
})();
