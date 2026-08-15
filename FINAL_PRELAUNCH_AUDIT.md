# LNK Design Touch — Audit pré-publication

Audit réalisé sur la version actuelle du site avant mise en production.

## P0 — À corriger avant publication

### 1. Ancres `#contact`, `#brief` et `#process`
- `index.html` contient un premier `<section id="contact" class="future">` puis la vraie section contact utilise à nouveau `id="contact"`.
- Les IDs HTML doivent être uniques. Le doublon peut faire pointer certains liens vers la mauvaise occurrence.
- Le bouton header `Parlons de votre projet` pointe actuellement vers `#brief`, qui est encore une section `future` vide.
- Le lien `Process` pointe vers `#process`, également encore une section `future` vide.

Action : supprimer les placeholders `future` devenus inutiles et faire pointer le CTA vers la vraie section formulaire.

### 2. Pages légales — feuille CSS erronée
`mentions-legales.html` et `politique-confidentialite.html` référencent `css/style.css`, alors que le dépôt contient `css/styles.css`.

Action : corriger le nom de la feuille CSS et tester les deux pages directement.

### 3. Logo / médias de marque
Les médias officiels ne sont pas encore présents. La nouvelle architecture d'assets est prête, mais les fichiers réels doivent être déposés avant publication.

Action : remplacer tous les `*.PLACE-FILE-HERE` par les médias officiels et vérifier la casse exacte des noms.

## P1 — Configuration nécessaire pour les formulaires

### 4. Project Brief — endpoint externe
Le formulaire utilise actuellement un endpoint Formspree : `https://formspree.io/f/xljrbrnk`.

Action : confirmer que cet endpoint appartient bien au compte LNK Design Touch et que les notifications arrivent à la bonne adresse. Si le formulaire doit être rattaché au domaine professionnel LNK et à Cloudflare, décider si Formspree reste la solution ou si le formulaire doit être migré vers une Function Cloudflare.

### 5. Pièce jointe
Le formulaire demande une limite de 10 Mo. Formspree documente les uploads de fichiers sur les offres Personal, Professional et Business ; la limite globale documentée est de 25 Mo par fichier, mais le quota du forfait doit être vérifié.

Action : confirmer le forfait Formspree et tester un vrai PDF/JPG/PNG ainsi qu'un fichier refusé par la limite.

### 6. `_next`
Le formulaire contient `_next=#contact`, mais le JavaScript intercepte la soumission avec `fetch()`. Dans ce mode, `_next` n'est pas le mécanisme de navigation utilisé.

Action : soit supprimer `_next`, soit décider explicitement d'utiliser la redirection native de Formspree au lieu du flux AJAX.

### 7. Email professionnel
Le site utilise encore `lnk_dt@yahoo.com` dans les contacts et pages légales.

Action : remplacer partout par l'adresse professionnelle définitive une fois Google Workspace configuré.

## P1 — Système d'avis clients

### 8. Turnstile n'est pas encore activé
`data-turnstile-site-key` est actuellement vide. Le JavaScript bloque volontairement l'envoi si aucune clé publique n'est configurée.

Action : créer le widget Turnstile, placer la site key publique dans le HTML et la secret key dans Cloudflare. La validation serveur existe déjà dans `functions/api/testimonials.js` et doit rester obligatoire.

### 9. D1 n'est pas encore relié
`wrangler.jsonc.example` contient `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

Action : créer la base D1, appliquer `schema.sql`, créer le binding `REVIEWS_DB` dans Cloudflare Pages et redéployer.

### 10. Modération admin
L'interface `/admin/reviews.html` existe et permet `Approuver` / `Refuser`, mais elle dépend de `REVIEW_ADMIN_TOKEN` côté serveur. Ce secret n'est pas encore configuré dans le dépôt d'exemple.

Action : créer le secret Cloudflare `REVIEW_ADMIN_TOKEN`, ne jamais le mettre dans le HTML ou le dépôt public, puis tester les deux actions.

### 11. Notifications de nouvel avis
Le code prévoit une notification via l'API d'envoi d'e-mails Cloudflare, mais nécessite :
- `CF_ACCOUNT_ID`
- `CF_EMAIL_API_TOKEN`
- `REVIEW_FROM`
- `REVIEW_ADMIN_EMAIL`

Action : configurer ces secrets/variables, vérifier le domaine d'envoi, puis effectuer un test réel : soumission → notification → prévisualisation → approbation → publication.

### 12. Avis de démonstration
Les 5 avis de démonstration sont volontairement affichés comme fallback lorsque D1 ne renvoie aucun avis approuvé.

Action avant publication : décider si ces 5 avis restent uniquement pour la prévisualisation locale ou s'ils doivent être retirés du site public dès que D1 est opérationnel. Ils ne doivent pas être présentés comme de vrais clients.

## P1 — Vérification fonctionnelle

### 13. Compteurs d'avis
La statistique globale est calculée à partir des avis approuvés côté D1. Le fallback démo recalcule aussi ses propres statistiques.

Action : tester la transition de 5 avis démo → premier vrai avis approuvé et vérifier que le nombre, la moyenne et la répartition changent automatiquement.

### 14. Fenêtre « Voir tous les avis »
Le bouton ouvre une `<dialog>` et affiche tous les avis approuvés.

Action : tester fermeture par bouton, clic extérieur, clavier/Escape et affichage sur petit écran.

## P2 — Autres points détectés

### 15. Liens sociaux
Les URLs sont structurellement présentes dans le footer, mais plusieurs plateformes refusent la vérification automatisée depuis l'environnement de travail.

Action : effectuer une vérification manuelle finale de chaque profil avant publication. Vérifier notamment que le profil Behance utilisé est bien celui destiné à LNK Design Touch.

### 16. Localisation
Le bouton « Notre adresse » utilise actuellement un lien Google Maps court/partagé.

Action : vérifier manuellement que ce lien ouvre bien l'emplacement professionnel voulu avant publication.

### 17. Portfolio / founder
Le site prévoit des emplacements pour les réalisations et la photo du fondateur, mais les médias officiels ne sont pas encore présents.

Action : ajouter les médias réels et vérifier les entrées de `data/portfolio.json`.

### 18. Métadonnées de partage
`og-image.jpg` est prévu mais absent.

Action : fournir une image Open Graph 1200×630 px et tester un aperçu de partage après déploiement.

### 19. Favicon / Apple Touch Icon
`favicon.svg` existe, mais les variantes PNG/ICO et l'Apple Touch Icon sont encore absentes.

Action : fournir les fichiers officiels et vérifier leur rendu sur navigateur et mobile.

## Séquence recommandée avant mise en ligne

1. Corriger les IDs/ancres et supprimer les placeholders `future`.
2. Corriger les pages légales.
3. Déposer tous les assets officiels.
4. Finaliser l'adresse e-mail professionnelle.
5. Décider et finaliser l'architecture d'envoi du Project Brief.
6. Configurer Turnstile + D1.
7. Configurer la modération et les notifications d'avis.
8. Tester le cycle complet d'un avis.
9. Tester le Project Brief avec et sans pièce jointe.
10. Vérifier tous les liens externes et sociaux.
11. Tester desktop/tablette/mobile.
12. Faire une dernière passe console/réseau après déploiement.
