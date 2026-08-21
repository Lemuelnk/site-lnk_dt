from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / 'js'
CSS = ROOT / 'css'

js_order = ['navigation.js', 'hero-motion.js', 'services.js', 'portfolio-catalog.js', 'portfolio.js', 'testimonials.js', 'contact.js', 'news-catalog.js', 'announcement.js', 'footer.js', 'admin-gate.js', 'visual-upgrades.js']
css_order = ['styles.css', 'services.css', 'portfolio.css', 'testimonials.css', 'contact.css', 'announcements.css', 'footer.css', 'step5.css', 'hero-motion.css', 'responsive-9a.css', 'hero-mobile-fix.css', 'index-extras.css', 'visual-upgrades.css']

def bundle(source_dir, names, base_name, label):
    chunks = []
    for name in names:
        path = source_dir / name
        if path.exists():
            chunks.append(f'/* ===== {source_dir.name}/{name} ===== */\n{path.read_text(encoding="utf-8").strip()}\n')
        else:
            print(f'  (averti: {source_dir.name}/{name} introuvable, ignoré)')
    content = '\n'.join(chunks).rstrip() + '\n'
    digest = hashlib.sha256(content.encode('utf-8')).hexdigest()[:10]
    ext = 'css' if label == 'CSS' else 'js'
    target = source_dir / f'{base_name}.{digest}.{ext}'
    target.write_text(content, encoding='utf-8')
    print(f'{label}: {target.name} ({len(chunks)} modules, hash {digest})')
    return target.name

js_file = bundle(JS, js_order, 'site.bundle', 'JavaScript')
css_file = bundle(CSS, css_order, 'site.bundle', 'CSS')

# Bundles secondaires : brand (brand.html) et legal (pages légales)
secondary = [
    ('css/brand.bundle.css', 'css/brand.bundle', ['brand.html']),
    ('css/legal.bundle.css', 'css/legal.bundle', ['mentions-legales.html', 'politique-confidentialite.html', 'mentions-legales-en.html', 'politique-confidentialite-en.html']),
    ('css/admin-reviews.css', 'css/admin-reviews', ['admin-reviews.html']),
]
for source_rel, target_stem, htmls in secondary:
    path = ROOT / source_rel
    if not path.exists():
        continue
    content = path.read_text(encoding='utf-8')
    h = hashlib.sha256(content.encode('utf-8')).hexdigest()[:10]
    target_name = f'{target_stem}.{h}.css'
    (ROOT / target_name).write_text(content, encoding='utf-8')
    print(f'{path.name}: {target_name} (hash {h})')
    for html_name in htmls:
        html = ROOT / html_name
        if not html.exists():
            continue
        t = html.read_text(encoding='utf-8')
        # Normaliser les chemins cassés (doubles css/css/ introduits par une ancienne version)
        t = t.replace('css/css/', 'css/')
        # Remplacer toutes les références au fichier source par la cible fingerprintée
        t = re.sub(rf'{re.escape(target_stem)}\.[a-f0-9]+\.css(\?v=[a-f0-9]+)?', target_name, t)
        t = re.sub(rf'(css/)?{re.escape(path.name)}(\?v=[a-f0-9]+)?', target_name, t)
        html.write_text(t, encoding='utf-8')

# Mettre à jour les références dans tous les fichiers HTML à la racine
# Ancien pattern : js/site.bundle.js?v=<commit-hash>  ->  js/site.bundle.<digest>.js?v=<digest>
for html in ROOT.glob('*.html'):
    text = html.read_text(encoding='utf-8')
    js_digest = re.match(r'site\.bundle\.([a-z0-9]+)\.js$', js_file).group(1)
    css_digest = re.match(r'site\.bundle\.([a-z0-9]+)\.css$', css_file).group(1)
    new = re.sub(r'js/site\.bundle\.[a-z0-9]+\.js\?v=[a-z0-9]+', f'js/{js_file}?v={js_digest}', text)
    new = re.sub(r'css/site\.bundle\.[a-z0-9]+\.css\?v=[a-z0-9]+', f'css/{css_file}?v={css_digest}', new)
    # Fallback : références non fingerprintées (y compris versions cassées comme ?v=bundle)
    new = re.sub(r'js/site\.bundle\.js\?v=[a-z0-9]+', f'js/{js_file}?v={js_digest}', new)
    new = re.sub(r'css/site\.bundle\.css\?v=[a-z0-9]+', f'css/{css_file}?v={css_digest}', new)
    if new != text:
        html.write_text(new, encoding='utf-8')
        print(f'HTML mis à jour: {html.name}')
