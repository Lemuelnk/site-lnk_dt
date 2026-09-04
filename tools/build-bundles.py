from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / 'js'
CSS = ROOT / 'css'

# Keep source modules separate and compose only a small global bundle plus
# page-specific bundles. This gives the browser fewer, purpose-built assets
# without sacrificing maintainability in source.
JS_CORE = [
    'vendor/lucide.min.js',
    'navigation.js',
    'language-switcher.js',
    'announcement.js',
    'footer.js',
]
JS_HOME = [
    'hero-motion.js',
    'services.js',
    'portfolio-catalog.js',
    'portfolio.js',
    'testimonials.js',
    'contact.js',
    'visual-upgrades.js',
]

CSS_CORE = [
    'styles.css',
    'icons.css',
    'lucide-overrides.css',
    'footer.css',
    'responsive-9a.css',
    'accessibility.css',
    'language-switcher.css',
]
CSS_HOME = [
    'services.css',
    'portfolio.css',
    'testimonials.css',
    'contact.css',
    'announcements.css',
    'step5.css',
    'hero-motion.css',
    'hero-mobile-fix.css',
    'index-extras.css',
    'visual-upgrades.css',
]


def build_stable_bundle(source_dir, names, filename, label):
    chunks = []
    for name in names:
        path = source_dir / name
        if path.exists():
            chunks.append(
                f'/* ===== {source_dir.name}/{name} ===== */\n'
                f'{path.read_text(encoding="utf-8").strip()}\n'
            )
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
    for pattern in ('site.bundle.*.js', 'home.bundle.*.js'):
        for path in JS.glob(pattern):
            path.unlink()
            removed += 1
    for pattern in (
        'site.bundle.*.css',
        'home.bundle.*.css',
        'brand.bundle.*.css',
        'legal.bundle.*.css',
        'admin-reviews.*.css',
    ):
        for path in CSS.glob(pattern):
            path.unlink()
            removed += 1
    print(f'Nettoyage: {removed} anciens bundles générés supprimés.')


def normalize_language_switchers(html_text):
    """Replace duplicated language control markup with one shared mount point."""
    pattern = re.compile(
        r'<div class="language-switcher"[^>]*>\s*'
        r'<button[^>]*class="language-option[^>]*>FR</button>\s*'
        r'<span[^>]*>\|</span>\s*'
        r'<button[^>]*class="language-option[^>]*>EN</button>\s*'
        r'</div>',
        flags=re.IGNORECASE | re.DOTALL,
    )
    return pattern.sub('<div class="language-switcher" data-lnk-language></div>', html_text)


def ensure_home_assets(html_text, css_digest, js_digest):
    """Add home assets without ever corrupting preload/stylesheet markup."""
    text = html_text
    home_css_digest = hashlib.sha256((CSS / 'home.bundle.css').read_bytes()).hexdigest()[:10]

    text = re.sub(
        r'<link rel="preload" href="css/site\.bundle\.css\?v=[a-z0-9]+\s*\n<link rel="stylesheet" href="css/home\.bundle\.css\?v=[a-z0-9]+">" as="style">',
        f'<link rel="preload" href="css/site.bundle.css?v={css_digest}" as="style">\n'
        f'<link rel="preload" href="css/home.bundle.css?v={home_css_digest}" as="style">',
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r'<link rel="stylesheet" href="css/site\.bundle\.css(?:\?v=[a-z0-9]+)?">',
        f'<link rel="stylesheet" href="css/site.bundle.css?v={css_digest}">',
        text,
        count=1,
    )

    home_stylesheet = re.compile(
        r'<link rel="stylesheet" href="css/home\.bundle\.css(?:\?v=[a-z0-9]+)?">',
        flags=re.IGNORECASE,
    )
    if not home_stylesheet.search(text):
        marker = f'<link rel="stylesheet" href="css/site.bundle.css?v={css_digest}">'
        text = text.replace(
            marker,
            marker + f'\n<link rel="stylesheet" href="css/home.bundle.css?v={home_css_digest}">',
            1,
        )
    else:
        text = home_stylesheet.sub(
            f'<link rel="stylesheet" href="css/home.bundle.css?v={home_css_digest}">',
            text,
            count=1,
        )

    text = re.sub(r'\s*<script src="js/home\.bundle\.js(?:\?v=[a-z0-9]+)?" defer></script>', '', text)
    text = text.replace(
        '</body>',
        f'\n<script src="js/home.bundle.js?v={js_digest}" defer></script>\n</body>',
        1,
    )
    return text


js_core_digest = build_stable_bundle(JS, JS_CORE, 'site.bundle.js', 'JavaScript core')
js_home_digest = build_stable_bundle(JS, JS_HOME, 'home.bundle.js', 'JavaScript home')
css_core_digest = build_stable_bundle(CSS, CSS_CORE, 'site.bundle.css', 'CSS core')
css_home_digest = build_stable_bundle(CSS, CSS_HOME, 'home.bundle.css', 'CSS home')
remove_obsolete_generated()

for html in ROOT.glob('*.html'):
    text = html.read_text(encoding='utf-8')
    new = text
    new = normalize_language_switchers(new)
    new = re.sub(
        r'js/site\.bundle(?:\.[a-z0-9]+)?\.js(?:\?v=[a-z0-9]+)?',
        f'js/site.bundle.js?v={js_core_digest}',
        new,
    )
    new = re.sub(
        r'css/site\.bundle(?:\.[a-z0-9]+)?\.css(?:\?v=[a-z0-9]+)?',
        f'css/site.bundle.css?v={css_core_digest}',
        new,
    )
    new = re.sub(
        r'js/home\.bundle(?:\.[a-z0-9]+)?\.js(?:\?v=[a-z0-9]+)?',
        f'js/home.bundle.js?v={js_home_digest}',
        new,
    )
    new = re.sub(
        r'css/home\.bundle(?:\.[a-z0-9]+)?\.css(?:\?v=[a-z0-9]+)?',
        f'css/home.bundle.css?v={css_home_digest}',
        new,
    )

    if html.name == 'index.html':
        new = ensure_home_assets(new, css_core_digest, js_home_digest)

    new = re.sub(r'css/brand\.bundle\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/brand.bundle.css', new)
    new = re.sub(r'css/legal\.bundle\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/legal.bundle.css', new)
    new = re.sub(r'css/admin-reviews\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/admin-reviews.css', new)

    if new != text:
        html.write_text(new, encoding='utf-8')
        print(f'HTML mis à jour: {html.name}')
