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
window.LNK_PORTFOLIO_CATALOG = {"categories":[{"id":"affiches","label":"Affiches","visual":"sample","variant":"teal","folder":"affiches","sampleImage":"assets/images/portfolio/affiches/affiche-20-matins-de-priere-mission-evangelique-la-restauration-02.webp","sampleAlt":"Affiche bleue et turquoise pour les 20 matins de prière de la Mission Évangélique La Restauration","projectCount":8},{"id":"branding","label":"Branding","visual":"sample","variant":"dark","folder":"branding","sampleImage":"assets/images/portfolio/branding/branding-logo-mtj-mahombi-ne-tombera-jamais-01.webp","sampleAlt":"Logo circulaire M.T.J avec silhouette jaune en prière, fond noir et cercle blanc avec le slogan Mahombi Ne Tombera Jamais","projectCount":5},{"id":"bannieres","label":"Bannières","visual":"sample","variant":"coral","folder":"bannieres","sampleImage":"assets/images/portfolio/bannieres/banniere-eglise-evangelique-source-d-eaux-vives-01.webp","sampleAlt":"Bannière de l'Église Évangélique Source d'Eaux-Vives avec cascade, logo et références bibliques","projectCount":1},{"id":"social-media","label":"Social Media","visual":"sample","variant":"light","folder":"social-media","sampleImage":"assets/images/portfolio/social-media/carwash-yesu-ni-jibu-post-carre-01.webp","sampleAlt":"Post carré CarWash Yesu ni Jibu, pneu et voiture sous l'eau, services de nettoyage détaillés","projectCount":1},{"id":"calendriers","label":"Calendriers","visual":"sample","variant":"dark","folder":"calendriers","sampleImage":null,"sampleAlt":null,"projectCount":0},{"id":"plus","label":"Et plus encore","visual":"sample","variant":"coral","folder":"et-plus-encore","sampleImage":null,"sampleAlt":null,"projectCount":0}],"projects":[{"category":"affiches","title":"20 matins de prière — Mission Évangélique La Restauration","image":"assets/images/portfolio/affiches/affiche-20-matins-de-priere-mission-evangelique-la-restauration-02.webp","alt":"Affiche bleue et turquoise pour les 20 matins de prière de la Mission Évangélique La Restauration"},{"category":"affiches","title":"Action Évangélique — 5 Jours (Édition 3)","image":"assets/images/portfolio/affiches/affiche-action-evangelique-5-jours-edition-3-04.webp","alt":"Affiche Action Évangélique 5 jours, Église Évangélique Source d'Eaux Vives, portraits des jeunes, thème la sanctification","description_fr":"Affiche pour l'Action Évangélique — 5 Jours, Édition 3, organisée par le Département de la Jeunesse de l'Église Évangélique Source d'Eaux Vives. Portraits des jeunes participants sur fond de mur de pierre.","description_en":"Poster for the Action Évangélique — 5 Days, Edition 3, organized by the Youth Department of the Église Évangélique Source d'Eaux Vives. Portraits of young participants against a stone wall background."},{"category":"affiches","title":"CarWash — Yesu ni Jibu (bannière)","image":"assets/images/portfolio/affiches/affiche-carwash-yesu-ni-jibu-banniere-01.webp","alt":"Affiche publicitaire CarWash Yesu ni Jibu, voiture rouge avec éclaboussures d'eau, services de nettoyage","description_fr":"Bannière promotionnelle pour le CarWash Yesu ni Jibu. Visuel dynamique avec une voiture rouge, éclaboussures d'eau et palette bleue intense, listant les services de nettoyage proposés.","description_en":"Promotional banner for CarWash Yesu ni Jibu. A dynamic visual featuring a red car, water splashes and an intense blue palette, listing the cleaning services offered."},{"category":"affiches","title":"Concert Live — D.G. Emanuel Malaika","image":"assets/images/portfolio/affiches/affiche-eglise-peniel-concert-dg-emmanuel-malaika-06.webp","alt":"Affiche concert live D.G. Emanuel Malaika à l'Église Peniel, 14 décembre 2024","description_fr":"Affiche pour le concert live de D.G. Emanuel Malaika à l'Église Peniel, le 14 décembre 2024. Portrait central sur fond doré rayonnant avec bandeau rouge « En concert live ».","description_en":"Poster for the live concert of D.G. Emanuel Malaika at the Église Peniel, December 14, 2024. Central portrait on a radiant golden background with a red banner « En concert live »."},{"category":"affiches","title":"La Grande Retraite — Août 2026","image":"assets/images/portfolio/affiches/affiche-la-grande-retraite-aout-2026-mission-evangelique-la-restauration-01.webp","alt":"Affiche sombre et dorée pour La Grande Retraite d’août 2026 de la Mission Évangélique La Restauration"},{"category":"affiches","title":"Pentecôte 2025 — Centre Évangélique Bethel","image":"assets/images/portfolio/affiches/affiche-pentecote-2025-centre-evangelique-bethel-05.webp","alt":"Affiche Pentecôte 2025, Patriarche Balthazar et Sentinelle Mike, prière de renforcement des capacités","description_fr":"Affiche pour Pentecôte 2025 du Centre Évangélique et Apostolique Bethel. Visuel lumineux avec les portraits du Patriarche Balthazar et de Sentinelle Mike, thème « Une prière de renforcement des capacités ».","description_en":"Poster for Pentecost 2025 at the Centre Évangélique et Apostolique Bethel. A luminous visual featuring Patriarch Balthazar and Sentinel Mike, themed « A prayer for capacity building »."},{"category":"affiches","title":"Tefilla 2024 — 21 Matins et Nuits de Prière","image":"assets/images/portfolio/affiches/affiche-tefilla-2024-21-matins-et-nuits-de-priere-03.webp","alt":"Affiche Tefilla 2024 du Centre Évangélique et Apostolique Bethel, portraits des orateurs, 21 jours de prière","description_fr":"Affiche pour Tefilla 2024 — 21 Matins et Nuits de Prière du Centre Évangélique et Apostolique Bethel. Composition riche en portraits des orateurs avec une palette dorée et orange chaleureuse.","description_en":"Poster for Tefilla 2024 — 21 Mornings and Nights of Prayer at the Centre Évangélique et Apostolique Bethel. A composition rich in speaker portraits with a warm golden and orange palette."},{"category":"affiches","title":"The Rise — Affiche Cinéma","image":"assets/images/portfolio/affiches/affiche-the-rise-lnk-studio-production-03.webp","alt":"Affiche de film \"The Rise\" — production LNK Studio, portrait cinématographique sur fond rouge avec halftone","description_fr":"Affiche cinématographique pour la production LNK Studio. Composition dramatique mêlant portrait en halftone, typographie éditoriale et palette rouge intense, dans l'esprit des affiches de festival.","description_en":"Cinematic poster for the LNK Studio production. A dramatic composition combining a halftone portrait, editorial typography and an intense red palette, in the spirit of festival posters."},{"category":"branding","title":"Logo M.T.J — Mahombi Ne Tombera Jamais","image":"assets/images/portfolio/branding/branding-logo-mtj-mahombi-ne-tombera-jamais-01.webp","alt":"Logo circulaire M.T.J avec silhouette jaune en prière, fond noir et cercle blanc avec le slogan Mahombi Ne Tombera Jamais","description_fr":"Identité visuelle pour M.T.J — Mahombi Ne Tombera Jamais. Logo circulaire associant une silhouette en prière, un cercle blanc épuré et une typographie affirmée, traduisant force et engagement spirituel.","description_en":"Visual identity for M.T.J — Mahombi Ne Tombera Jamais. A circular logo combining a praying silhouette, a clean white circle and a bold typography, conveying strength and spiritual commitment."},{"category":"branding","title":"Logo Beston Business — Habillement et Divers","image":"assets/images/portfolio/branding/logo-beston-business-habillement-02.webp","alt":"Logo Beston Business avec cintre bleu, chaussures noires et monogramme BB","description_fr":"Logo pour Beston Business — Habillement et Divers. Emblème en forme de cintre bleu royal avec silhouette de chaussures, monogramme BB stylisé et base arrondie, évoquant l'élégance et le commerce textile.","description_en":"Logo for Beston Business — Clothing and Various. A royal blue hanger-shaped emblem with shoe silhouettes, a stylized BB monogram and a rounded base, evoking elegance and textile commerce."},{"category":"branding","title":"Logo E.E.P.D.P. — Église Évangélique Puissance de la Prière","image":"assets/images/portfolio/branding/logo-eepdp-eglise-evangelique-puissance-de-la-priere-03.webp","alt":"Logo noir E.E.P.D.P. avec globe, croix, colombe, flamme et mains en prière","description_fr":"Logo pour l'Église Évangélique Puissance de la Prière (E.E.P.D.P.). Design monochrome noir avec globe, croix, colombe du Saint-Esprit, flamme et mains jointes en prière, entouré de la référence Actes 12:5.","description_en":"Logo for the Église Évangélique Puissance de la Prière (E.E.P.D.P.). A black monochrome design with a globe, cross, Holy Spirit dove, flame and praying hands, surrounded by the reference Acts 12:5."},{"category":"branding","title":"Logo EJC/CEP — Paroisse Sinaï","image":"assets/images/portfolio/branding/logo-ejc-cep-paroisse-sinai-01.webp","alt":"Logo circulaire EJC/CEP Paroisse Sinaï avec montagne, croix, colombe et livre ouvert","description_fr":"Logo pour la Paroisse Sinaï (EJC/CEP). Design circulaire combinant montagne, croix, colombe en vol, rayon de soleil et livre ouvert, traduisant foi, espérance et révélation.","description_en":"Logo for the Sinaï Parish (EJC/CEP). A circular design combining a mountain, cross, flying dove, sun ray and open book, conveying faith, hope and revelation."},{"category":"branding","title":"Logo KOT Style","image":"assets/images/portfolio/branding/logo-kot-style-04.webp","alt":"Logo KOT Style monogramme circulaire blanc sur fond noir","description_fr":"Logo pour KOT Style. Monogramme circulaire en blanc sur fond noir, avec les lettres K, O et T stylisées en colonnes verticales géométriques, évoquant force et modernité.","description_en":"Logo for KOT Style. A circular white monogram on a black background, with the letters K, O and T stylized as geometric vertical columns, evoking strength and modernity."},{"category":"bannieres","title":"Église Évangélique Source d'Eaux-Vives","image":"assets/images/portfolio/bannieres/banniere-eglise-evangelique-source-d-eaux-vives-01.webp","alt":"Bannière de l'Église Évangélique Source d'Eaux-Vives avec cascade, logo et références bibliques","description_fr":"Bannière web pour l'Église Évangélique Source d'Eaux-Vives. Visuel évoquant la fraîcheur et la spiritualité avec une cascade, le logo de l'église et des références bibliques.","description_en":"Web banner for the Église Évangélique Source d'Eaux-Vives. A visual evoking freshness and spirituality with a waterfall, the church logo and biblical references."},{"category":"social-media","title":"CarWash — Yesu ni Jibu (post carré)","image":"assets/images/portfolio/social-media/carwash-yesu-ni-jibu-post-carre-01.webp","alt":"Post carré CarWash Yesu ni Jibu, pneu et voiture sous l'eau, services de nettoyage détaillés","description_fr":"Post carré CarWash Yesu ni Jibu pour les réseaux sociaux. Gros plan sur le pneu et l'éclaboussure, avec les services de nettoyage clairement listés.","description_en":"Square social media post for CarWash Yesu ni Jibu. Close-up on the tire and water splash, with cleaning services clearly listed."}],"_instructions":"Les projets sont générés automatiquement depuis assets/images/portfolio. Pour un titre ou un texte alternatif personnalisé, conserver les métadonnées dans ce fichier ou utiliser le format recommandé dans le README du dossier."};

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
    return data.projects.filter(project => project.category === categoryId);
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

    // Overlay hover
    const overlay = document.createElement('div');
    overlay.className = 'portfolio-overlay';
    overlay.innerHTML = `<span class="portfolio-overlay-title">${project.title || category.label}</span><span class="portfolio-overlay-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span>`;
    visual.appendChild(overlay);

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

    // Afficher tous les travaux de la catégorie
    const projects = getCategoryProjects(categoryId);
    if (projects.length) {
      projects.forEach((project, index) => {
        grid.appendChild(projectCard(project, index + 1));
      });
    } else {
      // Pas de projets → afficher le sample placeholder + CTA pour ne pas perdre le visiteur
      grid.appendChild(sampleCard(category));
      // CTA : bouton "Demander un devis" pour la catégorie vide
      const ctaWrap = document.createElement('div');
      ctaWrap.className = 'portfolio-empty-cta';
      const cta = document.createElement('a');
      cta.href = '#contact';
      cta.className = 'portfolio-empty-cta-btn';
      cta.dataset.langFr = `Bientôt disponible — Demander un devis ${category.label}`;
      cta.dataset.langEn = `Coming soon — Request a quote ${category.label}`;
      cta.textContent = cta.dataset.langFr;
      cta.addEventListener('click', () => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
      });
      ctaWrap.appendChild(cta);
      grid.appendChild(ctaWrap);
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

