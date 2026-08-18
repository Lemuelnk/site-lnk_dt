#!/usr/bin/env python3
"""Replace inline SVG social icons with Bootstrap Icons (<i class="bi bi-xxx">).

Usage: python3 tools/replace-social-icons.py
- Works on index.html in place.
- Each <a class="social-link" data-platform="X"> ... <svg ...>...</svg> ... </a>
  has its SVG replaced by <i class="bi bi-<lowercase-platform>" aria-hidden="true"></i>.
- The hamburger menu-toggle <span aria-hidden="true">Menu</span> text is replaced
  by <i class="bi bi-list" aria-hidden="true"></i> (keeps sr-only label).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / "index.html"

html = PATH.read_text(encoding="utf-8")

# 1) Social icons: match SVG inside an <a class="social-link"> block (SVGs may span lines)
def social_repl(m):
    platform = m.group(1)
    return f'<i class="bi bi-{platform.lower()}" aria-hidden="true"></i>'

html, n1 = re.subn(
    r'(<a class="social-link"[^>]*data-platform="([^"]+)"[^>]*>.*?)(<svg[\s\S]*?</svg>)(.*?</a>)',
    lambda m: m.group(1) + social_repl(m) + m.group(4),
    html,
    flags=re.S,
)
assert n1 == 9, f"expected 9 social SVGs, replaced {n1}"

# 2) Hamburger menu text icon
before = '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Ouvrir le menu"><span class="sr-only">Ouvrir le menu</span><span aria-hidden="true">Menu</span></button>'
after = '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Ouvrir le menu"><span class="sr-only">Ouvrir le menu</span><i class="bi bi-list" aria-hidden="true"></i></button>'
assert before in html, "hamburger button pattern not found"
html = html.replace(before, after)

PATH.write_text(html, encoding="utf-8")
print(f"OK — {n1} social SVGs replaced with Bootstrap Icons + hamburger icon bi-list")
