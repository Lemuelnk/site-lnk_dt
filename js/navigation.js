(()=>{
  'use strict';

  const html=document.documentElement;
  const THEME_KEY='lnk-theme';
  const systemTheme=()=>window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  const getTheme=()=>{
    const saved=localStorage.getItem(THEME_KEY);
    return saved==='dark'||saved==='light'?saved:systemTheme();
  };

  // Apply the persisted/system theme as early as this shared bundle allows.
  html.setAttribute('data-theme',getTheme());

  // Load the dedicated theme layer once. Keeping it separate prevents theme CSS from
  // leaking into page-specific bundles and makes future maintenance straightforward.
  if(!document.querySelector('link[data-lnk-dark-mode]')){
    const themeLink=document.createElement('link');
    themeLink.rel='stylesheet';
    themeLink.href='/css/dark-mode.css';
    themeLink.dataset.lnkDarkMode='true';
    document.head.appendChild(themeLink);
  }

  const updateLogos=(theme)=>{
    document.querySelectorAll('.brand-logo, .footer-logo img').forEach(img=>{
      const src=img.getAttribute('src');
      if(!src)return;
      if(theme==='dark') img.setAttribute('src',src.replace('-dark.svg','-light.svg'));
      else img.setAttribute('src',src.replace('-light.svg','-dark.svg'));
    });
  };

  const updateThemeButton=(theme)=>{
    const toggle=document.getElementById('theme-toggle');
    if(!toggle)return;
    const dark=theme==='dark';
    toggle.setAttribute('aria-pressed',String(dark));
    toggle.setAttribute('aria-label',dark?'Activer le mode clair':'Activer le mode sombre');
    toggle.setAttribute('title',dark?'Mode clair':'Mode sombre');
    toggle.dataset.theme=theme;
    const sun=toggle.querySelector('.sun-icon');
    const moon=toggle.querySelector('.moon-icon');
    if(sun) sun.hidden=!dark;
    if(moon) moon.hidden=dark;
    if(window.lucide) window.lucide.createIcons();
  };

  const applyTheme=(theme,persist=true)=>{
    const normalized=theme==='dark'?'dark':'light';
    html.setAttribute('data-theme',normalized);
    if(persist)localStorage.setItem(THEME_KEY,normalized);
    updateLogos(normalized);
    updateThemeButton(normalized);
    document.dispatchEvent(new CustomEvent('lnk-theme-changed',{detail:normalized}));
  };

  const ensureThemeToggle=()=>{
    let toggle=document.getElementById('theme-toggle');
    const controls=document.querySelector('.header-controls');
    if(!toggle&&controls){
      toggle=document.createElement('button');
      toggle.id='theme-toggle';
      toggle.className='theme-toggle';
      toggle.type='button';
      toggle.innerHTML='<i data-lucide="sun" class="sun-icon" aria-hidden="true"></i><i data-lucide="moon" class="moon-icon" aria-hidden="true"></i>';
      const language=controls.querySelector('.language-switcher');
      controls.insertBefore(toggle,language||controls.firstChild);
    }
    if(!toggle)return;
    updateThemeButton(html.getAttribute('data-theme')||getTheme());
  };

  // Capture phase intentionally owns the click so legacy page scripts cannot register
  // a second theme handler and toggle twice.
  document.addEventListener('click',(event)=>{
    const toggle=event.target.closest&&event.target.closest('#theme-toggle');
    if(!toggle)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const current=html.getAttribute('data-theme')||getTheme();
    applyTheme(current==='dark'?'light':'dark',true);
  },true);

  window.LNKTheme={get:()=>html.getAttribute('data-theme')||getTheme(),set:applyTheme,toggle:()=>applyTheme((html.getAttribute('data-theme')||getTheme())==='dark'?'light':'dark')};

  const b=document.querySelector('.menu-toggle'),n=document.querySelector('#site-nav'),h=document.querySelector('.site-header');
  ensureThemeToggle();
  if(!b||!n||!h)return;

  const setOpen=(open)=>{
    b.setAttribute('aria-expanded',String(open));
    b.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
    n.dataset.open=String(open);
  };

  b.addEventListener('click',()=>setOpen(b.getAttribute('aria-expanded')!=='true'));
  n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
  document.addEventListener('click',e=>{
    if(window.innerWidth<=760&&n.dataset.open==='true'&&!n.contains(e.target)&&!b.contains(e.target))setOpen(false);
  });
  window.addEventListener('resize',()=>{if(window.innerWidth>760)setOpen(false)});

  let lastScroll=0;
  window.addEventListener('scroll',()=>{
    const currentScroll=window.pageYOffset;
    if(currentScroll<=0){h.classList.remove('header-hidden');return;}
    if(currentScroll>lastScroll&&!h.classList.contains('header-hidden')&&currentScroll>100){
      if(n.dataset.open!=='true')h.classList.add('header-hidden');
    }else if(currentScroll<lastScroll&&h.classList.contains('header-hidden'))h.classList.remove('header-hidden');
    lastScroll=currentScroll;
  },{passive:true});

  const progressContainer=document.createElement('div');
  progressContainer.className='reading-progress';
  const progressBar=document.createElement('div');
  progressBar.className='reading-progress-bar';
  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);

  window.addEventListener('scroll',()=>{
    const winScroll=document.body.scrollTop||document.documentElement.scrollTop;
    const height=document.documentElement.scrollHeight-document.documentElement.clientHeight;
    const scrolled=height>0?(winScroll/height)*100:0;
    progressBar.style.width=scrolled+'%';
    progressContainer.style.opacity=winScroll>200?1:0;
  },{passive:true});

  const magneticBtns=document.querySelectorAll('.button,.nav-cta,.portfolio-case-study-btn');
  magneticBtns.forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const rect=btn.getBoundingClientRect();
      const x=e.clientX-rect.left-rect.width/2;
      const y=e.clientY-rect.top-rect.height/2;
      btn.style.transform=`translate(${x*.15}px,${y*.15}px)`;
    });
    btn.addEventListener('mouseleave',()=>{btn.style.transform='';});
  });

  const media=window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener?.('change',()=>{
    if(!localStorage.getItem(THEME_KEY))applyTheme(systemTheme(),false);
  });
})();
