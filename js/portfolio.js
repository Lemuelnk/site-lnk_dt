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
    button.setAttribute('aria-label', `Voir les réalisations de la catégorie ${category.label}`);

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
    button.setAttribute('aria-label', `Ouvrir en grand : ${project.title || `réalisation ${position}`} — cliquez ou tapez pour lancer la visionneuse`);

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
            <p class="portfolio-lightbox-desc" id="portfolio-lightbox-desc" hidden></p>
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
    const lang = document.documentElement.lang || 'fr';
    const description = lang.startsWith('en') ? (item.description_en || item.description_fr || '') : (item.description_fr || item.description_en || '');
    const descriptionElement = dialog.querySelector('#portfolio-lightbox-desc');
    descriptionElement.textContent = description;
    descriptionElement.hidden = !description.trim();
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
