/* LNK_DT NEWS — section de la page brand.html
 * Affiche les publications du studio (promos, quotes, CTA, créations)
 * avec auto-détection depuis assets/images/news/ (catalogue généré).
 * Bilingue FR/EN, lightbox par publication.
 */
(function () {
  "use strict";
  if (!document.querySelector(".lnk-news")) return;

  const lang = () => (document.documentElement.getAttribute("data-lang") === "en" ? "en" : "fr");
  const catalog = window.LNK_NEWS_CATALOG && window.LNK_NEWS_CATALOG.publications
    ? window.LNK_NEWS_CATALOG.publications.filter(Boolean) : [];

  /* ---------- Grille de publications ---------- */
  const grid = document.querySelector(".lnk-news-grid");
  if (grid && catalog.length) {
    grid.innerHTML = catalog.map((pub, i) => {
      const badge = pub.badge[lang()] || pub.badge.fr;
      const title = lang() === "en" ? (pub.title_en || pub.title_fr) : pub.title_fr;
      const alt = (pub.description_fr || title);
      return `
        <button type="button" class="lnk-news-card" data-news-index="${i}" aria-label="${title} — ${badge}">
          <span class="lnk-news-badge" aria-hidden="true">${badge}</span>
          <span class="lnk-news-media"><img src="${pub.file}" alt="${alt}" loading="lazy" width="800" height="450"></span>
          <span class="lnk-news-title">${title}</span>
        </button>`;
    }).join("");

    grid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-news-index]");
      if (!card) return;
      openNews(parseInt(card.dataset.newsIndex, 10));
    });
  }

  const emptyEl = document.querySelector(".lnk-news-empty");
  if (emptyEl) emptyEl.hidden = catalog.length > 0;

  /* ---------- Lightbox ---------- */
  let dialog = null;
  function openNews(index) {
    const pub = catalog[index];
    if (!pub) return;
    if (!dialog) {
      dialog = document.createElement("div");
      dialog.className = "lnk-news-lightbox";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.innerHTML = `
        <div class="lnk-news-lightbox-inner">
          <div class="lnk-news-lightbox-head">
            <span class="lnk-news-lightbox-badge" data-badge></span>
            <h3 data-news-title></h3>
            <button type="button" class="lnk-news-lightbox-close" data-action="news-close" aria-label="Fermer">×</button>
          </div>
          <div class="lnk-news-lightbox-stage"><img data-news-img alt=""></div>
          <p class="lnk-news-lightbox-desc" data-news-desc></p>
          <div class="lnk-news-lightbox-bar">
            <span data-news-counter></span>
            <a class="lnk-news-lightbox-link" data-news-link href="#" target="_blank" rel="noopener">Voir l'offre</a>
          </div>
        </div>`;
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog || e.target.matches("[data-action='news-close']")) closeNews();
      });
      document.body.appendChild(dialog);
    }
    const langCur = lang();
    dialog.querySelector("[data-badge]").textContent = pub.badge[langCur] || pub.badge.fr;
    dialog.querySelector("[data-news-title]").textContent = langCur === "en" ? (pub.title_en || pub.title_fr) : pub.title_fr;
    const img = dialog.querySelector("[data-news-img]");
    img.src = pub.file;
    img.alt = pub.description_fr || pub.title_fr;
    const desc = langCur === "en" ? (pub.description_en || "") : (pub.description_fr || "");
    const descEl = dialog.querySelector("[data-news-desc]");
    descEl.textContent = desc;
    descEl.hidden = !desc;
    dialog.querySelector("[data-news-counter]").textContent = `${index + 1} / ${catalog.length}`;
    const linkEl = dialog.querySelector("[data-news-link]");
    if (pub.link) {
      linkEl.href = pub.link;
      linkEl.hidden = false;
      linkEl.textContent = langCur === "en" ? "See the post →" : "Voir l'offre →";
    } else {
      linkEl.hidden = true;
    }
    dialog.dataset.index = index;
    dialog.classList.add("is-open");
    document.body.style.overflow = "hidden";
    img.addEventListener("load", () => img.scrollIntoView({ block: "center", behavior: "smooth" }), { once: true });
  }

  function closeNews() {
    if (dialog) dialog.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dialog && dialog.classList.contains("is-open")) closeNews();
  });

  /* ---------- Switch de langue ---------- */
  document.addEventListener("lnk-lang-changed", () => {
    // Re-render la grille avec la nouvelle langue
    const cards = grid ? grid.querySelectorAll(".lnk-news-card") : [];
    cards.forEach((card) => {
      const pub = catalog[parseInt(card.dataset.newsIndex, 10)];
      if (!pub) return;
      card.querySelector(".lnk-news-badge").textContent = pub.badge[lang()] || pub.badge.fr;
      card.querySelector(".lnk-news-title").textContent = lang() === "en" ? (pub.title_en || pub.title_fr) : pub.title_fr;
    });
    // Mettre à jour le lightbox ouvert s'il y en a un
    if (dialog && dialog.classList.contains("is-open")) {
      const idx = parseInt(dialog.dataset.index, 10);
      const pub = catalog[idx];
      if (pub) openNews(idx);
    }
  });
})();
