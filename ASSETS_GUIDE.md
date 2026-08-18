# Guide d'ajout d'images au portfolio

## Structure des dossiers

```
assets/images/portfolio/
├── affiches/
│   ├── affiche-01.jpg    ← La première image (numéro 01) est utilisée comme badge "échantillon" de la catégorie
│   ├── affiche-02.jpg
│   ├── affiche-03.jpg
│   ├── affiche-04.jpg
│   ├── affiche-05.jpg
│   └── affiche-06.jpg
├── branding/
│   ├── branding-01.jpg
│   └── ...
├── web/
│   ├── web-01.jpg
│   └── ...
├── illustration/
│   └── ...
├── motion/
│   └── ...
└── print/
    └── ...
```

## Règles de nommage

| Élément | Règle | Exemple |
|---------|-------|---------|
| Nom de catégorie | Nom du dossier en minuscules, sans accents | `affiches`, `branding`, `web` |
| Nom de fichier | `{categorie}-{numero}.jpg` ou `.png` ou `.webp` | `affiche-01.jpg`, `branding-02.png` |
| Numéro | Toujours 2 chiffres (01, 02, ..., 06) | `01` = premier, `02` = deuxième |

## Comportement sur le site

1. **6 catégories** sont affichées sur la page d'accueil (toutes les images du dossier).
2. **Badge "échantillon"** : la première image de chaque catégorie (celle qui porte `01`) est utilisée comme carte de la catégorie.
3. **Clic sur une catégorie** → déploie les 6 travaux de cette catégorie en grille.
4. **Clic sur un travail** → ouvre la visionneuse (lightbox) avec navigation entre les images.

## Zoom dans la visionneuse

| Plateforme | Action | Résultat |
|------------|--------|----------|
| Mobile | Pincement à deux doigts | Zoom avant/arrière fluide |
| Mobile | Double-tap | Zoom avant (tape encore pour zoom arrière) |
| Desktop | Molette de souris | Zoom progressif |
| Desktop | Boutons + et − | Zoom avant/arrière |
| Desktop | Double-clic | Zoom avant |

## Pour ajouter un nouveau projet

1. Créer un dossier dans `assets/images/portfolio/` (ex: `nouveau-projet/`)
2. Y placer les images avec le nommage `{dossier}-01.jpg`, `{dossier}-02.jpg`, etc.
3. Pousser sur GitHub → le catalogue est régénéré automatiquement par le workflow.

## Pour ajouter des images à une catégorie existante

1. Placer l'image dans le bon dossier avec le prochain numéro (`07`, `08`, etc.)
2. Pousser sur GitHub → le site est mis à jour automatiquement (~2 min)
