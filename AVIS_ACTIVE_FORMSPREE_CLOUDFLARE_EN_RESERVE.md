# Avis — Formspree actif / Cloudflare en réserve

Le flux actif des avis ne dépend plus de Cloudflare.

- Affichage : `data/testimonials.json`
- Envoi : `https://formspree.io/f/xljrbrnk`
- Identification : `form_type=testimonial`
- Turnstile : débranché du flux Avis
- API `/api/testimonials` : débranchée du flux Avis

L'ancienne implémentation Cloudflare est conservée dans `_legacy/cloudflare-reviews/` pour un éventuel retour ultérieur.

Les 5 avis fictifs approuvés restent présents.
La réception réelle Formspree reste à tester manuellement.
