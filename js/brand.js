(() => {
  const html = document.documentElement;

  const applyBrandLanguage = lang => {
    const normalized = lang === 'en' ? 'en' : 'fr';

    html.lang = normalized;
    html.setAttribute('data-lang', normalized);

    document.querySelectorAll('[data-fr][data-en]').forEach(node => {
      node.innerHTML = normalized === 'en'
        ? node.dataset.en
        : node.dataset.fr;
    });

    document.title = normalized === 'en'
      ? 'Brand identity — LNK Design Touch'
      : 'L’identité de marque — LNK Design Touch';
  };

  applyBrandLanguage(
    html.getAttribute('data-lang') ||
    (window.LNKLanguage ? window.LNKLanguage.get() : 'fr')
  );

  document.addEventListener('lnk-lang-changed', event => {
    applyBrandLanguage(event.detail);
  });
})();
