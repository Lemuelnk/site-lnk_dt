/* SPOT D'ANNONCE — accueil (index.html)
 * Bandeau discret "Nouvelle publication" qui ouvre la publication désignée
 * (champ featured:true dans data/news.json, sinon la dernière) en lightbox
 * avec un bouton "Voir l'offre" vers la publication sur les réseaux.
 * Bilingue : écoute l'événement lnk-lang-changed du site.
 */
(function () {
  "use strict";
  const lang = () => (document.documentElement.lang === "en" ? "en" : "fr");
  let catalog = [];
  let latest = null;
  let timerInterval = null;

  const T = {
    fr: { kicker: "ANNONCE & PROMO", label: "Promotion", cta: "En savoir plus", close: "Fermer l'annonce", endsIn: "Se termine dans :" },
    en: { kicker: "OFFER & NEWS", label: "Promotion", cta: "Learn more", close: "Close announcement", endsIn: "Ends in:" },
  };

  const spot = document.querySelector("#lnk-announcement");

  async function init() {
    try {
      // Charger le catalogue statique
      const resp = await fetch('/data/news.json');
      if (resp.ok) {
        const data = await resp.json();
        catalog = data.publications || [];
      }
    } catch (e) { console.error('Erreur promo catalog:', e); }

    await applyOverrides();
  }

  // Priorité au champ featured (D1 override ou news.json), sinon la dernière publication
  const applyOverrides = async () => {
    try {
      const resp = await fetch('/api/news-admin?token=');
      if (resp.ok) {
        const { settings } = await resp.json();
        
        // Gérer la promo externe si elle existe et est active
        if (settings['EXTERNAL_PROMO'] && settings['EXTERNAL_PROMO'].featured) {
          const ext = settings['EXTERNAL_PROMO'];
          const externalPub = {
            file: ext.external_url,
            featured: true,
            link: ext.link,
            title_fr: ext.title_fr,
            title_en: ext.title_en,
            description_fr: ext.desc_fr,
            description_en: ext.desc_en,
            expires_at: ext.expires_at,
            badge: { fr: "PROMO FLASH", en: "FLASH OFFER" }
          };
          catalog.unshift(externalPub);
        }

        // Fusionner les settings D1 avec le catalogue
        const now = new Date().toISOString();
        catalog.forEach(pub => {
          pub.featured = false;
          const key = pub.file;
          if (settings[key]) {
            let isFeatured = settings[key].featured === 1 || settings[key].featured === true;
            // Vérifier l'expiration
            if (isFeatured && settings[key].expires_at && settings[key].expires_at < now) {
              isFeatured = false;
            }
            
            if (isFeatured) pub.featured = true;
            if (settings[key].link) pub.link = settings[key].link;
            if (settings[key].title_fr) pub.title_fr = settings[key].title_fr;
            if (settings[key].title_en) pub.title_en = settings[key].title_en;
            if (settings[key].desc_fr) pub.description_fr = settings[key].desc_fr;
            if (settings[key].desc_en) pub.description_en = settings[key].desc_en;
            if (settings[key].expires_at) pub.expires_at = settings[key].expires_at;
          }
        });
      }
    } catch (_) {}
    
    latest = catalog.find((p) => p.featured === true);
    
    if (spot) {
      if (latest) {
        render();
        spot.classList.add("lnk-ann-dismissed"); // Masquer la barre si popup actif
      } else {
        spot.classList.add("lnk-ann-dismissed");
      }
    }

    // Ouverture automatique si featured et pas encore vu cette session
    if (latest && latest.featured && !sessionStorage.getItem("lnk-promo-opened")) {
      setTimeout(openAnn, 1500);
      sessionStorage.setItem("lnk-promo-opened", "1");
    }
  };

  function render() {
    // La barre d'annonce est désormais obsolète si on utilise le popup premium
    // Mais on garde le markup pour compatibilité si besoin.
  }

  function startTimer(expiry) {
    if (!expiry) return;
    const update = () => {
      const now = new Date().getTime();
      const end = new Date(expiry).getTime();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(timerInterval);
        const timerEl = document.querySelector(".lnk-promo-timer");
        if (timerEl) timerEl.style.display = "none";
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const els = {
        days: document.getElementById("timer-d"),
        hours: document.getElementById("timer-h"),
        mins: document.getElementById("timer-m"),
        secs: document.getElementById("timer-s")
      };

      if (els.days) els.days.textContent = String(d).padStart(2, '0');
      if (els.hours) els.hours.textContent = String(h).padStart(2, '0');
      if (els.mins) els.mins.textContent = String(m).padStart(2, '0');
      if (els.secs) els.secs.textContent = String(s).padStart(2, '0');
    };

    update();
    timerInterval = setInterval(update, 1000);
  }

  /* ---------- Lightbox d'annonce ---------- */
  let dialog = null;
  function openAnn() {
    if (!latest) return;
    if (!dialog) {
      dialog = document.createElement("div");
      dialog.className = "lnk-ann-lightbox";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.innerHTML = `
        <div class="lnk-ann-lightbox-inner">
          <button type="button" class="lnk-ann-lightbox-close" data-action="ann-close" aria-label="Fermer" style="position:absolute; top:20px; right:20px; z-index:10;"><i data-lucide="x"></i></button>
          <div class="lnk-ann-lightbox-stage">
            <img data-ann-img alt="">
            <div class="lnk-promo-content">
              <span class="lnk-ann-lightbox-badge" data-badge>OFFER & NEWS</span>
              <h3 data-ann-title style="margin: 15px 0 10px; line-height: 1.1;"></h3>
              <p class="lnk-ann-lightbox-desc" data-ann-desc style="margin: 0; line-height: 1.5;"></p>
              
              <div class="lnk-promo-timer" id="promo-timer-container" style="display:none;">
                <p style="grid-column: 1/-1; font: 800 10px var(--heading); margin: 0 0 8px; opacity: 0.7;" id="timer-label"></p>
                <div class="lnk-timer-item"><span class="lnk-timer-val" id="timer-d">00</span><span class="lnk-timer-unit">Jours</span></div>
                <span class="lnk-timer-sep">:</span>
                <div class="lnk-timer-item"><span class="lnk-timer-val" id="timer-h">00</span><span class="lnk-timer-unit">Heures</span></div>
                <span class="lnk-timer-sep">:</span>
                <div class="lnk-timer-item"><span class="lnk-timer-val" id="timer-m">00</span><span class="lnk-timer-unit">Min</span></div>
                <span class="lnk-timer-sep">:</span>
                <div class="lnk-timer-item"><span class="lnk-timer-val" id="timer-s">00</span><span class="lnk-timer-unit">Sec</span></div>
              </div>

              <div>
                <a class="lnk-ann-lightbox-link" data-ann-link href="#" target="_blank" rel="noopener"></a>
              </div>
            </div>
          </div>
        </div>`;
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog || e.target.closest("[data-action='ann-close']")) closeAnn();
      });
      document.body.appendChild(dialog);
    }
    const l = lang();
    const badge = (latest.badge && latest.badge[l]) ? latest.badge[l] : (latest.badge ? latest.badge.fr : T[l].label);
    dialog.querySelector("[data-badge]").textContent = badge;
    dialog.querySelector("[data-ann-title]").textContent = l === "en" ? (latest.title_en || latest.title_fr) : latest.title_fr;
    const img = dialog.querySelector("[data-ann-img]");
    img.src = latest.file;
    img.alt = latest.title_fr || "Promotion";
    const desc = l === "en" ? (latest.description_en || "") : (latest.description_fr || "");
    const descEl = dialog.querySelector("[data-ann-desc]");
    descEl.textContent = desc;
    descEl.hidden = !desc;
    const linkEl = dialog.querySelector("[data-ann-link]");
    if (latest.link) {
      linkEl.href = latest.link;
      linkEl.textContent = T[l].cta + " →";
      linkEl.hidden = false;
      linkEl.onclick = () => {
        const file = latest.isExternal ? 'EXTERNAL_PROMO' : latest.file;
        fetch(`/api/news-admin?action=track-click&file=${encodeURIComponent(file)}`).catch(() => {});
      };
    } else linkEl.hidden = true;

    // Gestion du timer
    const timerContainer = dialog.querySelector("#promo-timer-container");
    const timerLabel = dialog.querySelector("#timer-label");
    if (latest.expires_at) {
      timerContainer.style.display = "flex";
      timerLabel.textContent = T[l].endsIn;
      startTimer(latest.expires_at);
    } else {
      timerContainer.style.display = "none";
    }

    dialog.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (window.lucide) window.lucide.createIcons();
  }
  function closeAnn() {
    if (dialog) dialog.classList.remove("is-open");
    document.body.style.overflow = "";
    if (timerInterval) clearInterval(timerInterval);
  }
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dialog && dialog.classList.contains("is-open")) closeAnn();
  });

  // Démarrage
  init();
})();
