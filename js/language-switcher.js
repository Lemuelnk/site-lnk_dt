/* GLOBAL LANGUAGE SWITCHER — single source of truth */
(()=>{
  'use strict';

  const html=document.documentElement;
  const LANG_KEY='lnk-lang';

  const currentLanguage=()=>html.getAttribute('data-lang')==='en'||html.lang==='en'?'en':'fr';

  const render=(lang=currentLanguage())=>{
    document.querySelectorAll('[data-lnk-language]').forEach(root=>{
      root.classList.add('language-switcher');
      root.setAttribute('role','group');
      root.setAttribute('aria-label','Language');
      root.innerHTML=`<button type="button" class="language-option${lang==='fr'?' is-active':''}" data-lang="fr" aria-pressed="${lang==='fr'}">FR</button><span aria-hidden="true">|</span><button type="button" class="language-option${lang==='en'?' is-active':''}" data-lang="en" aria-pressed="${lang==='en'}">EN</button>`;
    });
  };

  const ensureMount=()=>{
    if(document.querySelector('[data-lnk-language],.language-switcher'))return;
    const controls=document.querySelector('.header-controls');
    const errorHeader=document.querySelector('.error-header .header-inner');
    const mount=controls||errorHeader;
    if(!mount)return;
    const root=document.createElement('div');
    root.dataset.lnkLanguage='true';
    if(controls) controls.appendChild(root);
    else mount.appendChild(root);
  };

  const apply=(lang,persist=true)=>{
    const normalized=lang==='en'?'en':'fr';
    html.setAttribute('data-lang',normalized);
    html.lang=normalized;
    if(persist)localStorage.setItem(LANG_KEY,normalized);
    render(normalized);
    document.dispatchEvent(new CustomEvent('lnk-lang-changed',{detail:normalized}));
  };

  ensureMount();
  render();

  // The switcher owns only its shared UI state. Page-specific language modules
  // may still listen to the same buttons for their content-specific behavior.
  document.addEventListener('click',(event)=>{
    const button=event.target.closest&&event.target.closest('.language-option');
    if(!button)return;
    const lang=button.getAttribute('data-lang');
    if(lang!=='fr'&&lang!=='en')return;
    const pageSpecificHandler=button.closest('[data-lnk-page-language]');
    if(pageSpecificHandler)return;
    apply(lang,true);
  });

  document.addEventListener('lnk-lang-render',()=>render());
  window.LNKLanguage={get:currentLanguage,set:apply,refresh:render};
})();
