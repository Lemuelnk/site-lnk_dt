#!/usr/bin/env python3
"""Normalize indentation of social blocks and restore original-case data-platform."""
import re
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8")

orig = {"instagram": "Instagram", "threads": "Threads", "facebook": "Facebook",
        "x": "X", "linkedin": "LinkedIn", "tiktok": "TikTok",
        "youtube": "YouTube", "pinterest": "Pinterest", "behance": "Behance"}

def block_repl(m):
    plat_lower = m.group(2).lower()
    return (f'        <a class="social-link" href="{m.group(1)}" target="_blank" rel="noopener noreferrer"\n'
            f'           aria-label="{orig[plat_lower]} — LNK Design Touch" data-platform="{orig[plat_lower]}">\n'
            f'          <i class="bi bi-{plat_lower}" aria-hidden="true"></i>\n'
            f'          <span>{orig[plat_lower]}</span>\n'
            f'        </a>')

pattern = re.compile(
    r'^<a class="social-link" href="([^"]+)" target="_blank" rel="noopener noreferrer"\n'
    r'           aria-label="[^"]+ — LNK Design Touch" data-platform="([^"]+)">\n'
    r'          <i class="bi bi-[a-z0-9-]+" aria-hidden="true"></i>\n'
    r'          <span>[^<]+</span>\n'
    r'        </a>',
    flags=re.M,
)

html2, n = pattern.subn(block_repl, html)
assert n == 9, f"expected 9, got {n}"
p.write_text(html2, encoding="utf-8")
print(f"OK — {n} social blocks normalized with original-case data-platform")
