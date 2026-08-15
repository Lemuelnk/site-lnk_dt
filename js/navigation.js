(()=>{
  const b=document.querySelector('.menu-toggle'),n=document.querySelector('#site-nav');
  if(!b||!n)return;
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
})();
