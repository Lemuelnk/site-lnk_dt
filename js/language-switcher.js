/* GLOBAL LANGUAGE STATE — single source of truth */
(() => {
  'use strict';

  const html = document.documentElement;
  const LANG_KEY = 'lnk-lang';
  const VALID_LANGS = new Set(['fr', 'en']);

  const isValid = lang => VALID_LANGS.has(lang);

  const pageName = () => {
    const path = location.pathname.split('/').pop();
    return path || 'index.html';
  };

  const isEnglishLegalPage = () =>
    /^(mentions-legales|politique-confidentialite)-en\.html$/i.test(pageName());

  const isFrenchLegalPage = () =>
    /^(mentions-legales|politique-confidentialite)\.html$/i.test(pageName());

  const routeLanguage = () => {
    const query = new URLSearchParams(location.search).get('lang');

    if (isValid(query)) return query;
    if (isEnglishLegalPage()) return 'en';
    if (isFrenchLegalPage()) return 'fr';

    return null;
  };

  const currentLanguage = () => {
    const route = routeLanguage();

    if (route) return route;

    const saved = localStorage.getItem(LANG_KEY);

    return isValid(saved) ? saved : 'fr';
  };

  const translateSharedNodes = lang => {
    document
      .querySelectorAll('[data-lang-fr][data-lang-en]')
      .forEach(node => {
        const fr = node.getAttribute('data-lang-fr');
        const en = node.getAttribute('data-lang-en');

        if (fr !== null && en !== null) {
          node.innerHTML = lang === 'en' ? en : fr;
        }
      });
  };

  const updateDocumentLanguage = lang => {
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);
  };

  const render = lang => {
    document.querySelectorAll('[data-lnk-language]').forEach(root => {
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', 'Language');
      root.classList.add('language-switcher');

      root.innerHTML = `
        <button
          type="button"
          class="language-option${lang === 'fr' ? ' is-active' : ''}"
          data-lang="fr"
          aria-pressed="${lang === 'fr'}"
        >FR</button>
        <span aria-hidden="true">|</span>
        <button
          type="button"
          class="language-option${lang === 'en' ? ' is-active' : ''}"
          data-lang="en"
          aria-pressed="${lang === 'en'}"
        >EN</button>
      `;
    });
  };

  const languageUrl = lang => {
    const current = pageName();

    if (current === 'mentions-legales.html' ||
        current === 'mentions-legales-en.html') {
      return lang === 'en'
        ? 'mentions-legales-en.html'
        : 'mentions-legales.html';
    }

    if (current === 'politique-confidentialite.html' ||
        current === 'politique-confidentialite-en.html') {
      return lang === 'en'
        ? 'politique-confidentialite-en.html'
        : 'politique-confidentialite.html';
    }

    const url = new URL(location.href);

    if (lang === 'en') {
      url.searchParams.set('lang', 'en');
    } else {
      url.searchParams.delete('lang');
    }

    return `${url.pathname}${url.search}${url.hash}`;
  };

  const apply = (lang, persist = true) => {
    const normalized = isValid(lang) ? lang : 'fr';

    updateDocumentLanguage(normalized);

    if (persist) {
      localStorage.setItem(LANG_KEY, normalized);
    }

    translateSharedNodes(normalized);
    render(normalized);

    document.dispatchEvent(
      new CustomEvent('lnk-lang-changed', {
        detail: normalized
      })
    );
  };

  const navigateToLanguage = lang => {
    if (!isValid(lang)) return;

    const current = currentLanguage();

    if (lang === current) {
      apply(lang, true);
      return;
    }

    const target = languageUrl(lang);
    const currentUrl =
      `${location.pathname}${location.search}${location.hash}`;

    if (target !== currentUrl) {
      localStorage.setItem(LANG_KEY, lang);
      location.href = target;
      return;
    }

    apply(lang, true);
  };

  apply(currentLanguage(), false);

  document.addEventListener('click', event => {
    const button =
      event.target.closest &&
      event.target.closest('[data-lnk-language] .language-option');

    if (!button) return;

    const lang = button.getAttribute('data-lang');

    if (isValid(lang)) {
      navigateToLanguage(lang);
    }
  });

  document.addEventListener('lnk-lang-render', () => {
    render(currentLanguage());
  });

  window.LNKLanguage = {
    get: currentLanguage,
    set: navigateToLanguage,
    apply,
    refresh: () => render(currentLanguage())
  };
})();
