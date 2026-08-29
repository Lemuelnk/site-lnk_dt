# LNK Design Touch — Staging QA

## Automated
- [ ] All local HTML/CSS/JS/image references resolve.
- [ ] No reference points to deleted `admin-gate.js`.
- [ ] No stale fingerprinted bundle reference points to a missing file.
- [ ] GitHub Actions validation is green.

## Manual runtime
- [ ] Homepage renders without console errors.
- [ ] Header and mobile navigation work.
- [ ] Hero renders correctly at desktop and mobile widths.
- [ ] Services section renders correctly.
- [ ] Portfolio filters/lightbox work.
- [ ] MTJ case study opens and renders correctly.
- [ ] FR/EN switching works.
- [ ] Contact form validation and Turnstile flow work.
- [ ] Devis wizard advances, goes back, preserves values, and submits correctly.
- [ ] Mobile tab bar and swipe-to-close behavior work.
- [ ] Reduced-motion behavior remains accessible.
- [ ] WhatsApp/contact links work.

## Deployment
- [ ] Staging serves the expected commit.
- [ ] No stale Cloudflare cache is serving an older HTML/bundle pair.
- [ ] HTTPS/CSP produce no blocking browser errors.
- [ ] Production domain is not used as the staging origin.
