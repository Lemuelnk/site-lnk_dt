/* ===== js/navigation.js ===== */
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

/* ===== js/hero-motion.js ===== */
/* HERO pointer micro-parallax — desktop only.
   No layout changes; moves only the decorative visual group by a few pixels. */
(() => {
  const visual = document.querySelector('.hero-visual');
  if (!visual) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let frame = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const render = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    visual.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`);
    visual.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`);

    if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
      frame = requestAnimationFrame(render);
    } else {
      frame = null;
    }
  };

  const onPointerMove = (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    targetX = Math.max(-1, Math.min(1, x)) * 5;
    targetY = Math.max(-1, Math.min(1, y)) * 4;
    if (!frame) frame = requestAnimationFrame(render);
  };

  const reset = () => {
    targetX = 0;
    targetY = 0;
    if (!frame) frame = requestAnimationFrame(render);
  };

  visual.addEventListener('pointermove', onPointerMove, { passive: true });
  visual.addEventListener('pointerleave', reset, { passive: true });
})();

/* ===== js/services.js ===== */
/* SERVICES — interactive list / mobile accordion
   Desktop: one service can be selected without changing the overall page composition.
   Mobile: services behave as an accordion to keep the section compact and readable.
*/
(() => {
  const list = document.querySelector('[data-services]');
  if (!list) return;

  const items = [...list.querySelectorAll('[data-service-item]')];
  const mobileQuery = window.matchMedia('(max-width: 620px)');

  const setActive = (item, open = true) => {
    items.forEach((other) => {
      const button = other.querySelector('.service-toggle');
      const isActive = other === item && open;
      other.classList.toggle('is-active', isActive);
      button.setAttribute('aria-expanded', String(isActive));
    });
  };

  items.forEach((item) => {
    const button = item.querySelector('.service-toggle');
    button.addEventListener('click', () => {
      if (mobileQuery.matches) {
        const currentlyOpen = item.classList.contains('is-active');
        if (currentlyOpen) {
          item.classList.remove('is-active');
          button.setAttribute('aria-expanded', 'false');
        } else {
          setActive(item, true);
        }
        return;
      }

      setActive(item, true);
    });
  });

  // Keep a stable initial state when the viewport crosses the mobile breakpoint.
  const syncBreakpoint = () => {
    const active = list.querySelector('[data-service-item].is-active');
    if (!active && !mobileQuery.matches) setActive(items[0], true);
    if (!active && mobileQuery.matches) setActive(items[0], true);
  };

  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncBreakpoint);
  else mobileQuery.addListener(syncBreakpoint);
})();

