# Spécifications du Système de Promotion Flash (LNK Design Touch)

## Architecture
- **Backend** : Cloudflare D1 (table `news_settings`) géré via `functions/api/news-admin.js`.
- **Frontend Admin** : `admin-reviews.html` + `js/admin-news.js` + `css/admin-reviews.css`.
- **Frontend Public** : `js/announcement.js` + `css/announcements.css` sur `index.html`.

## Fonctionnalités
1. **Pilotage Admin** :
   - Sélection d'image depuis le catalogue local ou importation externe (Base64/URL).
   - Titres et descriptions personnalisés (FR/EN).
   - Générateur de lien WhatsApp avec message pré-rempli.
   - Gestion de l'expiration (1, 3, 7, 14, 30 jours ou illimité).
2. **Affichage Public** :
   - Pop-up (Lightbox) plein écran élégant à l'ouverture du site.
   - Ouverture automatique une fois par session (sessionStorage).
   - Masquage automatique de la barre d'annonce classique si une promo est active.
   - Vérification de l'expiration côté serveur et client.

## Icônes
- **Stratégie** : Utilisation exclusive de Lucide Icons via masques CSS (`svg.bi` ou classes `.lc-icon`).
- **Mappings** :
  - Admin : `rocket` (Lancer), `image` (Visuel), `link` (Lien), `clock` (Durée), `folder-open` (Parcourir).
  - Public : `x` (Fermer).
