# Diagnostic Admin & Responsive - LNK Design Touch

## Problèmes identifiés
1. **Couleur Rose (Services)** : Confirmée dans `css/services.css` (`rgba(255,112,67,.07)`).
2. **Icône Invitation (Devis)** : Manquante dans le bouton CTA de `devis.html`.
3. **Conflit Mobile (FAB vs Tab Bar)** : Le bouton flottant WhatsApp chevauche la barre de navigation.
4. **Admin Design** :
   - **Couleurs** : Le badge `invitation` utilise toujours le rose `#E91E63`.
   - **Ergonomie** : Trop de boutons sur mobile, surcharge visuelle.
   - **Structure** : Le gestionnaire de promo prend trop de place verticale.
   - **Navigation** : Manque de fluidité entre les sections (Avis, Projets, Promos).

## Plan d'action
1. **Neutraliser le rose** : Utiliser `rgba(0,150,136,.06)` (Teal léger).
2. **Fixer le FAB** : Remonter de 80px sur mobile.
3. **Ajouter l'icône Devis** : Insérer `mail-heart` dans le CTA.
4. **Refonte Admin** :
   - Remplacer le rose par du Teal/Coral officiel.
   - Utiliser des icônes Lucide pour les actions (plus compact que le texte).
   - Regrouper les actions secondaires.
   - Améliorer le responsive des cartes de projets.
