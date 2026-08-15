# LNK Design Touch — Asset audit / Étape 9B

## État
Les chemins sont centralisés et vérifiés. Les fichiers média officiels ne sont volontairement **pas générés** : ils doivent être remplacés par les fichiers de marque réels de LNK Design Touch.

## Brand — `assets/images/brand/`

| Fichier | Rôle | Recommandation |
|---|---|---|
| `logo.svg` | Logo principal générique | SVG vectoriel |
| `logo-secondary.svg` | Logo secondaire | SVG vectoriel |
| `logo-dark.svg` | Logo pour fond clair / header | SVG vectoriel |
| `logo-light.svg` | Logo pour fond sombre / footer | SVG vectoriel |
| `logo-secondary-dark.svg` | Secondaire, version sombre | SVG vectoriel |
| `logo-secondary-light.svg` | Secondaire, version claire | SVG vectoriel |
| `logo-horizontal.svg` | Déclinaison horizontale | SVG vectoriel |
| `logo-horizontal-dark.svg` | Horizontale / fond clair | SVG vectoriel |
| `logo-horizontal-light.svg` | Horizontale / fond sombre | SVG vectoriel |
| `logo-vertical.svg` | Déclinaison verticale | SVG vectoriel |
| `logo-vertical-dark.svg` | Verticale / fond clair | SVG vectoriel |
| `logo-vertical-light.svg` | Verticale / fond sombre | SVG vectoriel |
| `logo-mark.svg` | Mark / symbole seul | SVG carré |
| `logo-mark-dark.svg` | Mark sombre | SVG carré |
| `logo-mark-light.svg` | Mark clair | SVG carré |
| `favicon.svg` | Favicon principal | SVG carré |
| `favicon-16.png` | Favicon petit | 16×16 px |
| `favicon-32.png` | Favicon standard | 32×32 px |
| `favicon.ico` | Compatibilité favicon | 32×32 px ou multi-size |
| `apple-touch-icon.png` | Icône Apple/mobile | **180×180 px** |
| `og-image.jpg` | Open Graph / partage social | **1200×630 px** |

### Fichiers effectivement utilisés par le HTML
- Header : `logo-dark.svg`
- Footer : `logo-light.svg`
- Favicon : `favicon.svg` + variantes PNG
- Apple : `apple-touch-icon.png`
- Open Graph / Twitter : `og-image.jpg`

Les autres déclinaisons sont déclarées dans `data/assets.json` comme emplacements réservés pour le système de marque.

## Founder — `assets/images/founder/`

- `founder.webp` — **1200×1500 px (4:5)** recommandé.
- Le placeholder visuel reste affiché tant que la photo réelle n'est pas fournie.

## Portfolio — `assets/images/portfolio/`

Dossiers prévus :
- `affiches/`
- `branding/`
- `bannieres/`
- `social-media/`
- `calendriers/`
- `invitations/`
- `et-plus-encore/`

Images recommandées : WebP/JPG, **1600 px minimum sur le côté long**. Les réalisations doivent être réelles et être déclarées dans `data/portfolio.json`.

## Important
Les fichiers `.PLACE-FILE-HERE` sont uniquement des repères. Ils ne sont pas référencés par le HTML et ne doivent pas être renommés en vrais fichiers image sans remplacement par les médias officiels.
