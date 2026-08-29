# État de la migration - 26 Août 2026

## Simple Icons (Logos de marque)
- Intégration par **SVG inlining direct** terminée pour les logos sociaux.
- Pages traitées : `index.html`, `brand.html`, `contact.html`, `case-study-mtj.html`, `devis.html`.
- Styles centralisés dans `css/lucide-overrides.css` via la classe `.brand-icon`.
- Fichiers sources validés dans `assets/icons/simple-icons/`.

## Lucide Vanilla JS
- Bibliothèque `js/vendor/lucide.min.js` incluse dans le bundle principal.
- Utilisation du pattern `data-lucide="..."` + `lucide.createIcons()`.
- Appel de `createIcons()` ajouté après les injections dynamiques dans `portfolio.js`, `announcement.js`, `admin-news.js`, et `devis.js`.

## Système de Promotions (Popup)
- Architecture refactorisée : `announcement.js` charge désormais `data/news.json` via `fetch`.
- Point de montage neutre `#lnk-announcement` dans `index.html` (barre legacy supprimée).
- Support des promotions externes (D1) avec priorité sur le catalogue statique.
- Sécurité du token admin renforcée dans `functions/api/news-admin.js`.
- Bouton de fermeture popup migré vers Lucide (`x`).

## Nettoyage
- Suppression des styles inline obsolètes dans `index.html`.
- Nettoyage des sélecteurs `svg.bi` et `.bi-custom-icon` dans `css/index-extras.css`.
- Mise à jour du script d'audit `tools/site-icon-audit.py` pour ignorer les SVG inlinés dans les zones sociales.
