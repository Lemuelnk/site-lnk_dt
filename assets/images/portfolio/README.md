# Ajouter un média au portfolio

Ajoutez une image dans le dossier correspondant à sa catégorie, avec un nom de fichier en minuscules, sans accents ni espaces. Le préfixe de dossier détermine automatiquement la catégorie.

```text
assets/images/portfolio/affiches/affiche-evenement-2026.webp
assets/images/portfolio/branding/identite-maison-k.webp
assets/images/portfolio/bannieres/offre-estivale.webp
assets/images/portfolio/social-media/campagne-lancement.webp
assets/images/portfolio/calendriers/calendrier-entreprise-2026.webp
assets/images/portfolio/et-plus-encore/projet-special.webp
```

Le catalogue est régénéré automatiquement à partir des images présentes dans ces dossiers. Le titre est déduit du nom du fichier. Les images WebP ou AVIF sont recommandées ; les formats JPG, PNG et GIF sont également acceptés.

Pour obtenir un titre ou un texte alternatif plus précis, le catalogue généré peut être ajusté après sa création dans `data/portfolio.json`. Les images ne doivent pas dépasser environ 1800 px sur leur plus grand côté afin de préserver les performances de la galerie.