/* ===== js/portfolio.js ===== */
(() => {
  const filters = [...document.querySelectorAll('.filter')];
  const grid = document.querySelector('#portfolio-grid');
  if (!filters.length || !grid) return;

  const data = {
    categories: [
      { id: 'affiches', label: 'Affiches', variant: 'teal' },
      { id: 'branding', label: 'Branding', variant: 'dark' },
      { id: 'bannieres', label: 'Bannières', variant: 'coral' },
      { id: 'social-media', label: 'Social Media', variant: 'light' },
      { id: 'calendriers', label: 'Calendriers', variant: 'dark' },
      { id: 'plus', label: 'Et plus encore', variant: 'coral' }
    ],
    projects: []
  };

  const categoryMap = Object.fromEntries(data.categories.map(c => [c.id, c]));
  let currentCategory = 'all';
  let lightboxItems = [];
  let lightboxIndex = 0;
  let zoom = 1;
  let startX = 0;
  let startY = 0;
  let isPointerDown = false;
  let moved = false;

  function getCategoryProjects(categoryId) {
    return data.projects.filter(project => project.category === categoryId).slice(0, 6);
  }

  function sampleCard(category) {
    const article = document.createElement('article');
    article.className = 'portfolio-card';
    article.dataset.category = category.id;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'portfolio-card-button';
    button.setAttribute('aria-label', `Ouvrir ${category.label} en grand`);

    const visual = document.createElement('div');
    visual.className = 'portfolio-visual';

    const art = document.createElement('div');
    art.className = `portfolio-placeholder-art ${category.variant === 'dark' ? 'alt' : ''} ${category.variant === 'coral' ? 'warm' : ''} ${category.variant === 'light' ? 'light' : ''}`;

    const index = document.createElement('span');
    index.textContent = `${String(data.categories.indexOf(category) + 1).padStart(2, '0')} / SAMPLE`;

    const title = document.createElement('i');
    title.textContent = category.id === 'plus' ? 'ET PLUS' : category.label.toUpperCase();

    art.append(index, title);
    visual.appendChild(art);

    const meta = document.createElement('div');
    meta.className = 'portfolio-card-meta';
    meta.innerHTML = `<span>${category.label}</span><strong>Échantillon</strong>`;

    button.append(visual, meta);
    article.appendChild(button);

    button.addEventListener('click', () => {
      if (moved) return;
      const projects = getCategoryProjects(category.id);
      if (projects.length) {
        openLightbox(projects, 0, category.label);
      } else {
        openLightbox([{ type: 'sample', category, title: 'Échantillon' }], 0, category.label);
      }
    });
    return article;
  }

  function projectCard(project, position) {
    const category = categoryMap[project.category];
    const article = document.createElement('article');
    article.className = 'portfolio-card';
    article.dataset.category = project.category;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'portfolio-card-button';
    button.setAttribute('aria-label', `Ouvrir ${project.title || `réalisation ${position}`} en grand`);

    const visual = document.createElement('div');
    visual.className = 'portfolio-visual';

    const image = document.createElement('img');
    image.className = 'portfolio-image';
    image.src = project.image;
    image.alt = project.alt || project.title || `${category.label} — réalisation ${position}`;
    image.loading = 'lazy';
    visual.appendChild(image);

    const meta = document.createElement('div');
    meta.className = 'portfolio-card-meta';
    meta.innerHTML = `<span>${category.label}</span><strong>${project.title}</strong>`;

    button.append(visual, meta);
    article.appendChild(button);

    button.addEventListener('click', () => {
      if (moved) return;
      const projects = getCategoryProjects(project.category);
      const index = Math.max(0, projects.findIndex(item => item === project));
      openLightbox(projects, index, category.label);
    });

    return article;
  }

  function setActive(categoryId) {
    filters.forEach(filter => {
      const active = filter.dataset.filter === categoryId;
      filter.classList.toggle('is-active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
  }

  function render(categoryId = 'all') {
    currentCategory = categoryId;
    grid.innerHTML = '';

    if (categoryId === 'all') {
      data.categories.forEach(category => grid.appendChild(sampleCard(category)));
      setActive('all');
      window.lnkApplyLanguage?.(document.documentElement.lang || 'fr');
      return;
    }

    const category = categoryMap[categoryId];
    if (!category) return;

    setActive(categoryId);
    grid.appendChild(sampleCard(category));

    const projects = getCategoryProjects(categoryId);
    projects.slice(0, 5).forEach((project, index) => {
      grid.appendChild(projectCard(project, index + 2));
    });
    window.lnkApplyLanguage?.(document.documentElement.lang || 'fr');
  }

  function ensureLightbox() {
    if (document.querySelector('#portfolio-lightbox')) return;

    const dialog = document.createElement('dialog');
    dialog.id = 'portfolio-lightbox';
    dialog.className = 'portfolio-lightbox';
    dialog.setAttribute('aria-labelledby', 'portfolio-lightbox-title');
    dialog.innerHTML = `
      <div class="portfolio-lightbox-shell">
        <div class="portfolio-lightbox-topbar">
          <div>
            <p class="portfolio-lightbox-kicker" id="portfolio-lightbox-category"></p>
            <h3 id="portfolio-lightbox-title"></h3>
          </div>
          <div class="portfolio-lightbox-actions">
            <button type="button" class="portfolio-lightbox-control" data-action="zoom-out" aria-label="Réduire">−</button>
            <button type="button" class="portfolio-lightbox-control" data-action="zoom-reset" aria-label="Réinitialiser le zoom">100%</button>
            <button type="button" class="portfolio-lightbox-control" data-action="zoom-in" aria-label="Agrandir">+</button>
            <button type="button" class="portfolio-lightbox-close" data-action="close" aria-label="Fermer">×</button>
          </div>
        </div>
        <div class="portfolio-lightbox-stage" data-stage tabindex="0" aria-label="Visionneuse de projet">
          <button type="button" class="portfolio-lightbox-nav prev" data-action="prev" aria-label="Projet précédent">‹</button>
          <div class="portfolio-lightbox-media" data-media></div>
          <button type="button" class="portfolio-lightbox-nav next" data-action="next" aria-label="Projet suivant">›</button>
        </div>
        <div class="portfolio-lightbox-bottombar">
          <span data-counter></span>
          <span>Glissez pour naviguer · pincez ou utilisez + / − pour zoomer</span>
        </div>
      </div>`;
    document.body.appendChild(dialog);

    dialog.addEventListener('click', event => {
      if (event.target === dialog) closeLightbox();
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      if (action === 'close') closeLightbox();
      if (action === 'prev') navigate(-1);
      if (action === 'next') navigate(1);
      if (action === 'zoom-in') setZoom(zoom + .25);
      if (action === 'zoom-out') setZoom(zoom - .25);
      if (action === 'zoom-reset') setZoom(1);
    });

    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeLightbox();
    });

    const stage = dialog.querySelector('[data-stage]');
    stage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      isPointerDown = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      stage.setPointerCapture?.(event.pointerId);
    });
    stage.addEventListener('pointermove', event => {
      if (!isPointerDown) return;
      if (Math.abs(event.clientX - startX) > 10 || Math.abs(event.clientY - startY) > 10) moved = true;
    });
    stage.addEventListener('pointerup', event => {
      if (!isPointerDown) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      isPointerDown = false;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
        navigate(dx < 0 ? 1 : -1);
      }
      window.setTimeout(() => { moved = false; }, 0);
    });

    stage.addEventListener('wheel', event => {
      if (!dialog.open) return;
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? .15 : -.15));
    }, { passive: false });

    document.addEventListener('keydown', event => {
      if (!dialog.open) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') navigate(-1);
      if (event.key === 'ArrowRight') navigate(1);
      if (event.key === '+' || event.key === '=') setZoom(zoom + .25);
      if (event.key === '-') setZoom(zoom - .25);
      if (event.key === '0') setZoom(1);
    });
  }

  function openLightbox(items, index, categoryLabel) {
    ensureLightbox();
    lightboxItems = items;
    lightboxIndex = Math.max(0, Math.min(index, items.length - 1));
    zoom = 1;
    const dialog = document.querySelector('#portfolio-lightbox');
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('portfolio-lightbox-open');
    dialog.querySelector('[data-stage]').focus({ preventScroll: true });
    updateLightbox(categoryLabel);
    window.lnkApplyLanguage?.(document.documentElement.lang || 'fr');
  }

  function updateLightbox(categoryLabel) {
    const dialog = document.querySelector('#portfolio-lightbox');
    if (!dialog) return;
    const item = lightboxItems[lightboxIndex];
    const category = item.category?.label || categoryLabel || categoryMap[item.category]?.label || '';
    const title = item.title || 'Échantillon';
    dialog.querySelector('#portfolio-lightbox-category').textContent = category;
    dialog.querySelector('#portfolio-lightbox-title').textContent = title;
    dialog.querySelector('[data-counter]').textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;

    const media = dialog.querySelector('[data-media]');
    media.innerHTML = '';
    if (item.type === 'sample') {
      const categoryObj = item.category;
      const art = document.createElement('div');
      art.className = `portfolio-placeholder-art lightbox-sample ${categoryObj.variant === 'dark' ? 'alt' : ''} ${categoryObj.variant === 'coral' ? 'warm' : ''} ${categoryObj.variant === 'light' ? 'light' : ''}`;
      const index = document.createElement('span');
      index.textContent = `${String(data.categories.indexOf(categoryObj) + 1).padStart(2, '0')} / SAMPLE`;
      const titleEl = document.createElement('i');
      titleEl.textContent = categoryObj.id === 'plus' ? 'ET PLUS' : categoryObj.label.toUpperCase();
      art.append(index, titleEl);
      media.appendChild(art);
    } else {
      const image = document.createElement('img');
      image.className = 'portfolio-lightbox-image';
      image.src = item.image;
      image.alt = item.alt || title;
      media.appendChild(image);
    }
    dialog.querySelector('[data-action="prev"]').hidden = lightboxItems.length < 2;
    dialog.querySelector('[data-action="next"]').hidden = lightboxItems.length < 2;
    setZoom(1);
  }

  function navigate(direction) {
    if (lightboxItems.length < 2) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    zoom = 1;
    updateLightbox();
  }

  function setZoom(value) {
    zoom = Math.max(1, Math.min(3, Number(value) || 1));
    const media = document.querySelector('#portfolio-lightbox [data-media]');
    if (!media) return;
    const image = media.querySelector('.portfolio-lightbox-image');
    const sample = media.querySelector('.lightbox-sample');
    if (image) image.style.transform = `scale(${zoom})`;
    if (sample) sample.style.transform = `scale(${zoom})`;
    const reset = document.querySelector('#portfolio-lightbox [data-action="zoom-reset"]');
    if (reset) reset.textContent = `${Math.round(zoom * 100)}%`;
  }

  function closeLightbox() {
    const dialog = document.querySelector('#portfolio-lightbox');
    if (!dialog) return;
    if (dialog.open) dialog.close();
    document.body.classList.remove('portfolio-lightbox-open');
    lightboxItems = [];
    lightboxIndex = 0;
    zoom = 1;
  }

  filters.forEach(filter => {
    filter.addEventListener('click', () => render(filter.dataset.filter));
  });

  render('all');

  // The catalog is generated from assets/images/portfolio during publication.
  fetch('data/portfolio.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`Portfolio catalog unavailable (${response.status})`);
      return response.json();
    })
    .then(catalog => {
      if (!Array.isArray(catalog.projects)) return;
      data.projects = catalog.projects.filter(project => (
        project && categoryMap[project.category] && project.image
      ));
      render(currentCategory);
    })
    .catch(error => console.warn('[portfolio] Catalog loading failed:', error));
})();

