(() => {
  const html = document.documentElement;
  const nodes = [...document.querySelectorAll('[data-fr][data-en]')];
  const query = new URLSearchParams(location.search).get('lang');
  const saved = localStorage.getItem('lnk-lang');
  const initial = query === 'en' || query === 'fr' ? query : (saved === 'en' ? 'en' : 'fr');

  function applyLanguage(lang) {
    const normalized = lang === 'en' ? 'en' : 'fr';
    html.lang = normalized;
    html.setAttribute('data-lang', normalized);
    nodes.forEach(node => { node.innerHTML = node.dataset[normalized]; });
    document.title = normalized === 'en'
      ? 'Brand identity — LNK Design Touch'
      : 'L’identité de marque — LNK Design Touch';
  }

  applyLanguage(initial);
  document.addEventListener('lnk-lang-changed', event => applyLanguage(event.detail));
})();
