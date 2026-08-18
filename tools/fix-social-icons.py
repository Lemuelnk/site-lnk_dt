#!/usr/bin/env python3
"""Repair the corrupted social icon replacement in index.html.

State after the broken run:
  <i class="bi bi-<a class="social-link" href="URL" ... data-platform="Platform">
          <span>Platform</span>
        </a>
The original SVG (which spans multiple lines) was replaced together with the text
after </svg> up to and including the closing </a>, swallowing the <a> element.

Strategy: match each corrupted block, extract the href + platform from the <a ...>,
then rewrite it as a clean block:
  <a class="social-link" href="URL" target="_blank" rel="noopener noreferrer"
     aria-label="Platform — LNK Design Touch" data-platform="Platform">
    <i class="bi bi-<platform-lower>" aria-hidden="true"></i>
    <span>Platform</span>
  </a>
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / "index.html"
html = PATH.read_text(encoding="utf-8")

pattern = re.compile(
    r'<i class="bi bi-<a class="social-link" href="([^"]+)" target="_blank" rel="noopener noreferrer"[\s\S]*?'
    r'data-platform="([^"]+)"[\s\S]*?\n[\s\S]*?aria-hidden="true"></i>\s*'
    r'<span>([^<]+)</span>\s*'
    r'</a>',
)

results = []
def repl(m):
    href, platform, span_text = m.groups()
    label = span_text
    results.append(platform)
    return (
        f'<a class="social-link" href="{href}" target="_blank" rel="noopener noreferrer"\n'
        f'           aria-label="{label} — LNK Design Touch" data-platform="{platform}">\n'
        f'          <i class="bi bi-{platform.lower()}" aria-hidden="true"></i>\n'
        f'          <span>{span_text}</span>\n'
        f'        </a>'
    )

html2, n = pattern.subn(repl, html)
assert n == 9, f"expected 9, got {n}: {results}"
PATH.write_text(html2, encoding="utf-8")
print(f"OK — {n} social blocks rewritten:")
for p in results:
    print("  -", p)
