# LNK Design Touch — Final Responsive Fix

## Scope
Correction of the regressions visible in the supplied mobile and desktop captures.

## Hero
- Restored the mobile hero as an independent responsive composition.
- Prevented each headline phrase from breaking word-by-word.
- Reduced the mobile visual footprint so the hero remains balanced.
- Preserved the desktop hero rules unchanged.
- Kept the logo asset slot, while making the text fallback render cleanly when the official logo file is absent.

## Services
- Corrected the interactive disclosure layout.
- Desktop: service number/title remain on the left and the active description occupies a dedicated right column.
- Mobile: active description stays in normal document flow directly below its service title.
- Removed the CSS/grid condition that was placing the description in a neighbouring grid column and causing overlaps.
- Kept the service rows as buttons/accordions; no decorative navigation arrows were added.
- Kept the Lubumbashi availability link and WhatsApp CTA.

## Icons
- Replaced the outlined question-mark SVG with a heavier filled typographic `?` inside the existing yellow circle.

## Accessibility
- Preserved button semantics, `aria-expanded`, `aria-controls`, focus-visible styling and reduced-motion handling.
