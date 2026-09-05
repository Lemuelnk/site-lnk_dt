/* GLOBAL LANGUAGE STATE — single source of truth */
(()=>{
  'use strict';

  const html=document.documentElement;
  const LANG_KEY='lnk-lang';
  const isHome=()=>location.pathname==='/'||location.pathname.endsWith('/index.html');
  const valid=lang=>lang==='en'||lang==='fr';

  html.setAttribute('data-lnk-home',String(isHome()));

  const routeLanguage=()=>{
    const query=new URLSearchParams(location.search).get('lang');
    if(valid(query))return query;
    if(/(?:^|[-_])en\.html$/i.test(location.pathname))return 'en';
    return null;
  };

  const currentLanguage=()=>{
    const explicit=routeLanguage();
    if(explicit)return explicit;
    const saved=localStorage.getItem(LANG_KEY);
    if(valid(saved))return saved;
    return html.getAttribute('data-lang')==='en'||html.lang==='en'?'en':'fr';
  };

  const translateSharedNodes=lang=>{
    document.querySelectorAll('[data-lang-fr][data-lang-en]').forEach(node=>{
      const fr=node.getAttribute('data-lang-fr');
      const en=node.getAttribute('data-lang-en');
      if(fr&&en)node.textContent=lang==='en'?en:fr;
    });
  };

  const render=lang=>{
    if(!isHome())return;
    document.querySelectorAll('[data-lnk-language]').forEach(root=>{
      root.setAttribute('role','group');
      root.setAttribute('aria-label','Language');
      root.classList.add('language-switcher');
      root.innerHTML=`<button type="button" class="language-option${lang==='fr'?' is-active':''}" data-lang="fr" aria-pressed="${lang==='fr'}">FR</button><span aria-hidden="true">|</span><button type="button" class="language-option${lang==='en'?' is-active':''}" data-lang="en" aria-pressed="${lang==='en'}">EN</button>`;
    });
  };

  const apply=(lang,persist=true)=>{
    const normalized=valid(lang)?lang:'fr';
    html.setAttribute('data-lang',normalized);
    html.lang=normalized;
    if(persist)localStorage.setItem(LANG_KEY,normalized);
    translateSharedNodes(normalized);
    render(normalized);
    document.dispatchEvent(new CustomEvent('lnk-lang-changed',{detail:normalized}));
  };

  // Secondary pages consume the saved preference; only the homepage exposes controls.
  apply(currentLanguage(),false);

  document.addEventListener('click',(event)=>{
    const button=event.target.closest&&event.target.closest('[data-lnk-language] .language-option');
    if(!button)return;
    const lang=button.getAttribute('data-lang');
    if(valid(lang))apply(lang,true);
  });

  document.addEventListener('lnk-lang-render',()=>render(currentLanguage()));
  window.LNKLanguage={get:currentLanguage,set:apply,refresh:()=>render(currentLanguage())};
})();