/* ===== js/testimonials.js ===== */
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

/* ===== js/news-catalog.js ===== */
// Auto-généré par tools/generate-news-catalog.py — NE PAS ÉDITER MANUELLEMENT
window.LNK_NEWS_CATALOG = {"generated": true, "publications": [{"file": "assets/images/news/news-creation-affiche-01.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Création graphique", "title_en": "Graphic creation", "description_fr": "Réalisation visuelle pour un projet de communication.", "description_en": "Visual creation for a communication project.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-affiche-03.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Affiche événementielle", "title_en": "Event poster", "description_fr": "Affiche pour un événement, claire et percutante.", "description_en": "Event poster, clear and impactful.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-affiche-04.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Affiche créative", "title_en": "Creative poster", "description_fr": "Composition visuelle originale pour une campagne.", "description_en": "Original visual composition for a campaign.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-affiche-06.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Création affiche", "title_en": "Poster creation", "description_fr": "Visuel percutant pour une communication efficace.", "description_en": "Impactful visual for effective communication.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-affiche-07.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Affiche sociale", "title_en": "Social poster", "description_fr": "Création pour les réseaux sociaux et événements.", "description_en": "Creation for social media and events.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-affiche-08.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Design graphique", "title_en": "Graphic design", "description_fr": "Mise en page professionnelle pour un projet visuel.", "description_en": "Professional layout for a visual project.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-affiche-09.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Composition visuelle", "title_en": "Visual composition", "description_fr": "Exploration créative avec les couleurs de la marque.", "description_en": "Creative exploration with brand colors.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-affiche-11.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Affiche promotionnelle", "title_en": "Promotional poster", "description_fr": "Support visuel pour une campagne de promotion.", "description_en": "Visual material for a promotional campaign.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-affiche-12.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Création récente", "title_en": "Recent creation", "description_fr": "Dernière réalisation du studio LNK Design Touch.", "description_en": "Latest creation from LNK Design Touch studio.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-flyer-02.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Design de flyer", "title_en": "Flyer design", "description_fr": "Conception d'un support de communication imprimé.", "description_en": "Design of a printed communication material.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-flyer-05.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Flyer professionnel", "title_en": "Professional flyer", "description_fr": "Support de communication soigné et lisible.", "description_en": "Polished and readable communication material.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-creation-flyer-10.webp", "kind": "news", "badge": {"fr": "Nouvelle création", "en": "New creation"}, "title_fr": "Flyer événement", "title_en": "Event flyer", "description_fr": "Communication visuelle pour un événement spécial.", "description_en": "Visual communication for a special event.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-presentation-lnk-design-touch-01.webp", "kind": "news", "badge": {"fr": "Promotion", "en": "Promotion"}, "title_fr": "Ensemble, donnons vie à vos projets.", "title_en": "Together, let's bring your projects to life.", "description_fr": "Design graphique, branding, motion design et bientôt l'impression : des solutions créatives pour booster votre image. Suivez-nous sur les réseaux pour ne rien manquer.", "description_en": "Graphic design, branding, motion design and soon printing: creative solutions to boost your image. Follow us on social media so you don't miss anything.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-promo-brand-13.webp", "kind": "news", "badge": {"fr": "Promotion", "en": "Promotion"}, "title_fr": "LNK Brand", "title_en": "LNK Brand", "description_fr": "Identité visuelle LNK Design Touch en mouvement.", "description_en": "LNK Design Touch visual identity in motion.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-promo-services-digital-14.webp", "kind": "news", "badge": {"fr": "Promotion", "en": "Promotion"}, "title_fr": "Services digitaux", "title_en": "Digital services", "description_fr": "Design graphique, développement web & mobile, marketing digital, stratégies & conseils : des solutions complètes pour booster votre image.", "description_en": "Graphic design, web & mobile development, digital marketing, strategies & consulting: complete solutions to boost your image.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-quote-bon-design-16.webp", "kind": "news", "badge": {"fr": "Citation", "en": "Quote"}, "title_fr": "Un bon design", "title_en": "Good design", "description_fr": "Un bon design, ce n'est pas juste beau. Il attire, il inspire confiance, il donne envie d'acheter.", "description_en": "Good design isn't just beautiful. It attracts, builds trust, and makes people want to buy.", "link": "https://www.instagram.com/lnkdt", "featured": null}, {"file": "assets/images/news/news-quote-discipline-15.webp", "kind": "news", "badge": {"fr": "Citation", "en": "Quote"}, "title_fr": "Discipline is the key", "title_en": "Discipline is the key", "description_fr": "La discipline est la clé — même quand la motivation disparaît.", "description_en": "Discipline is the key — even when motivation is gone.", "link": "https://www.instagram.com/lnkdt", "featured": null}]};

