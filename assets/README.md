# LNK Design Touch — Guide média / assets

Tous les chemins sont relatifs à la racine du site. **Ne renommez pas les dossiers** ; ajoutez simplement les fichiers aux emplacements indiqués.

## 1. Identité de marque — `assets/images/brand/`

| Fichier | Usage | Taille recommandée | Format |
|---|---|---:|---|
| `logo.svg` | Logo principal du header/footer | vectoriel, idéalement artboard ~240×64 px | SVG |
| `logo-light.svg` | Variante claire si nécessaire sur fond sombre | vectoriel | SVG |
| `favicon.svg` | Favicon navigateur | 32×32 px ou SVG carré | SVG |
| `apple-touch-icon.png` | Icône iOS/mobile | 180×180 px | PNG |
| `og-image.jpg` | Aperçu lors du partage (Open Graph/Twitter) | **1200×630 px** | JPG/WebP |

`favicon.svg` est déjà référencé. `logo.svg`, `apple-touch-icon.png` et `og-image.jpg` sont référencés par le site et peuvent être ajoutés quand disponibles.

## 2. Fondateur — `assets/images/founder/`

| Fichier | Usage | Taille recommandée | Format |
|---|---|---:|---|
| `founder.webp` | Photo principale du fondateur | **1200×1500 px (4:5)** | WebP |
| `founder.jpg` | Alternative si WebP indisponible | 1200×1500 px | JPG |

Le site utilise `founder.webp`. Pour éviter un fichier cassé avant son ajout, la zone se masque automatiquement si le fichier est absent.

## 3. Portfolio — `assets/images/portfolio/`

Dossiers :
- `affiches/`
- `branding/`
- `bannieres/`
- `social-media/`
- `calendriers/`
- `invitations/`
- `et-plus-encore/`

### Images de projets
- recommandation : **1600 px minimum sur le grand côté** ;
- WebP prioritaire, JPG accepté ;
- conserver les originaux haute résolution hors du site ;
- nommage : `projet-nom-01.webp`, `projet-nom-02.webp` ;
- ne jamais mettre un faux projet dans le portfolio.

Le portfolio est piloté par `data/portfolio.json`. Une entrée réelle peut utiliser par exemple :
`assets/images/portfolio/affiches/nom-du-projet-01.webp`

## 4. Pourquoi les chemins sont centralisés

Le code ne dépend pas de fichiers média dispersés. Chaque famille possède son dossier. Pour remplacer une image, il suffit de remplacer le fichier ou de modifier son chemin dans `data/portfolio.json`, sans réorganiser le HTML/CSS.

## 5. Règle de remplacement

Avant publication : vérifier que chaque fichier référencé existe réellement et que son nom respecte exactement la casse du chemin. Les serveurs Linux distinguent `Logo.svg` et `logo.svg`.
