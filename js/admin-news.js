/* Admin LNK_DT ANNONCES — gestion du spot d'annonce accueil.
   Permet de choisir quelle promotion ou actualité s'affiche dans le bandeau
   de la page d'accueil et de définir son lien de redirection.
*/
(function () {
  "use strict";
  const NEWS_API = "/api/news-admin";
  const TOKEN_KEY = "lnk_dt_admin_token";
  let catalog = [];
  let settings = {};

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
  }

  async function fetchData() {
    try {
      // Charger le catalogue statique
      const catResp = await fetch('/data/news.json');
      if (catResp.ok) {
        const catData = await catResp.json();
        catalog = catData.publications.filter(Boolean);
      }
      
      // Charger tous les paramètres dynamiques depuis D1
      const setResp = await fetch(NEWS_API + "?action=get-all", {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${getToken()}` }
      });
      if (setResp.ok) {
        const setData = await setResp.json();
        // Transformer les résultats en objet indexé par file
        const allSettings = {};
        (setData.results || []).forEach(r => { allSettings[r.file] = r; });
        settings = allSettings;
      }
      
      applyOverrides();
      render();
    } catch (e) { console.error('Erreur chargement admin-news:', e); }
  }

  function applyOverrides() {
    catalog.forEach(pub => {
      pub.featured = false;
      pub.link = pub.link || "";
      pub.status = 'active';
      const key = pub.file;
      if (settings[key]) {
        if (settings[key].featured) pub.featured = true;
        if (settings[key].custom_link) pub.link = settings[key].custom_link;
        if (settings[key].title_fr) pub.title_fr = settings[key].title_fr;
        if (settings[key].title_en) pub.title_en = settings[key].title_en;
        if (settings[key].desc_fr) pub.description_fr = settings[key].desc_fr;
        if (settings[key].desc_en) pub.description_en = settings[key].desc_en;
        if (settings[key].status) pub.status = settings[key].status;
      }
    });
  }

  function renderActivePromo(promo) {
    const container = document.getElementById("admin-active-promo-section");
    const content = document.getElementById("admin-active-promo-content");
    if (!container || !content) return;

    if (!promo) {
      container.style.display = 'none';
      container.hidden = true;
      return;
    }

    container.style.display = 'block';
    container.hidden = false;
    const clicks = settings[promo.dbKey || promo.file]?.click_count || 0;
    const expiresAt = settings[promo.dbKey || promo.file]?.expires_at;
    let timeLabel = "Illimitée";
    if (expiresAt) {
      const diff = new Date(expiresAt) - new Date();
      if (diff > 0) {
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(h / 24);
        timeLabel = d > 0 ? `Expire dans ${d}j ${h % 24}h` : `Expire dans ${h}h`;
      } else {
        timeLabel = "Expirée";
      }
    }

    content.innerHTML = `
      <div class="active-promo-grid">
        <div class="active-promo-visual">
          <img src="${promo.file}" alt="">
          <div class="active-promo-stats">
            <span class="stat-item"><i data-lucide="mouse-pointer-2"></i> <strong>${clicks}</strong> clics</span>
            <span class="stat-item"><i data-lucide="clock"></i> ${timeLabel}</span>
          </div>
        </div>
        <div class="active-promo-details">
          <div class="active-promo-text">
            <h4>${promo.title_fr || "Sans titre"}</h4>
            <p>${promo.description_fr || "Pas de description"}</p>
            <code class="active-promo-link">${promo.link || "Pas de lien"}</code>
          </div>
          <div class="active-promo-actions">
            <button type="button" class="admin-btn-primary promo-edit-btn" data-file="${promo.file}"><i data-lucide="edit-3"></i> Modifier</button>
            <button type="button" class="admin-btn-secondary promo-suspend-btn" data-file="${promo.dbKey || promo.file}"><i data-lucide="pause-circle"></i> Suspendre</button>
            <button type="button" class="admin-btn-danger promo-remove-btn" data-file="${promo.dbKey || promo.file}"><i data-lucide="trash-2"></i> Retirer & Corbeille</button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }
      });
    }

    content.querySelector(".promo-edit-btn").onclick = () => {
      document.getElementById("promo-image-url").value = promo.file;
      document.getElementById("promo-title-fr").value = promo.title_fr || "";
      document.getElementById("promo-title-en").value = promo.title_en || "";
      document.getElementById("promo-desc-fr").value = promo.description_fr || "";
      document.getElementById("promo-desc-en").value = promo.description_en || "";
      document.getElementById("promo-wa-link").value = promo.link || "";
      updatePreview(promo.file);
      document.getElementById("admin-news-section").scrollIntoView({ behavior: "smooth" });
    };

    content.querySelector(".promo-suspend-btn").onclick = async () => {
      if (!confirm("Suspendre cette promotion ? Elle ne sera plus visible sur le site.")) return;
      await callNewsAction(promo.dbKey || promo.file, 'unfeature');
    };

    content.querySelector(".promo-remove-btn").onclick = async () => {
      if (!confirm("Retirer et mettre cette promotion à la corbeille ?")) return;
      await callNewsAction(promo.dbKey || promo.file, 'trash');
    };
  }

  function updatePreview(url) {
    const img = document.getElementById("promo-image-preview");
    const placeholder = document.getElementById("promo-image-placeholder");
    const urlInput = document.getElementById("promo-image-url");
    if (url) {
      img.src = url;
      img.style.display = "block";
      placeholder.style.display = "none";
      if (urlInput) urlInput.value = url;
    } else {
      img.style.display = "none";
      placeholder.style.display = "block";
    }
  }

  async function render() {
    const listEl = document.getElementById("admin-news-list");
    const emptyEl = document.getElementById("admin-news-empty");
    const trashListEl = document.getElementById("admin-news-trash-list");
    const trashEmptyEl = document.getElementById("admin-news-trash-empty");
    if (!listEl) return;

    // Fusionner catalogue statique et imports dynamiques (EXTERNAL_PROMO et autres)
    let fullCatalog = [...catalog];
    Object.keys(settings).forEach(key => {
      if (key === 'EXTERNAL_PROMO' || !catalog.find(p => p.file === key)) {
        const s = settings[key];
        fullCatalog.push({
          file: s.external_url || s.file,
          title_fr: s.title_fr,
          title_en: s.title_en,
          description_fr: s.desc_fr,
          description_en: s.desc_en,
          link: s.custom_link,
          featured: s.featured === 1,
          status: s.status || 'active',
          isExternal: true,
          dbKey: s.file
        });
      }
    });

    // Remplir le formulaire avec la promo active
    const activePromo = fullCatalog.find(p => p.featured && p.status !== 'deleted');
    console.log('Active Promo found:', activePromo);
    
    // S'assurer que la section est bien mise à jour
    renderActivePromo(activePromo);
    
    if (activePromo && !document.getElementById("promo-image-url").value) {
      document.getElementById("promo-title-fr").value = activePromo.title_fr || "";
      document.getElementById("promo-title-en").value = activePromo.title_en || "";
      document.getElementById("promo-desc-fr").value = activePromo.description_fr || "";
      document.getElementById("promo-desc-en").value = activePromo.description_en || "";
      document.getElementById("promo-wa-link").value = activePromo.link || "";
      updatePreview(activePromo.file);
      document.getElementById("promo-image-url").value = activePromo.file;
    }

    const activeItems = fullCatalog.filter(p => p.status !== 'deleted');
    const trashedItems = fullCatalog.filter(p => p.status === 'deleted');

    emptyEl.hidden = activeItems.length > 0;
    listEl.innerHTML = activeItems.map((pub, i) => {
      const title = pub.title_fr || pub.file.split('/').pop();
      const isFeatured = pub.featured === true;
      const clicks = settings[pub.dbKey || pub.file]?.click_count || 0;
      return `
        <div class="admin-news-item ${isFeatured ? 'is-active' : ''}">
          <img src="${pub.file}" alt="${title}">
          <div class="admin-news-info">
            <p class="admin-news-name">${title}</p>
            <p class="admin-news-meta">${pub.file.length > 30 ? pub.file.substring(0, 27) + '...' : pub.file}</p>
            <div class="admin-promo-stat-mini" title="Nombre de clics">
              <i data-lucide="mouse-pointer-2"></i> ${clicks} clics
            </div>
          </div>
          <div class="admin-news-actions">
            <button type="button" class="admin-news-select-btn" data-file="${pub.file}">
              ${isFeatured ? "★ En ligne" : "Sélectionner"}
            </button>
            <button type="button" class="admin-news-trash-btn" data-file="${pub.dbKey || pub.file}" title="Mettre à la corbeille">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>`;
    }).join("");

    if (trashListEl) {
      trashEmptyEl.hidden = trashedItems.length > 0;
      trashListEl.innerHTML = trashedItems.map((pub, i) => {
        const title = pub.title_fr || pub.file.split('/').pop();
        return `
          <div class="admin-news-item is-trashed">
            <img src="${pub.file}" alt="${title}">
            <div class="admin-news-info">
              <p class="admin-news-name">${title}</p>
            </div>
            <div class="admin-news-actions">
              <button type="button" class="admin-news-restore-btn" data-file="${pub.dbKey || pub.file}">Restaurer</button>
              <button type="button" class="admin-news-delete-btn" data-file="${pub.dbKey || pub.file}">Supprimer</button>
            </div>
          </div>`;
      }).join("");
    }

    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    document.querySelectorAll(".admin-news-select-btn").forEach(btn => {
      btn.onclick = () => {
        const file = btn.dataset.file;
        const pub = fullCatalog.find(p => p.file === file);
        document.getElementById("promo-title-fr").value = pub.title_fr || "";
        document.getElementById("promo-title-en").value = pub.title_en || "";
        document.getElementById("promo-desc-fr").value = pub.description_fr || "";
        document.getElementById("promo-desc-en").value = pub.description_en || "";
        document.getElementById("promo-wa-link").value = pub.link || "https://wa.me/243998222431?text=Bonjour%20LNK...";
        updatePreview(pub.file);
        document.getElementById("promo-image-url").value = pub.file;
        document.getElementById("admin-promo-setup-form").scrollIntoView({ behavior: "smooth" });
      };
    });

    document.querySelectorAll(".admin-news-trash-btn").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Mettre ce visuel à la corbeille ?")) return;
        await callNewsAction(btn.dataset.file, 'trash');
      };
    });

    document.querySelectorAll(".admin-news-restore-btn").forEach(btn => {
      btn.onclick = async () => {
        await callNewsAction(btn.dataset.file, 'restore');
      };
    });

    document.querySelectorAll(".admin-news-delete-btn").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Supprimer définitivement ce visuel ?")) return;
        await callNewsAction(btn.dataset.file, 'delete-forever');
      };
    });
  }

  async function callNewsAction(file, action) {
    try {
      const resp = await fetch(NEWS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify({ file, action })
      });
      if (resp.ok) fetchData();
      else alert("Erreur lors de l'action : " + await resp.text());
    } catch (e) { alert("Erreur réseau"); }
  }

  // Initialisation des contrôles du formulaire
  function initForm() {
    const fileInput = document.getElementById("promo-image-file");
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => updatePreview(event.target.result);
          reader.readAsDataURL(file);
        }
      };
    }

    const urlInput = document.getElementById("promo-image-url");
    if (urlInput) {
      urlInput.oninput = () => updatePreview(urlInput.value);
    }

    const waGenBtn = document.getElementById("promo-wa-gen");
    if (waGenBtn) {
      waGenBtn.onclick = () => {
        const title = document.getElementById("promo-title-fr").value || "votre offre";
        const encoded = encodeURIComponent(`Bonjour LNK, je suis intéressé par la promotion : ${title}`);
        document.getElementById("promo-wa-link").value = `https://wa.me/243998222431?text=${encoded}`;
      };
    }

    const promoForm = document.getElementById("admin-promo-setup-form");
    if (promoForm) {
      promoForm.onsubmit = async (e) => {
        e.preventDefault();
        const imageUrl = document.getElementById("promo-image-url").value;
        const statusEl = document.getElementById("promo-status");
        if (!imageUrl) return alert("Veuillez choisir une image.");

        statusEl.textContent = "Publication...";
        statusEl.style.color = "inherit";

        try {
          const resp = await fetch(NEWS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
            body: JSON.stringify({ 
              file: imageUrl, 
              action: "feature",
              title_fr: document.getElementById("promo-title-fr").value,
              title_en: document.getElementById("promo-title-en").value,
              desc_fr: document.getElementById("promo-desc-fr").value,
              desc_en: document.getElementById("promo-desc-en").value,
              link: document.getElementById("promo-wa-link").value,
              duration: document.getElementById("promo-duration-value").value,
              unit: document.getElementById("promo-duration-unit").value
            })
          });
          if (resp.ok) {
            statusEl.textContent = "✅ Annonce lancée avec succès !";
            statusEl.style.color = "var(--teal)";
            setTimeout(() => fetchData(), 1500);
          } else {
            const msg = await resp.text();
            statusEl.textContent = "❌ Erreur: " + msg;
            statusEl.style.color = "red";
          }
        } catch (_) { statusEl.textContent = "❌ Erreur réseau"; }
      };
    }
    
    document.getElementById("admin-news-refresh")?.addEventListener("click", fetchData);
  }

  // Observer pour charger les données quand le panel admin est affiché
  const panel = document.getElementById("admin-panel");
  if (panel) {
    const observer = new MutationObserver(() => {
      if (!panel.hidden) fetchData();
    });
    observer.observe(panel, { attributes: true });
    if (!panel.hidden) fetchData();
  }
  
  initForm();
})();