/* ===== js/announcement.js ===== */
/* SPOT D'ANNONCE — accueil (index.html)
 * Bandeau discret "Nouvelle publication" qui ouvre la publication désignée
 * (champ featured:true dans data/news.json, sinon la dernière) en lightbox
 * avec un bouton "Voir l'offre" vers la publication sur les réseaux.
 * Bilingue : écoute l'événement lnk-lang-changed du site.
 */
(function () {
  "use strict";
  const lang = () => (document.documentElement.lang === "en" ? "en" : "fr");
  const catalog = window.LNK_NEWS_CATALOG && window.LNK_NEWS_CATALOG.publications
    ? window.LNK_NEWS_CATALOG.publications.filter(Boolean) : [];
  if (!catalog.length) return;

  const T = {
    fr: { kicker: "ACTUALITÉ LNK_DT", label: "Nouvelle publication", cta: "Voir l'offre", close: "Fermer l'annonce" },
    en: { kicker: "LNK_DT NEWS", label: "New post", cta: "See the post", close: "Close announcement" },
  };

  // Priorité au champ featured (D1 override ou news.json), sinon la dernière publication
  let latest = null;
  const applyOverrides = async () => {
    try {
      const resp = await fetch('/api/news-admin?token=');
      if (resp.ok) {
        const { settings } = await resp.json();
        // Fusionner les settings D1 avec le catalogue
        catalog.forEach(pub => {
          const key = pub.file;
          if (settings[key]) {
            if (settings[key].featured !== undefined && settings[key].featured !== false) pub.featured = true;
            if (settings[key].link) pub.link = settings[key].link;
          }
        });
      }
    } catch (_) { /* fallback to static catalog */ }
    latest = catalog.find((p) => p.featured === true) || catalog[catalog.length - 1];
    render();
  };
  const spot = document.querySelector("#lnk-announcement");
  if (!spot) return;
  // Attendre les overrides D1 avant de rendre, sinon fallback statique immédiat
  applyOverrides().catch(() => { latest = catalog[catalog.length - 1]; render(); });

  function render() {
    const t = T[lang()];
    const title = lang() === "en" ? (latest.title_en || latest.title_fr) : latest.title_fr;
    const desc = lang() === "en" ? (latest.description_en || "") : (latest.description_fr || "");
    spot.querySelector("[data-ann-kicker]").textContent = t.kicker;
    spot.querySelector("[data-ann-title]").textContent = title;
    spot.querySelector("[data-ann-desc]").textContent = desc;
    spot.querySelector("[data-ann-desc]").hidden = !desc;
    const link = spot.querySelector("[data-ann-link]");
    if (latest.link) { link.href = latest.link; link.textContent = t.cta + " →"; link.hidden = false; }
    else link.hidden = true;
    spot.querySelector("[data-ann-close]").textContent = "×";
    spot.querySelector("[data-ann-close]").setAttribute("aria-label", t.close);
    spot.querySelector("[data-ann-img]").src = latest.file;
    spot.querySelector("[data-ann-img]").alt = latest.title_fr;
  }
  if (sessionStorage.getItem("lnk-announcement-dismissed")) spot.classList.add("lnk-ann-dismissed");
  render();

  /* ---------- Lightbox d'annonce ---------- */
  let dialog = null;
  function openAnn() {
    if (!dialog) {
      dialog = document.createElement("div");
      dialog.className = "lnk-ann-lightbox";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.innerHTML = `
        <div class="lnk-ann-lightbox-inner">
          <span class="lnk-ann-lightbox-badge" data-badge></span>
          <h3 data-ann-title></h3>
          <button type="button" class="lnk-ann-lightbox-close" data-action="ann-close" aria-label="Fermer">×</button>
          <div class="lnk-ann-lightbox-stage"><img data-ann-img alt=""></div>
          <p class="lnk-ann-lightbox-desc" data-ann-desc></p>
          <div class="lnk-ann-lightbox-bar"><a class="lnk-ann-lightbox-link" data-ann-link href="#" target="_blank" rel="noopener"></a></div>
        </div>`;
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog || e.target.matches("[data-action='ann-close']")) closeAnn();
      });
      document.body.appendChild(dialog);
    }
    const l = lang();
    dialog.querySelector("[data-badge]").textContent = latest.badge[l] || latest.badge.fr;
    dialog.querySelector("[data-ann-title]").textContent = l === "en" ? (latest.title_en || latest.title_fr) : latest.title_fr;
    const img = dialog.querySelector("[data-ann-img]");
    img.src = latest.file;
    img.alt = latest.title_fr;
    const desc = l === "en" ? (latest.description_en || "") : (latest.description_fr || "");
    const descEl = dialog.querySelector("[data-ann-desc]");
    descEl.textContent = desc;
    descEl.hidden = !desc;
    const linkEl = dialog.querySelector("[data-ann-link]");
    if (latest.link) {
      linkEl.href = latest.link;
      linkEl.textContent = T[l].cta + " →";
      linkEl.hidden = false;
    } else linkEl.hidden = true;
    dialog.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeAnn() {
    if (dialog) dialog.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function dismissSpot() {
    spot.classList.add("lnk-ann-dismissed");
    sessionStorage.setItem("lnk-announcement-dismissed", "1");
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dialog && dialog.classList.contains("is-open")) closeAnn();
  });

  spot.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-ann-close]");
    if (closeBtn) { closeAnn(); dismissSpot(); return; }
    const link = e.target.closest("[data-ann-link]");
    if (link) return; // laisser le lien ouvrir l'URL externe
    openAnn();
  });

  document.addEventListener("lnk-lang-changed", render);
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

