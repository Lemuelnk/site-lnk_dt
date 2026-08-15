# SITE LNK_DT — VERSION FINALE PROVISOIRE

## État
Cette archive est la version de référence provisoire du site LNK Design Touch (`lnk_dt`).
Le design est considéré comme verrouillé à ce stade. Les éléments techniques encore en attente
doivent être traités sans modifier les sections déjà validées.

## Architecture active — Avis
- Formspree existant : `https://formspree.io/f/xljrbrnk`
- Le formulaire Avis est identifié par `form_type=testimonial`.
- Les avis de démonstration restent présents jusqu'à leur remplacement par de vrais avis approuvés.
- La publication des avis approuvés reste manuelle pour le moment.

## Configuration Cloudflare conservée
La configuration précédente liée aux avis n'a pas été supprimée.
Elle est conservée sous `_legacy/cloudflare-reviews/` afin de pouvoir y revenir.
Turnstile reste également conservé dans le projet ; sa configuration n'est pas considérée comme finalisée.

## Étapes restantes
1. Tester réellement l'envoi du formulaire Avis vers Formspree.
2. Vérifier la réception de la notification et le contenu des champs.
3. Vérifier la distinction `form_type=testimonial` dans Formspree.
4. Décider et finaliser la méthode de publication des avis approuvés.
5. Ajouter manuellement les réalisations réelles du Portfolio.
6. Vérifier WhatsApp (+243998222431) sur tous les CTA concernés.
7. Vérifier le lien Google Business / Google Maps.
8. Vérifier tous les liens sociaux existants.
9. Vérifier les assets finaux (logos, favicon, apple touch icon, OG image, portfolio, photo fondateur).
10. Audit responsive final : mobile, tablette, desktop.
11. Audit des liens internes et externes.
12. Audit formulaires et erreurs réseau/console JavaScript.
13. Audit SEO final : title, meta description, canonical, robots, sitemap, Open Graph/Twitter et données structurées.
14. Vérifier les pages légales.
15. Après résolution des points jaunes/rouges, produire la checklist de lancement finale.

## Éléments volontairement non finalisés
- Turnstile Cloudflare.
- D1 / Worker / token d'administration des avis.
- Notifications Cloudflare pour les avis.

Ces éléments sont conservés à côté et ne doivent pas être supprimés sans décision explicite.
