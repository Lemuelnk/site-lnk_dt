# PASS 3 — Formulaires & système d'avis

## Corrections de code appliquées
- Vérification et nettoyage des CTA `#brief` afin qu'ils ciblent le vrai `#contact`.
- Vérification des doublons d'identifiant `#contact` ; les occurrences supplémentaires sont renommées pour éviter des ancres ambiguës.
- Vérification des CTA d'avis : suppression des flèches résiduelles lorsqu'elles étaient présentes.
- Vérification des champs du formulaire d'avis identifiables par leur `name` ; les champs critiques sont rendus obligatoires lorsqu'ils ne l'étaient pas déjà.
- Aucun secret Cloudflare, token Turnstile ou identifiant D1 n'a été inventé ou ajouté au code.

## Configuration externe restant à faire
1. Formspree : confirmer que l'endpoint appartient au compte LNK_DT et tester une soumission réelle.
2. Upload : tester un fichier autorisé, un fichier trop volumineux et un format refusé.
3. Turnstile : renseigner la site key publique et le secret côté Cloudflare.
4. D1 : créer/binder la base et appliquer `schema.sql`.
5. Avis : tester `pending -> notification -> admin -> approve/reject -> publication`.
6. Notification : configurer les variables d'envoi et tester la réception réelle.
7. Admin : configurer `REVIEW_ADMIN_TOKEN` côté secret, jamais dans le dépôt public.

## Important
Le code seul ne permet pas de confirmer qu'un endpoint externe, une base Cloudflare, une notification ou un compte Formspree est réellement opérationnel. Ces éléments nécessitent un test sur l'environnement déployé.
