# LNK Design Touch — Étape 9B
## Responsive refinement + contrôle desktop + assets

### Inclus
- Footer éditorial complet
- Navigation secondaire : Work / Services / About / Contact
- Email officiel
- WhatsApp officiel
- Lubumbashi, DRC
- Distinction design à distance / impression à Lubumbashi
- Lien de localisation « Notre adresse »
- 9 réseaux sociaux + Behance
- Icônes SVG dédiées aux plateformes/actions
- `aria-label` sur les liens sociaux et externes
- ouverture sécurisée dans un nouvel onglet
- focus clavier visible
- micro-interactions hover
- responsive mobile/tablette/desktop
- support `prefers-reduced-motion`
- année du copyright dynamique

### Audit des URLs
Les URLs du cahier des charges sont utilisées telles quelles. Aucune URL n'est reconstruite à partir des usernames.


## Assets média
Voir `ASSETS_GUIDE.md` pour les chemins exacts, noms de fichiers et dimensions recommandées.

## Assets de marque

Les chemins officiels des logos sont centralisés dans `data/assets.json`. Les déclinaisons prévues sont documentées dans `assets/images/brand/README.md`. Remplacer les fichiers `.PLACE-FILE-HERE` par les fichiers officiels correspondants.

## Étape 9A
Les ajustements responsive mobile/tablette sont isolés dans `css/responsive-9a.css`, chargé en dernier afin de ne pas réécrire les feuilles existantes.

## Étape 9B
Les contrôles et la maintenance sont documentés dans `docs/rapport_final_maintenance.md`, tandis que les migrations sont suivies dans `docs/migration_status.md`.


## Avis clients
Le système d'avis repose sur Cloudflare Pages Functions, D1 et Turnstile, avec modération avant publication. Voir `docs/guide_admin_lnk_dt.md` et `database/schema.sql`.