/* ===== js/testimonials.js ===== */
const FORMSPREE_REVIEWS_ENDPOINT = 'https://formspree.io/f/xljrbrnk';

(function(){
  const grid = document.getElementById('testimonials-grid');
  const summary = document.getElementById('testimonials-summary');
  if(!grid || !summary) return;

  const state = { approved: [], stats: { count:0, average:0, breakdown:{1:0,2:0,3:0,4:0,5:0} } };
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const initials = value => escapeHtml(String(value || '?').trim().split(/\s+/).slice(0,2).map(p => p[0] || '').join('').toUpperCase());
  const ratingStars = rating => Array.from({length:5}, (_,i) => i < rating ? '★' : '☆').join('');
  const formatAverage = value => Number(value || 0).toFixed(1).replace('.', ',');

  function computeStats(){
    const breakdown={1:0,2:0,3:0,4:0,5:0};
    state.approved.forEach(item => breakdown[Math.max(1,Math.min(5,Number(item.rating)||0))]++);
    const count=state.approved.length;
    const sum=state.approved.reduce((s,item)=>s+Number(item.rating||0),0);
    state.stats={count,average:count?sum/count:0,breakdown};
  }

  function renderSummary(target=document){
    const avg=state.stats.count?formatAverage(state.stats.average):'—', count=state.stats.count||0;
    const averageEl=target.getElementById?.('testimonials-average'); if(averageEl) averageEl.textContent=avg;
    const countEl=target.getElementById?.('testimonials-count'); if(countEl) countEl.textContent=count;
    const starsEl=target.getElementById?.('testimonials-average-stars'); if(starsEl) starsEl.textContent=count?ratingStars(Math.round(state.stats.average)):'☆☆☆☆☆';
    const breakdown=target.getElementById?.('testimonials-breakdown');
    if(breakdown) breakdown.innerHTML=[5,4,3,2,1].map(r=>{const n=state.stats.breakdown[r]||0,pct=count?Math.round(n/count*100):0;return `<div class="rating-row"><span>${r} ★</span><span class="rating-track"><i style="width:${pct}%"></i></span><strong>${n}</strong></div>`;}).join('');
  }

  function card(item,index){
    const rating=Math.max(1,Math.min(5,Number(item.rating)||0));
    const photo=item.photo?`<img src="${escapeHtml(item.photo)}" alt="" loading="lazy">`:`<span aria-hidden="true">${initials(item.name)}</span>`;
    const isEnglish=document.documentElement.lang==='en';
    return `<article class="testimonial-card"><span class="testimonial-number">${String(index+1).padStart(2,'0')}</span><div class="testimonial-stars" aria-label="${isEnglish?'Rating: '+rating+' out of 5':'Note : '+rating+' sur 5'}">${ratingStars(rating)}</div><blockquote class="testimonial-quote">${escapeHtml(item.review)}</blockquote><div class="testimonial-meta"><div class="testimonial-avatar">${photo}</div><div><p class="testimonial-name">${escapeHtml(item.name)}</p>${item.organization?`<p class="testimonial-org">${escapeHtml(item.organization)}</p>`:''}${item.project?`<span class="testimonial-project">${escapeHtml(item.project)}</span>`:''}</div></div></article>`;
  }

  function renderAll(){
    const isEnglish=document.documentElement.lang==='en';
    grid.innerHTML=state.approved.length?state.approved.slice(0,3).map(card).join(''):`<p class="testimonials-empty">${isEnglish?'The first testimonials will appear here after approval.':'Les premiers témoignages apparaîtront ici après validation.'}</p>`;
    const viewAll=document.getElementById('testimonials-view-all');
    if(viewAll){viewAll.disabled=!state.approved.length;viewAll.textContent=`${isEnglish?'View all reviews':'Voir tous les avis'}${state.stats.count?` (${state.stats.count})`:''}`;}
    renderSummary(document);
    window.lnkApplyLanguage?.(document.documentElement.lang || 'fr');
  }

  function renderModal(){
    const all=document.getElementById('testimonials-all-grid'), modalSummary=document.getElementById('testimonials-modal-summary');
    if(!all) return;
    const isEnglish=document.documentElement.lang==='en';
    all.innerHTML=state.approved.length?state.approved.map(card).join(''):`<p class="testimonials-empty">${isEnglish?'No reviews have been published yet.':'Aucun avis publié pour le moment.'}</p>`;
    if(modalSummary) modalSummary.innerHTML=`<strong>${state.stats.count?formatAverage(state.stats.average):'—'} / 5</strong><span>${ratingStars(state.stats.count?Math.round(state.stats.average):0)}</span><em>${state.stats.count} ${document.documentElement.lang==='en'?'reviews':'avis'}</em>`;
    window.lnkApplyLanguage?.(document.documentElement.lang || 'fr');
  }

  function setupModal(){
    const modal=document.getElementById('testimonials-modal'),open=document.getElementById('testimonials-view-all'),close=document.getElementById('testimonials-modal-close');
    if(!modal||!open||!close)return;
    open.addEventListener('click',()=>{renderModal();modal.showModal();});
    close.addEventListener('click',()=>modal.close());
    modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
  }

  function setupRating(){
    const input=document.getElementById('testimonial-rating');
    document.querySelectorAll('.star-choice').forEach(btn=>btn.addEventListener('click',()=>{
      const rating=Number(btn.dataset.rating); if(input) input.value=rating;
      document.querySelectorAll('.star-choice').forEach(star=>{const active=Number(star.dataset.rating)<=rating;star.classList.toggle('is-selected',active);star.setAttribute('aria-checked',String(Number(star.dataset.rating)===rating));});
    }));
  }

  function resetTurnstile(){
    if(window.turnstile && typeof window.turnstile.reset==='function') window.turnstile.reset();
  }

  async function submitReview(payload){
    const response=await fetch('/api/testimonials',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(response.status===404){
      const fallback=await fetch(FORMSPREE_REVIEWS_ENDPOINT,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({...payload,form_type:'testimonial'})});
      const fallbackResult=await fallback.json().catch(()=>({}));
      if(!fallback.ok) throw new Error(fallbackResult.error||fallbackResult.message||'Impossible d’envoyer votre avis.');
      return fallbackResult;
    }
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error||result.message||'Impossible d’envoyer votre avis.');
    return result;
  }

  function setupForm(){
    const form=document.getElementById('testimonial-form'),status=document.getElementById('testimonial-form-status');
    if(!form||!status)return;
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      if(!data.rating){status.textContent='Choisissez une note de 1 à 5 étoiles.';status.className='testimonial-form-status is-error';return;}
      if(!String(data.name||'').trim()||!String(data.review||'').trim()){status.textContent='Merci de renseigner votre nom et votre témoignage.';status.className='testimonial-form-status is-error';return;}
      data.turnstileToken = data['cf-turnstile-response'] || '';
      if(!data.turnstileToken){
        status.textContent='Veuillez confirmer la vérification anti-spam avant l’envoi.';
        status.className='testimonial-form-status is-error';
        resetTurnstile();
        return;
      }
      const button=form.querySelector('button[type="submit"]'); if(button)button.disabled=true;
      status.textContent='Envoi en cours…';status.className='testimonial-form-status';
      try{
        await submitReview(data);
        form.reset();
        resetTurnstile();
        document.querySelectorAll('.star-choice').forEach(star=>{star.classList.remove('is-selected');star.setAttribute('aria-checked','false');});
        status.textContent='Merci ! Votre avis a bien été reçu et sera publié après validation.';
        status.className='testimonial-form-status is-success';
      }catch(err){
        resetTurnstile();
        status.textContent=err.message||'Une erreur est survenue. Réessayez plus tard.';
        status.className='testimonial-form-status is-error';
      }finally{if(button)button.disabled=false;}
    });
  }

  async function load(){
    try{
      const response=await fetch('/api/testimonials',{headers:{'Accept':'application/json'}});
      if(!response.ok)throw new Error('Impossible de charger les avis.');
      const data=await response.json();
      state.approved=Array.isArray(data.testimonials)?data.testimonials.filter(item=>item.status==='approved'&&item.review):[];
    }catch(_){state.approved=[];}
    computeStats(); renderAll();
  }

  setupModal(); setupRating(); setupForm();
  new MutationObserver(()=>renderAll()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  load();
})();

