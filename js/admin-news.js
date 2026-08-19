/* Admin LNK_DT NEWS — gestion de la publication en vedette et des liens.
   Charge le catalogue statique (js/news-catalog.js), applique les overrides D1,
   puis permet à l'admin de choisir la publication vedette et modifier les liens.
*/
(function () {
  "use strict";
  const NEWS_API = "/api/news-admin";
  const TOKEN_KEY = "lnk_dt_admin_token";
  const catalog = window.LNK_NEWS_CATALOG && window.LNK_NEWS_CATALOG.publications
    ? window.LNK_NEWS_CATALOG.publications.filter(Boolean) : [];

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
  }

  let settings = {};

  async function loadSettings() {
    try {
      const resp = await fetch(NEWS_API + "?token=" + encodeURIComponent(getToken()));
      if (resp.ok) {
        const data = await resp.json();
        settings = data.settings || {};
      }
    } catch (_) { /* fallback */ }
  }

  function applyOverrides() {
    catalog.forEach(pub => {
      const key = pub.file;
      if (settings[key]) {
        if (settings[key].featured) pub.featured = true;
        if (settings[key].link) pub.link = settings[key].link;
      }
    });
  }

  async function render() {
    const listEl = document.getElementById("admin-news-list");
    const emptyEl = document.getElementById("admin-news-empty");
    if (!listEl) return;

    await loadSettings();
    applyOverrides();

    if (!catalog.length) {
      emptyEl.hidden = false;
      listEl.innerHTML = "";
      return;
    }
    emptyEl.hidden = true;

    listEl.innerHTML = catalog.map((pub, i) => {
      const title = pub.title_fr || pub.file;
      const badge = (pub.badge && pub.badge.fr) || "Actualité";
      const isFeatured = pub.featured === true;
      const currentLink = pub.link || "";
      const thumb = pub.file.replace("assets/images/", "");
      return `
        <div class="admin-news-item" data-index="${i}" style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--admin-border,var(--border,#ddd));border-radius:8px;margin-bottom:8px;background:var(--admin-card,var(--card,#fff));">
          <img src="${pub.file}" alt="${title}" style="width:64px;height:64px;object-fit:cover;border-radius:6px;flex-shrink:0;">
          <div style="flex:1;min-width:0;">
            <p style="margin:0;font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</p>
            <p style="margin:2px 0 0;font-size:0.75rem;opacity:0.7;">${badge} · ${thumb}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
            <button type="button" class="admin-news-feature-btn" data-index="${i}"
              style="padding:4px 12px;border-radius:6px;border:1px solid ${isFeatured ? "var(--accent,var(--teal,#009688))" : "var(--admin-border,var(--border,#ddd))"};background:${isFeatured ? "var(--accent,var(--teal,#009688))" : "transparent"};color:${isFeatured ? "#fff" : "inherit"};cursor:pointer;font-size:0.8rem;">
              ${isFeatured ? "★ Vedette" : "☆ Vedette"}
            </button>
            <input type="text" class="admin-news-link-input" data-index="${i}"
              value="${currentLink}" placeholder="Lien de redirection..."
              style="padding:4px 8px;border-radius:4px;border:1px solid var(--admin-border,var(--border,#ddd));font-size:0.75rem;width:180px;">
            <button type="button" class="admin-news-link-btn" data-index="${i}"
              style="padding:2px 8px;border-radius:4px;border:1px solid var(--admin-border,var(--border,#ddd));background:transparent;cursor:pointer;font-size:0.7rem;">
              Sauver lien
            </button>
          </div>
        </div>`;
    }).join("");

    // Event listeners
    listEl.querySelectorAll(".admin-news-feature-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.dataset.index, 10);
        const pub = catalog[idx];
        const action = pub.featured ? "unfeature" : "feature";
        try {
          const resp = await fetch(NEWS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
            body: JSON.stringify({ file: pub.file, action })
          });
          if (resp.ok) {
            await render(); // Re-render
          }
        } catch (_) { alert("Erreur réseau. Réessayez."); }
      });
    });

    listEl.querySelectorAll(".admin-news-link-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.dataset.index, 10);
        const pub = catalog[idx];
        const input = listEl.querySelector(`.admin-news-link-input[data-index="${idx}"]`);
        const link = input.value.trim();
        try {
          const resp = await fetch(NEWS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
            body: JSON.stringify({ file: pub.file, action: "setlink", link })
          });
          if (resp.ok) {
            btn.textContent = "✓ Sauvé";
            setTimeout(() => { btn.textContent = "Sauver lien"; }, 2000);
          } else {
            alert("Erreur lors de la sauvegarde.");
          }
        } catch (_) { alert("Erreur réseau. Réessayez."); }
      });
    });
  }

  // Refresh button
  document.getElementById("admin-news-refresh")?.addEventListener("click", () => render());

  // Render when the panel is shown (after login)
  // Watch for the admin-panel becoming visible
  const panel = document.getElementById("admin-panel");
  if (panel) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === "hidden") {
          if (!panel.hidden) render();
        }
      });
    });
    observer.observe(panel, { attributes: true });
    // Also render immediately if already visible
    if (!panel.hidden) render();
  }
})();
