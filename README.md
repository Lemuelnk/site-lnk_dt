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
Voir `ASSET_GUIDE.md` pour les chemins exacts, noms de fichiers et dimensions recommandées.

## Assets de marque

Les chemins officiels des logos sont centralisés dans `data/assets.json`. Les déclinaisons prévues sont documentées dans `assets/images/brand/README.md`. Remplacer les fichiers `.PLACE-FILE-HERE` par les fichiers officiels correspondants.

## Étape 9A
Les ajustements responsive mobile/tablette sont isolés dans `css/responsive-9a.css`, chargé en dernier afin de ne pas réécrire les feuilles existantes.

## Étape 9B
Les contrôles desktop et les emplacements média sont documentés dans `ASSET_STATUS_9B.md`. Le changelog complet est dans `STEP_9B_CHANGELOG.md`.


## Avis clients
Le système d'avis est préparé pour Cloudflare Pages Functions + D1 + Turnstile, avec modération avant publication. Voir `README_TESTIMONIALS.md`.
