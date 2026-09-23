(() => {
  // Portail d'administration discret : 5 taps rapides sur le logo du footer
  // ouvrent la page de modération des avis. Invisible pour les visiteurs :
  // aucun indicateur visuel, aucun message.
  //
  // Sécurité : la clé d'accès n'est plus jamais transmise ou acceptée via
  // l'URL (ni ?gate=, ni #t=) — elle laisserait une trace dans l'historique
  // du navigateur et les journaux serveur. Le geste ouvre uniquement la
  // page de connexion ; la clé se saisit à chaque fois dans le formulaire.
  const TAPS_REQUIRED = 5;
  const TAP_WINDOW_MS = 1800;

  const taps = [];

  function onGateTap() {
    const now = Date.now();
    taps.push(now);
    while (taps.length && taps[0] < now - TAP_WINDOW_MS) taps.shift();
    if (taps.length >= TAPS_REQUIRED) {
      taps.length = 0;
      location.href = '/admin-reviews.html';
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
