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

/* ===== js/portfolio-catalog.js ===== */
/* Generated from assets/images/portfolio — do not edit manually. */
window.LNK_PORTFOLIO_CATALOG = {"categories":[{"id":"affiches","label":"Affiches","visual":"sample","variant":"teal","folder":"affiches","sampleImage":"assets/images/portfolio/affiches/affiche-20-matins-de-priere-mission-evangelique-la-restauration-02.webp","sampleAlt":"Affiche bleue et turquoise pour les 20 matins de prière de la Mission Évangélique La Restauration","projectCount":2},{"id":"branding","label":"Branding","visual":"sample","variant":"dark","folder":"branding","sampleImage":null,"sampleAlt":null,"projectCount":0},{"id":"bannieres","label":"Bannières","visual":"sample","variant":"coral","folder":"bannieres","sampleImage":null,"sampleAlt":null,"projectCount":0},{"id":"social-media","label":"Social Media","visual":"sample","variant":"light","folder":"social-media","sampleImage":null,"sampleAlt":null,"projectCount":0},{"id":"calendriers","label":"Calendriers","visual":"sample","variant":"dark","folder":"calendriers","sampleImage":null,"sampleAlt":null,"projectCount":0},{"id":"plus","label":"Et plus encore","visual":"sample","variant":"coral","folder":"et-plus-encore","sampleImage":null,"sampleAlt":null,"projectCount":0}],"projects":[{"category":"affiches","title":"20 matins de prière — Mission Évangélique La Restauration","image":"assets/images/portfolio/affiches/affiche-20-matins-de-priere-mission-evangelique-la-restauration-02.webp","alt":"Affiche bleue et turquoise pour les 20 matins de prière de la Mission Évangélique La Restauration"},{"category":"affiches","title":"La Grande Retraite — Août 2026","image":"assets/images/portfolio/affiches/affiche-la-grande-retraite-aout-2026-mission-evangelique-la-restauration-01.webp","alt":"Affiche sombre et dorée pour La Grande Retraite d’août 2026 de la Mission Évangélique La Restauration"}],"_instructions":"Les projets sont générés automatiquement depuis assets/images/portfolio. Pour un titre ou un texte alternatif personnalisé, conserver les métadonnées dans ce fichier ou utiliser le format recommandé dans le README du dossier."};