/* ===== js/visual-upgrades.js ===== */
// LNK Design Touch — Visual Upgrades
// Scroll animations, custom cursor, ripple buttons, preloader, marquee, parallax, counters

(() => {
  'use strict';

  // ===== 1. PRELOADER =====
  function initPreloader() {
    const preloader = document.getElementById('lnk-preloader');
    if (!preloader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('lnk-preloader-done');
        setTimeout(() => preloader.remove(), 600);
      }, 400);
    });
    // Fallback: hide after 2s max
    setTimeout(() => {
      if (preloader.parentNode) {
        preloader.classList.add('lnk-preloader-done');
        setTimeout(() => preloader.remove(), 600);
      }
    }, 2000);
  }

  // ===== 2. SCROLL REVEAL ANIMATIONS =====
  function initScrollReveal() {
    const els = document.querySelectorAll('.lnk-reveal');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lnk-reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  }

  // ===== 3. CUSTOM CURSOR =====
  function initCustomCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'lnk-cursor';
    document.body.appendChild(cursor);
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    // Hover effect on interactive elements
    const interactive = document.querySelectorAll('a, button, [role="button"], .filter, .portfolio-card-button, input, textarea, select');
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('lnk-cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('lnk-cursor-hover'));
    });
  }

  // ===== 4. RIPPLE BUTTONS =====
  function initRipple() {
    const buttons = document.querySelectorAll('.button, .lnk-btn, .filter, .cta-btn');
    buttons.forEach(btn => {
      btn.classList.add('lnk-ripple');
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'lnk-ripple-effect';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ===== 5. PARALLAX LÉGER =====
  function initParallax() {
    const parallaxEls = document.querySelectorAll('.lnk-parallax');
    if (!parallaxEls.length) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxEls.forEach(el => {
          const speed = parseFloat(el.dataset.parallaxSpeed) || 0.05;
          el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  // ===== 6. COUNTER ANIMATION =====
  function initCounters() {
    const counters = document.querySelectorAll('.lnk-counter[data-target]');
    if (!counters.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = (target % 1 !== 0) ? 1 : 0;
    const duration = 1500;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(update);
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initScrollReveal();
    initCustomCursor();
    initRipple();
    initParallax();
    initCounters();
  });
})();
