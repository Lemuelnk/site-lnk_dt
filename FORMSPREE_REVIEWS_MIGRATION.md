# LNK Design Touch — Avis → Formspree

## Active review submission
- Formspree endpoint: `https://formspree.io/f/xljrbrnk`
- This endpoint is the same Formspree account/flow already used by the Project Brief.
- The visual review UI is preserved.
- The 5 demonstration reviews remain part of the site until real approved reviews replace them.
- Approved/published reviews remain a site-managed dataset for now.

## Legacy Cloudflare configuration
The previous Cloudflare/D1 review implementation has NOT been deleted.
It is preserved under:
`_legacy/cloudflare-reviews/`

This includes the previous API/functions, admin review page, schema and configuration examples where present.

## Important
- Turnstile Site Key remains in the project as previously configured.
- No Turnstile Secret Key has been added to the ZIP.
- No Cloudflare review secret/token has been exposed.
- The legacy Cloudflare system is kept aside so it can be restored or reused later.

## Manual approval workflow
1. Visitor submits an opinion.
2. Formspree receives it and sends the configured notification.
3. LNK Design Touch reviews the submission.
4. Only approved testimonials are added to the published testimonial data.
