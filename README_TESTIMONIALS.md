# Avis clients — système de publication

La section publique affiche 3 avis maximum sur la page principale, une note globale calculée, la répartition des étoiles, un bouton **Voir tous les avis** et un formulaire **Donner votre avis**.

## Cycle de publication

1. Le visiteur choisit une note et envoie son témoignage.
2. Cloudflare Turnstile protège le formulaire.
3. L'avis est enregistré dans D1 avec le statut `pending`.
4. Une notification e-mail peut être envoyée à l'administrateur si les variables d'Email Service sont configurées.
5. L'administrateur ouvre `/admin/reviews.html`, saisit son token et approuve ou refuse l'avis.
6. Seuls les avis `approved` sont publics et alimentent les statistiques.

## Configuration Cloudflare

Le dépôt contient `schema.sql` et `wrangler.jsonc.example`. Il faut créer une base D1, lier la base au projet Pages avec le binding `REVIEWS_DB`, puis appliquer le schéma. Cloudflare documente les bindings D1 pour Pages Functions.

Variables/secrets nécessaires côté Cloudflare :

- `REVIEWS_DB` : binding D1.
- `TURNSTILE_SECRET` : secret Turnstile côté serveur.
- `REVIEW_ADMIN_TOKEN` : secret utilisé pour protéger l'interface de modération.
- `CF_ACCOUNT_ID` : ID du compte Cloudflare si la notification e-mail REST est utilisée.
- `CF_EMAIL_API_TOKEN` : token Cloudflare autorisé à envoyer les e-mails.
- `REVIEW_FROM` : adresse d'envoi appartenant à un domaine onboardé dans Cloudflare Email Service.
- `REVIEW_ADMIN_EMAIL` : adresse qui reçoit les notifications.

Le site doit aussi recevoir la clé publique Turnstile dans l'attribut `data-turnstile-site-key` de la balise `<html>`. Ne jamais mettre le secret Turnstile ou le token administrateur dans le HTML.

Le fichier `data/testimonials.json` contient 5 avis de démonstration marqués `demo: true` et `status: approved`. Ils servent uniquement à prévisualiser l'affichage lorsque la base D1 ne contient encore aucun avis approuvé.