/* ===== js/contact.js ===== */
(() => {
  const form = document.querySelector('#project-brief-form');
  if (!form) return;

  const status = document.querySelector('#brief-status');
  const submit = form.querySelector('button[type="submit"]');


  const attachmentInput = document.getElementById('brief-attachment');
  const fileName = document.getElementById('brief-file-name');

  attachmentInput?.addEventListener('change', () => {
    const file = attachmentInput.files?.[0];
    if (!file) {
      if (fileName) fileName.textContent = 'Aucun fichier sélectionné.';
      return;
    }
    if (fileName) fileName.textContent = `Fichier sélectionné : ${file.name} — ${(file.size / 1024 / 1024).toFixed(2)} Mo`;
    const fileButton = form.querySelector('.file-select-button > span:last-child');
    if (fileButton) fileButton.textContent = 'Modifier la pièce jointe';
  });

  const requiredFields = [
    { id: 'brief-name', label: 'Nom / entreprise' },
    { id: 'brief-phone', label: 'Téléphone / WhatsApp' },
    { id: 'brief-email', label: 'Email' },
    { id: 'brief-client-type', label: 'Type de client' },
    { id: 'brief-project-type', label: 'Type de projet' },
    { id: 'brief-description', label: 'Description du projet' }
  ];

  function setError(field, message) {
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    field.setAttribute('aria-invalid', 'true');
    if (error) error.textContent = message;
  }

  function clearError(field) {
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    field.removeAttribute('aria-invalid');
    if (error) error.textContent = '';
  }

  function validate() {
    let valid = true;
    let firstInvalid = null;

    requiredFields.forEach(({id, label}) => {
      const field = document.getElementById(id);
      if (!field) return;
      clearError(field);
      if (!field.value.trim()) {
        setError(field, `${label} est requis.`);
        valid = false;
        firstInvalid ||= field;
      }
    });

    const email = document.getElementById('brief-email');
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError(email, 'Veuillez saisir une adresse email valide.');
      valid = false;
      firstInvalid ||= email;
    }

    if (!valid) firstInvalid?.focus();
    return valid;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    status.className = 'brief-status';

    if (!validate()) {
      status.textContent = 'Veuillez vérifier les champs indiqués.';
      status.classList.add('error');
      return;
    }

    submit.disabled = true;
    submit.querySelector('span').textContent = 'Envoi…';

    try {
      const attachment = document.getElementById('brief-attachment');
      if (attachment?.files?.[0] && attachment.files[0].size > 10 * 1024 * 1024) {
        throw new Error('attachment-too-large');
      }

      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Form submission failed');

      form.reset();
      if (fileName) fileName.textContent = 'Aucun fichier sélectionné.';
      const fileButton = form.querySelector('.file-select-button > span:last-child');
      if (fileButton) fileButton.textContent = 'Ajouter une pièce jointe';
      form.querySelectorAll('[aria-invalid="true"]').forEach(field => clearError(field));
      status.textContent = 'Merci. Votre brief a bien été envoyé.';
      status.classList.add('success');
    } catch (error) {
      status.textContent = error.message === 'attachment-too-large'
        ? 'La pièce jointe dépasse 10 Mo. Merci de choisir un fichier plus léger ou de nous l’envoyer sur WhatsApp.'
        : 'L’envoi n’a pas pu être confirmé. Vous pouvez aussi nous écrire directement sur WhatsApp.';
      status.classList.add('error');
    } finally {
      submit.disabled = false;
      submit.querySelector('span').textContent = 'Envoyer le brief';
    }
  });
})();

/* ===== js/footer.js ===== */
(() => {
  const year = document.querySelector('#footer-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
