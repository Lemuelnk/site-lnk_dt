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
