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
