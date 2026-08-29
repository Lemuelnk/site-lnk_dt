(()=>{
  const b=document.querySelector('.menu-toggle'),n=document.querySelector('#site-nav'),h=document.querySelector('.site-header');
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
    if(window.innerWidth<=760 && n.dataset.open==='true' && !n.contains(e.target) && !b.contains(e.target))setOpen(false);
  });
  window.addEventListener('resize',()=>{if(window.innerWidth>760)setOpen(false)});
  
  // Lucide initialization is now handled via inline scripts in HTML for better reliability with bundles.

  // Smart Sticky Header logic
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= 0) {
      h.classList.remove('header-hidden');
      return;
    }
    if (currentScroll > lastScroll && !h.classList.contains('header-hidden') && currentScroll > 100) {
      // Scrolling down - hide header
      if (n.dataset.open !== 'true') {
        h.classList.add('header-hidden');
      }
    } else if (currentScroll < lastScroll && h.classList.contains('header-hidden')) {
      // Scrolling up - show header
      h.classList.remove('header-hidden');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Reading Progress Bar
  const progressContainer = document.createElement('div');
  progressContainer.className = 'reading-progress';
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
    progressContainer.style.opacity = winScroll > 200 ? 1 : 0;
  }, { passive: true });

  // Magnetic Button Effect (Discreet)
  const magneticBtns = document.querySelectorAll('.button, .nav-cta, .portfolio-case-study-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();
