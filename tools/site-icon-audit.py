from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(ROOT.glob('*.html'))
errors = []

legacy_ui = re.compile(r'\bbi-(?:image|palette|phone|columns|calendar3|envelope-heart|play-circle|arrow|menu|x|check|chevron|clock|map-pin|briefcase|calculator)\b')
local_svg = re.compile(r'(?:src|href)=["\']([^"\']+\.svg)(?:[#?][^"\']*)?["\']', re.I)

for page in PAGES:
    text = page.read_text(encoding='utf-8')
    if page.name != 'brand.html' and 'css/lucide-overrides.css' not in text:
        errors.append(f'{page.name}: missing Lucide normalization stylesheet')

    # Bootstrap UI icon classes are forbidden. Social brand marks are now inline SVGs.
    social_patterns = [
        r'<div[^>]+class=["\'][^"\']*footer-social[^"\']*["\'][^>]*>.*?</div>',
        r'<div[^>]+class=["\'][^"\']*contact-social[^"\']*["\'][^>]*>.*?</div>'
    ]
    non_social = text
    for p in social_patterns:
        matches = re.findall(p, non_social, re.I | re.S)
        for m in matches:
            non_social = non_social.replace(m, '')
            
    if legacy_ui.search(non_social):
        errors.append(f'{page.name}: legacy Bootstrap UI icon class detected')

    for ref in local_svg.findall(text):
        if ref.startswith(('http://', 'https://', '//', 'data:')):
            continue
        path = ref.split('#', 1)[0].split('?', 1)[0]
        if path.startswith('/'):
            path = path[1:]
        target = ROOT / path
        if not target.exists():
            errors.append(f'{page.name}: missing SVG asset {path}')

print(f'Icon audit: {len(PAGES)} HTML pages scanned.')
if errors:
    print('FAIL')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)
print('PASS: no broken local SVG references or legacy UI icon classes found.')
