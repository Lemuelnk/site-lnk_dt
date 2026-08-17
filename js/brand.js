(() => {
  const buttons = [...document.querySelectorAll('[data-brand-lang]')];
  const nodes = [...document.querySelectorAll('[data-fr][data-en]')];
  const stored = localStorage.getItem('lnk-language');
  const query = new URLSearchParams(location.search).get('lang');
  const initial = query === 'en' || query === 'fr' ? query : (stored === 'en' ? 'en' : 'fr');
  function applyLanguage(lang){
    document.documentElement.lang = lang;
    nodes.forEach(node => { node.innerHTML = node.dataset[lang]; });
    buttons.forEach(button => { button.classList.toggle('is-active', button.dataset.brandLang === lang); });
    localStorage.setItem('lnk-language', lang);
    document.title = lang === 'en' ? 'Brand identity — LNK Design Touch' : 'L’identité de marque — LNK Design Touch';
  }
  buttons.forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.brandLang)));
  applyLanguage(initial);
})();
