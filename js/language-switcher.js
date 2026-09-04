/* GLOBAL LANGUAGE SWITCHER — single source of truth */
(()=>{
  'use strict';

  const html=document.documentElement;
  const LANG_KEY='lnk-lang';

  const currentLanguage=()=>html.getAttribute('data-lang')==='en'||html.lang==='en'?'en':'fr';

  const render=(lang=currentLanguage())=>{
    document.querySelectorAll('.language-switcher').forEach(root=>{
      root.setAttribute('role','group');
      root.setAttribute('aria-label','Language');
      root.dataset.lnkLanguage='true';
      root.innerHTML=`<button type="button" class="language-option${lang==='fr'?' is-active':''}" data-lang="fr" aria-pressed="${lang==='fr'}">FR</button><span aria-hidden="true">|</span><button type="button" class="language-option${lang==='en'?' is-active':''}" data-lang="en" aria-pressed="${lang==='en'}">EN</button>`;
    });
  };

  const ensureMount=()=>{
    const existing=document.querySelector('.language-switcher');
    if(existing)return existing;
    const controls=document.querySelector('.header-controls');
    const errorHeader=document.querySelector('.error-header .header-inner');
    const mount=controls||errorHeader;
    if(!mount)return null;
    const root=document.createElement('div');
    root.className='language-switcher';
    root.dataset.lnkLanguage='true';
    mount.appendChild(root);
    return root;
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

  // Shared fallback behavior for pages without a content-specific language controller.
  document.addEventListener('click',(event)=>{
    const button=event.target.closest&&event.target.closest('.language-option');
    if(!button)return;
    const lang=button.getAttribute('data-lang');
    if(lang!=='fr'&&lang!=='en')return;
    const root=button.closest('.language-switcher');
    if(root)apply(lang,true);
  });

  document.addEventListener('lnk-lang-render',()=>render());
  window.LNKLanguage={get:currentLanguage,set:apply,refresh:render};
})();
