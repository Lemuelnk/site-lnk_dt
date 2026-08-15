# PASS 1 — Structure & navigation

Date: 2026-08-15

## Applied
- Integrated the real `Process` section between Work and Founder.
- Loaded the existing `css/step5.css` stylesheet used by the Process design.
- Added the approved process flow around **CONCEPTION → MATÉRIALISATION** without changing previously validated sections.
- Removed the obsolete `#process`, `#contact`, and `#brief` placeholder sections.
- Removed the duplicate `id="contact"`.
- Changed the header CTA from `#brief` to the real `#contact` section.
- Moved the real Contact section inside `<main>` and placed it before Testimonials to match the validated section order.
- Normalized section numbering: 01 Positionnement, 02 Services, 03 Work, 04 Process, 05 Founder, 06 Contact, 07 Testimonials.
- Corrected the legal pages to load `css/styles.css` instead of the non-existent `css/style.css`.
- Verified internal hash links and duplicate IDs.

## Intentionally untouched
- Hero layout and motion.
- Positioning.
- Services.
- Portfolio.
- Founder visual structure.
- Contact visual/form design.
- Testimonials visual/system behavior.
- Footer visual structure.
- External integrations (Formspree, Cloudflare D1, Turnstile, email notification).
- Official logo/image files.

## Verification
- No duplicate HTML IDs detected.
- No broken internal hash anchors detected.
- Process stylesheet is loaded.
- Contact is inside `<main>`.
- Footer remains outside `<main>`.
- Section DOM order is coherent.
