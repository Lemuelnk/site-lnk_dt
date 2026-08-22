# Guide de Gestion — LNK Design Touch

Ce guide vous explique comment gérer votre site en toute autonomie sans toucher au code.

## 1. Modifier les textes (No-Code)
Tous les textes principaux du site sont centralisés dans : `data/site-content.json`.

- **Pour changer un texte** : Ouvrez ce fichier, trouvez la section correspondante (ex: `hero`, `about`, `founder`) et modifiez la valeur pour `fr` (Français) ou `en` (Anglais).
- **Validation** : Une fois le fichier enregistré et poussé sur GitHub, le site se met à jour automatiquement.

## 2. Gérer le Portfolio & Vidéos
Le portfolio est généré automatiquement à partir du dossier `assets/images/portfolio/`.

### Ajouter un projet
1. Glissez votre image ou vidéo dans le dossier de la catégorie correspondante (ex: `branding/`, `affiches/`).
2. **Extensions acceptées** : `.jpg`, `.png`, `.webp`, `.mp4`, `.webm`, `.mov`.
3. **Vidéo** : Le site détecte automatiquement les vidéos et ajoute un badge "Play".
4. **Miniature Vidéo (Optionnel)** : Si vous voulez une image précise pour la miniature d'une vidéo, nommez-la `nom-de-la-video.thumb.webp`.

## 3. Créer une Étude de Cas
Pour qu'un projet du portfolio devienne une étude de cas détaillée :

1. Ouvrez `data/case-studies.json`.
2. Ajoutez un nouveau bloc avec l'ID du projet (le nom du fichier sans extension).
3. Remplissez les champs `challenge`, `solution`, `client`, etc.
4. Un bouton **"Découvrir le projet"** apparaîtra automatiquement dans la visionneuse du site.

## 4. Sauvegardes & Données
- **Sauvegarde D1** : Une copie de votre base de données est créée automatiquement chaque dimanche dans le dossier `backups/`.
- **Newsletter** : Les inscrits sont stockés dans la table `newsletter_subscribers` de votre base Cloudflare D1.
- **Avis** : Modérez les avis directement depuis votre panneau admin habituel.

---
*LNK Design Touch — Nous donnons vie à vos projets.*
