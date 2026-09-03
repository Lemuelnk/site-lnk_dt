from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / 'js'
CSS = ROOT / 'css'

js_order = ['vendor/lucide.min.js', 'navigation.js', 'hero-motion.js', 'services.js', 'portfolio-catalog.js', 'portfolio.js', 'testimonials.js', 'contact.js', 'announcement.js', 'footer.js', 'visual-upgrades.js']
css_order = ['styles.css', 'icons.css', 'lucide-overrides.css', 'services.css', 'portfolio.css', 'testimonials.css', 'contact.css', 'announcements.css', 'footer.css', 'step5.css', 'hero-motion.css', 'responsive-9a.css', 'hero-mobile-fix.css', 'index-extras.css', 'visual-upgrades.css']


def build_stable_bundle(source_dir, names, filename, label):
    chunks = []
    for name in names:
        path = source_dir / name
        if path.exists():
            chunks.append(f'/* ===== {source_dir.name}/{name} ===== */\n{path.read_text(encoding="utf-8").strip()}\n')
        else:
            print(f'  (averti: {source_dir.name}/{name} introuvable, ignoré)')
    content = '\n'.join(chunks).rstrip() + '\n'
    target = source_dir / filename
    target.write_text(content, encoding='utf-8')
    digest = hashlib.sha256(content.encode('utf-8')).hexdigest()[:10]
    print(f'{label}: {target.name} ({len(chunks)} modules, version {digest})')
    return digest


def remove_obsolete_generated():
    removed = 0
    for pattern in ('site.bundle.*.js',):
        for path in JS.glob(pattern):
            path.unlink()
            removed += 1
    for pattern in ('site.bundle.*.css', 'brand.bundle.*.css', 'legal.bundle.*.css', 'admin-reviews.*.css'):
        for path in CSS.glob(pattern):
            path.unlink()
            removed += 1
    print(f'Nettoyage: {removed} anciens bundles générés supprimés.')


js_digest = build_stable_bundle(JS, js_order, 'site.bundle.js', 'JavaScript')
css_digest = build_stable_bundle(CSS, css_order, 'site.bundle.css', 'CSS')
remove_obsolete_generated()

for html in ROOT.glob('*.html'):
    text = html.read_text(encoding='utf-8')
    new = text
    new = re.sub(r'js/site\.bundle(?:\.[a-z0-9]+)?\.js(?:\?v=[a-z0-9]+)?', f'js/site.bundle.js?v={js_digest}', new)
    new = re.sub(r'css/site\.bundle(?:\.[a-z0-9]+)?\.css(?:\?v=[a-z0-9]+)?', f'css/site.bundle.css?v={css_digest}', new)
    new = re.sub(r'css/brand\.bundle\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/brand.bundle.css', new)
    new = re.sub(r'css/legal\.bundle\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/legal.bundle.css', new)
    new = re.sub(r'css/admin-reviews\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/admin-reviews.css', new)
    if new != text:
        html.write_text(new, encoding='utf-8')
        print(f'HTML mis à jour: {html.name}')