/* ===== js/portfolio.js ===== */
(() => {
  const filters = [...document.querySelectorAll('.filter')];
  const grid = document.querySelector('#portfolio-grid');
  if (!filters.length || !grid) return;

  const generatedProjects = Array.isArray(window.LNK_PORTFOLIO_CATALOG?.projects)
    ? window.LNK_PORTFOLIO_CATALOG.projects
    : [];
  const generatedCategories = Array.isArray(window.LNK_PORTFOLIO_CATALOG?.categories)
    ? window.LNK_PORTFOLIO_CATALOG.categories
    : [];

  const data = {
    categories: generatedCategories.length ? generatedCategories : [
      { id: 'affiches', label: 'Affiches', variant: 'teal', sampleImage: null, sampleAlt: null, projectCount: 0 },
      { id: 'branding', label: 'Branding', variant: 'dark', sampleImage: null, sampleAlt: null, projectCount: 0 },
      { id: 'bannieres', label: 'Bannières', variant: 'coral', sampleImage: null, sampleAlt: null, projectCount: 0 },
      { id: 'social-media', label: 'Social Media', variant: 'light', sampleImage: null, sampleAlt: null, projectCount: 0 },
      { id: 'calendriers', label: 'Calendriers', variant: 'dark', sampleImage: null, sampleAlt: null, projectCount: 0 },
      { id: 'plus', label: 'Et plus encore', variant: 'coral', sampleImage: null, sampleAlt: null, projectCount: 0 }
    ],
    projects: generatedProjects
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
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let lastTap = 0;
  let lastTapTarget = null;
  let pinchVelX = 0;
  let pinchVelY = 0;
  let lastPinchTime = 0;
  let isDraggingImage = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let imageOffsetX = 0;
  let imageOffsetY = 0;

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
    button.setAttribute('aria-label', `Voir les réalisations ${category.label}`);

    const visual = document.createElement('div');
    visual.className = 'portfolio-visual';

    // Badge "échantillon" avec l'image du premier projet si disponible
    if (category.sampleImage) {
      const image = document.createElement('img');
      image.className = 'portfolio-image';
      image.src = category.sampleImage;
      image.alt = category.sampleAlt || `${category.label} — aperçu`;
      image.loading = 'lazy';
      visual.appendChild(image);

      const badge = document.createElement('div');
      badge.className = 'portfolio-sample-badge';
      badge.innerHTML = `<span class="sample-num">${String(data.categories.indexOf(category) + 1).padStart(2, '0')}</span><span class="sample-label">Échantillon</span>`;
      visual.appendChild(badge);
    } else {
      const art = document.createElement('div');
      art.className = `portfolio-placeholder-art ${category.variant === 'dark' ? 'alt' : ''} ${category.variant === 'coral' ? 'warm' : ''} ${category.variant === 'light' ? 'light' : ''}`;
      const index = document.createElement('span');
      index.textContent = `${String(data.categories.indexOf(category) + 1).padStart(2, '0')} / SAMPLE`;
      const title = document.createElement('i');
      title.textContent = category.id === 'plus' ? 'ET PLUS' : category.label.toUpperCase();
      art.append(index, title);
      visual.appendChild(art);
    }

    const meta = document.createElement('div');
    meta.className = 'portfolio-card-meta';
    meta.innerHTML = `<span>${category.label}</span><strong>${category.projectCount ? category.projectCount + ' projets' : 'Échantillon'}</strong>`;

    button.append(visual, meta);
    article.appendChild(button);

    // Clic sur catégorie → déploie les travaux de cette catégorie
    button.addEventListener('click', () => {
      if (moved) return;
      render(category.id);
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

    // Clic sur un travail → lightbox
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

    // Afficher les travaux de la catégorie (jusqu'à 6)
    const projects = getCategoryProjects(categoryId);
    if (projects.length) {
      projects.forEach((project, index) => {
        grid.appendChild(projectCard(project, index + 1));
      });
    } else {
      // Pas de projets → afficher le sample placeholder
      grid.appendChild(sampleCard(category));
    }
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
          <span>Pincez ou double-tapez pour zoomer</span>
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
    const media = dialog.querySelector('[data-media]');

    function getTouchDistance(event) {
      const touches = event.touches;
      if (!touches || touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    function getTouchCenter(event) {
      const touches = event.touches;
      if (!touches || touches.length < 2) return { x: 0, y: 0 };
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
    }

    // --- Touch events (mobile) ---
    stage.addEventListener('touchstart', event => {
      if (event.touches.length === 1) {
        isPointerDown = true;
        moved = false;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        if (zoom > 1) {
          isDraggingImage = true;
          dragStartX = event.touches[0].clientX - imageOffsetX;
          dragStartY = event.touches[0].clientY - imageOffsetY;
        }
      }
      if (event.touches.length === 2) {
        pinchStartDistance = getTouchDistance(event);
        pinchStartZoom = zoom;
        isDraggingImage = false;
      }
    }, { passive: true });

    stage.addEventListener('touchmove', event => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const distance = getTouchDistance(event);
        if (pinchStartDistance > 0 && distance > 0) {
          const scale = distance / pinchStartDistance;
          setZoom(pinchStartZoom * scale, true);
          lastPinchTime = Date.now();
        }
      } else if (event.touches.length === 1 && zoom > 1 && isDraggingImage) {
        event.preventDefault();
        imageOffsetX = event.touches[0].clientX - dragStartX;
        imageOffsetY = event.touches[0].clientY - dragStartY;
        applyImageTransform();
      } else if (event.touches.length === 1) {
        if (Math.abs(event.touches[0].clientX - startX) > 10 || Math.abs(event.touches[0].clientY - startY) > 10) moved = true;
      }
    }, { passive: false });

    stage.addEventListener('touchend', event => {
      isDraggingImage = false;
      imageOffsetX = 0;
      imageOffsetY = 0;
      isPointerDown = false;
      if (event.changedTouches.length !== 1) return;
      const now = Date.now();
      const target = event.target;
      const isSameTarget = target === lastTapTarget;
      if (now - lastTap < 320 && isSameTarget && !moved) {
        setZoom(zoom >= 2 ? 1 : 2);
        lastTap = 0;
      } else {
        lastTap = now;
        lastTapTarget = target;
      }
    }, { passive: true });

    // --- Pointer events (desktop mouse) ---
    stage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      isPointerDown = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      if (zoom > 1) {
        isDraggingImage = true;
        dragStartX = event.clientX - imageOffsetX;
        dragStartY = event.clientY - imageOffsetY;
      }
      stage.setPointerCapture?.(event.pointerId);
    });

    stage.addEventListener('pointermove', event => {
      if (!isPointerDown) return;
      if (zoom > 1 && isDraggingImage) {
        imageOffsetX = event.clientX - dragStartX;
        imageOffsetY = event.clientY - dragStartY;
        applyImageTransform();
        return;
      }
      if (Math.abs(event.clientX - startX) > 10 || Math.abs(event.clientY - startY) > 10) moved = true;
    });

    stage.addEventListener('pointerup', event => {
      if (!isPointerDown) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      isPointerDown = false;
      isDraggingImage = false;
      imageOffsetX = 0;
      imageOffsetY = 0;
      if (zoom <= 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
        navigate(dx < 0 ? 1 : -1);
      }
      applyImageTransform();
      window.setTimeout(() => { moved = false; }, 0);
    });

    // --- Wheel zoom (desktop) ---
    stage.addEventListener('wheel', event => {
      if (!dialog.open) return;
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? .15 : -.15));
    }, { passive: false });

    // --- Double click (desktop) ---
    stage.addEventListener('dblclick', event => {
      event.preventDefault();
      setZoom(zoom >= 2 ? 1 : 2);
    });

    // --- Keyboard ---
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

  function applyImageTransform() {
    const media = document.querySelector('#portfolio-lightbox [data-media]');
    if (!media) return;
    const image = media.querySelector('.portfolio-lightbox-image');
    if (image) {
      image.style.transform = `scale(${zoom}) translate3d(${imageOffsetX}px, ${imageOffsetY}px, 0)`;
    }
  }

  function openLightbox(items, index, categoryLabel) {
    ensureLightbox();
    lightboxItems = items;
    lightboxIndex = Math.max(0, Math.min(index, items.length - 1));
    zoom = 1;
    imageOffsetX = 0;
    imageOffsetY = 0;
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
    const image = document.createElement('img');
    image.className = 'portfolio-lightbox-image';
    image.src = item.image;
    image.alt = item.alt || title;
    media.appendChild(image);

    dialog.querySelector('[data-action="prev"]').hidden = lightboxItems.length < 2;
    dialog.querySelector('[data-action="next"]').hidden = lightboxItems.length < 2;
    setZoom(1);
  }

  function navigate(direction) {
    if (lightboxItems.length < 2) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    zoom = 1;
    imageOffsetX = 0;
    imageOffsetY = 0;
    updateLightbox();
  }

  function setZoom(value, smooth = false) {
    zoom = Math.max(1, Math.min(3, Number(value) || 1));
    const media = document.querySelector('#portfolio-lightbox [data-media]');
    if (!media) return;
    const image = media.querySelector('.portfolio-lightbox-image');
    if (image) image.style.transform = `scale(${zoom})`;
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
    imageOffsetX = 0;
    imageOffsetY = 0;
  }

  filters.forEach(filter => {
    filter.addEventListener('click', () => render(filter.dataset.filter));
  });

  render('all');

  // The catalog is generated into the bundle; fetch only supports older previews.
  if (!generatedProjects.length) fetch('data/portfolio.json', { cache: 'force-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`Portfolio catalog unavailable (${response.status})`);
      return response.json();
    })
    .then(catalog => {
      if (!Array.isArray(catalog.projects)) return;
      data.projects = catalog.projects.filter(project => (
        project && categoryMap[project.category] && project.image
      ));
      // Mettre à jour les catégories avec sampleImage
      if (Array.isArray(catalog.categories)) {
        catalog.categories.forEach(cat => {
          if (categoryMap[cat.id]) {
            categoryMap[cat.id].sampleImage = cat.sampleImage || null;
            categoryMap[cat.id].sampleAlt = cat.sampleAlt || null;
            categoryMap[cat.id].projectCount = cat.projectCount || 0;
          }
        });
      }
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
  }

  function renderModal(){
    const all=document.getElementById('testimonials-all-grid'), modalSummary=document.getElementById('testimonials-modal-summary');
    if(!all) return;
    const isEnglish=document.documentElement.lang==='en';
    all.innerHTML=state.approved.length?state.approved.map(card).join(''):`<p class="testimonials-empty">${isEnglish?'No reviews have been published yet.':'Aucun avis publié pour le moment.'}</p>`;
    if(modalSummary) modalSummary.innerHTML=`<strong>${state.stats.count?formatAverage(state.stats.average):'—'} / 5</strong><span>${ratingStars(state.stats.count?Math.round(state.stats.average):0)}</span><em>${state.stats.count} ${document.documentElement.lang==='en'?'reviews':'avis'}</em>`;
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
      state.approved=Array.isArray(data.testimonials)?data.testimonials.filter(item=>item.review):[];
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

      // Récupérer le token Turnstile
      const turnstileToken = window.turnstile?.getResponse();
      if (!turnstileToken) {
        status.textContent = 'Veuillez confirmer la vérification anti-spam.';
        status.classList.add('error');
        submit.disabled = false;
        submit.querySelector('span').textContent = 'Envoyer le brief';
        return;
      }

      const payload = {
        'cf-turnstile-response': turnstileToken,
        name: document.getElementById('brief-name').value.trim(),
        email: document.getElementById('brief-email').value.trim(),
        subject: `${document.getElementById('brief-project-type').value.trim()} — ${document.getElementById('brief-client-type').value.trim()}`,
        message: [
          `Description : ${document.getElementById('brief-description').value.trim()}`,
          `Téléphone : ${document.getElementById('brief-phone').value.trim()}`
        ].join('\n\n')
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Form submission failed');
      }

      // Reset Turnstile widget
      if (window.turnstile) window.turnstile.reset();

      form.reset();
      if (fileName) fileName.textContent = 'Aucun fichier sélectionné.';
      const fileButton = form.querySelector('.file-select-button > span:last-child');
      if (fileButton) fileButton.textContent = 'Ajouter une pièce jointe';
      form.querySelectorAll('[aria-invalid="true"]').forEach(field => clearError(field));
      status.textContent = 'Merci. Votre brief a bien été envoyé.';
      status.classList.add('success');
    } catch (error) {
      if (window.turnstile) window.turnstile.reset();
      status.textContent = error.message === 'attachment-too-large'
        ? 'La pièce jointe dépasse 10 Mo. Merci de choisir un fichier plus léger ou de nous l’envoyer sur WhatsApp.'
        : error.message === 'Spam protection failed.'
          ? 'Protection anti-spam échouée. Veuillez réessayer.'
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

/* ===== js/admin-gate.js ===== */
(() => {
  // Portail d'administration discret : 5 taps rapides sur le logo du footer
  // ouvrent la page de modération des avis avec connexion automatique.
  // Invisible pour les visiteurs : aucun indicateur visuel, aucun message.
  const TAPS_REQUIRED = 5;
  const TAP_WINDOW_MS = 1800;
  const token = null; // la clé est transmise uniquement quand le propriétaire la saisit dans l'URL du site (?gate=<clé>)

  const taps = [];

  function onGateTap() {
    const now = Date.now();
    taps.push(now);
    while (taps.length && taps[0] < now - TAP_WINDOW_MS) taps.shift();
    if (taps.length >= TAPS_REQUIRED) {
      taps.length = 0;
      const params = new URLSearchParams(location.search);
      const gate = params.get('gate') || '';
      const target = '/admin-reviews.html' + (gate ? '#t=' + encodeURIComponent(gate) : '');
      location.href = target;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const logo = document.getElementById('site-footer');
    if (!logo) return;
    // Le geste est attaché au bloc logo du footer (zone discrète)
    const brand = logo.querySelector('.footer-logo');
    const target = brand || logo;
    const fire = e => {
      // Ne pas intercepter un vrai clic/tap normal de navigation (un seul événement)
      e.preventDefault();
      e.stopPropagation();
      onGateTap();
    };
    target.addEventListener('click', fire, true);
    target.addEventListener('touchend', e => {
      if (e.touches.length === 0) fire(e);
    }, { passive: false, capture: true });
  });
})();
