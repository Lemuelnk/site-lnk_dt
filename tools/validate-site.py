from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob('*.html'))

errors = []
refs = []

for html in HTML_FILES:
    text = html.read_text(encoding='utf-8')
    for pattern in (r'href=["\']([^"\'#?]+)', r'src=["\']([^"\'#?]+)', r'url\(["\']?([^"\')?#]+)'):
        for ref in re.findall(pattern, text):
            if not ref or ref.startswith(('http://', 'https://', '//', 'mailto:', 'tel:', 'data:', 'javascript:')):
                continue
            if ref.startswith('/'):
                ref = ref.lstrip('/')
            target = (html.parent / ref).resolve()
            try:
                target.relative_to(ROOT.resolve())
            except ValueError:
                continue
            refs.append((html.name, ref))
            if not target.exists():
                errors.append(f'{html.name}: missing {ref}')

for html, ref in refs:
    if re.search(r'(?:site\.bundle|brand\.bundle|legal\.bundle|admin-reviews)\.[a-f0-9]{8,}\.(?:css|js)$', ref):
        target = ROOT / ref
        if not target.exists():
            errors.append(f'{html}: stale bundle reference {ref}')

for html in HTML_FILES:
    text = html.read_text(encoding='utf-8')
    if 'css/lucide-overrides.css' not in text:
        errors.append(f'{html.name}: missing css/lucide-overrides.css')

    # UI icons must not use legacy Bootstrap classes. Social-network marks are
    # allowed because they are brand marks rather than interface icons.
    for match in re.finditer(r'<div[^>]*class=["\'][^"\']*footer-social[^"\']*["\'][^>]*>(.*?)</div>', text, re.I | re.S):
        text = text.replace(match.group(0), '')
    if re.search(r'\bbi-(?:image|palette|phone|columns|calendar3|envelope-heart|play-circle|arrow|menu|x|check|chevron|clock|map-pin|briefcase|calculator)\b', text):
        errors.append(f'{html.name}: legacy Bootstrap UI icon reference detected')

for legacy in ('css/bootstrap-icons.css', 'css/fonts/bootstrap-icons.woff2'):
    if (ROOT / legacy).exists():
        errors.append(f'legacy runtime asset still present: {legacy}')

builder = ROOT / 'tools' / 'build-bundles.py'
if builder.exists() and 'admin-gate.js' in builder.read_text(encoding='utf-8'):
    errors.append('tools/build-bundles.py still references deleted admin-gate.js')

print(f'Checked {len(HTML_FILES)} HTML files and {len(refs)} local references.')
if errors:
    print('FAIL')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)
print('PASS')
