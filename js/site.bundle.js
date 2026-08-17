/* LNK_DT performance loader
   Keeps the existing UI/structure intact while moving non-critical JavaScript
   off the critical rendering path. */
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

  const loadAll = files => Promise.all(files.map(loadScript));
  const idle = window.requestIdleCallback || (cb => window.setTimeout(cb, 1800));

  // Critical interaction only: tiny scripts required immediately after first paint.
  loadAll(['js/navigation.js', 'js/services.js']).catch(() => {});

  // Load a feature when it approaches the viewport. This preserves its behavior
  // without making it part of the initial JavaScript critical path.
  const observe = (selector, callback) => {
    const target = document.querySelector(selector);
    if (!target) return;
    if (!('IntersectionObserver' in window)) {
      window.setTimeout(callback, 1200);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      callback();
    }, { rootMargin: '700px 0px' });
    observer.observe(target);
  };

  let portfolioStarted = false;
  const loadPortfolio = async () => {
    if (portfolioStarted) return;
    portfolioStarted = true;
    try {
      await loadScript('js/portfolio-catalog.js');
      await loadScript('js/portfolio.js');
    } catch (_) {}
  };

  let testimonialsStarted = false;
  const loadTestimonials = async () => {
    if (testimonialsStarted) return;
    testimonialsStarted = true;
    try { await loadScript('js/testimonials.js'); } catch (_) {}
  };

  let contactStarted = false;
  const loadContact = async () => {
    if (contactStarted) return;
    contactStarted = true;
    try { await loadScript('js/contact.js'); } catch (_) {}
  };

  observe('#work', loadPortfolio);
  observe('#testimonials', loadTestimonials);
  observe('#contact', loadContact);

  // Visual-only and footer behavior can wait until the browser is idle.
  idle(() => loadScript('js/hero-motion.js').catch(() => {}));
  idle(() => loadScript('js/footer.js').catch(() => {}));

  // Safety net: if a visitor never scrolls, initialize deferred features later.
  idle(() => loadPortfolio());
  idle(() => loadTestimonials());
})();
