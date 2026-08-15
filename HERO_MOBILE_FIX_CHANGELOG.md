# LNK Design Touch — Hero Mobile Fix

## Scope
This patch is intentionally limited to the header + Hero responsive behavior.

## Changes
- Fixed the broken-image icon when the real logo asset is not yet present.
- Preserved the existing logo fallback and made it responsive.
- Prevented header brand overflow on narrow screens.
- Added mobile Hero sizing based on viewport width with `clamp()`.
- Reduced the risk of title overflow at 320–380px widths.
- Made CTA blocks width-safe on small screens.
- Made the Hero visual composition responsive instead of relying on a single fixed mobile size.
- Kept the desktop Hero rules unchanged.
- Added dedicated safeguards for 340px and 380px breakpoints.
- Kept the existing asset-slot workflow: replacing `assets/images/brand/logo-primary-dark.svg` with the real asset will reveal the image automatically.

## Validation target
Responsive behavior should be checked at minimum at:
- 320px
- 340px
- 360px
- 375px
- 390px
- 412px
- 430px
- desktop 1280px+

## Important
The patch does not modify the content, messaging, colors, typography family, or overall art direction of the Hero.
