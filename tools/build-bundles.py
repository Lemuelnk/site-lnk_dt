from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / 'js'
CSS = ROOT / 'css'

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


def normalize_preference_controls(html_text, is_home):
    """Expose preference controls only on the homepage; secondary pages consume state."""
    text = html_text
    if is_home:
        text = re.sub(
            r'<div class="header-controls"(?![^>]*data-lnk-preferences)',
            '<div class="header-controls" data-lnk-preferences',
            text,
            count=1,
            flags=re.IGNORECASE,
        )
        return text

    text = re.sub(
        r'\s*<div class="language-switcher"[^>]*>.*?</div>',
        '',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    text = re.sub(
        r'\s*<button[^>]*id=["\']theme-toggle["\'][^>]*>.*?</button>',
        '',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    return text


def remove_legacy_home_language_style(html_text):
    return re.sub(
        r'\s*<style\s+id=["\']lnk-language-style["\'][^>]*>.*?</style>',
        '',
        html_text,
        flags=re.IGNORECASE | re.DOTALL,
    )


def remove_legacy_home_preference_scripts(html_text):
    """Remove inline homepage language/theme controllers now owned by global JS."""
    text = re.sub(
        r'\s*<script[^>]*>\s*.*?closest\(\s*["\']\.language-option["\']\s*\).*?</script>',
        '',
        html_text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    text = re.sub(
        r'\s*<script[^>]*>\s*\(function\(\)\s*\{\s*const savedTheme\s*=.*?document\.documentElement\.setAttribute\(\s*["\']data-theme["\'].*?</script>',
        '',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    text = re.sub(
        r'\s*<script[^>]*>\s*\(function\(\)\s*\{\s*document\.documentElement\.setAttribute\(\s*["\']data-theme["\']\s*,\s*["\']light["\']\s*\)\s*;?\s*\}\)\(\)\s*;?\s*</script>',
        '',
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    return text


def remove_inline_fab_styles(html_text):
    """Remove page-local WhatsApp FAB CSS; geometry and behavior are canonical in lucide-overrides.css."""
    pattern = re.compile(
        r'\s*<style[^>]*>.*?\.lnk-wa-fab\s*\{.*?</style>',
        flags=re.IGNORECASE | re.DOTALL,
    )
    cleaned = pattern.sub(lambda match: _strip_fab_rules_from_style(match.group(0)), html_text)
    return cleaned


def _strip_fab_rules_from_style(style_block):
    """Strip only FAB-related rules from a style block while preserving unrelated page CSS."""
    body_match = re.match(r'(\s*<style[^>]*>)(.*?)(</style>\s*)$', style_block, flags=re.IGNORECASE | re.DOTALL)
    if not body_match:
        return style_block
    prefix, body, suffix = body_match.groups()

    # Remove contiguous FAB declarations, hover/icon/pulse rules, media overrides and keyframes.
    rules = re.compile(
        r'\s*(?:[^{}]*\.)?lnk-wa-fab[^{}]*\{[^{}]*\}\s*'
        r'|\s*\.lnk-wa-pulse\s*\{[^{}]*\}\s*'
        r'|\s*@keyframes\s+lnk-wa-pulse\s*\{[^{}]*\}\s*',
        flags=re.IGNORECASE | re.DOTALL,
    )
    cleaned = rules.sub('\n', body)

    # Remove empty media blocks left after deleting only their FAB rule.
    cleaned = re.sub(r'\s*@media\s*\([^{}]+\)\s*\{\s*\}', '', cleaned, flags=re.IGNORECASE)
    if not cleaned.strip():
        return ''
    return prefix + cleaned.rstrip() + '\n' + suffix


def ensure_core_assets(html_text, css_digest, js_digest):
    """Make the global state/theme controllers available on every root HTML page."""
    text = html_text
    text = re.sub(
        r'<link rel="stylesheet" href="css/site\.bundle\.css(?:\?v=[a-z0-9]+)?">',
        f'<link rel="stylesheet" href="css/site.bundle.css?v={css_digest}">',
        text,
        count=1,
        flags=re.IGNORECASE,
    )
    if not re.search(r'<link rel="stylesheet" href="css/site\.bundle\.css(?:\?v=[a-z0-9]+)?">', text, re.IGNORECASE):
        text = text.replace('</head>', f'<link rel="stylesheet" href="css/site.bundle.css?v={css_digest}">\n</head>', 1)

    text = re.sub(
        r'\s*<script src="js/site\.bundle\.js(?:\?v=[a-z0-9]+)?"[^>]*></script>',
        '',
        text,
        flags=re.IGNORECASE,
    )
    text = text.replace(
        '</body>',
        f'\n<script src="js/site.bundle.js?v={js_digest}" defer></script>\n</body>',
        1,
    )
    return text


def ensure_home_assets(html_text, css_digest, js_digest):
    text = ensure_core_assets(html_text, css_digest, js_core_digest)
    home_css_digest = hashlib.sha256((CSS / 'home.bundle.css').read_bytes()).hexdigest()[:10]

    home_stylesheet = re.compile(
        r'<link rel="stylesheet" href="css/home\.bundle\.css(?:\?v=[a-z0-9]+)?">',
        flags=re.IGNORECASE,
    )
    if not home_stylesheet.search(text):
        marker = f'<link rel="stylesheet" href="css/site.bundle.css?v={css_digest}">'
        text = text.replace(marker, marker + f'\n<link rel="stylesheet" href="css/home.bundle.css?v={home_css_digest}">', 1)
    else:
        text = home_stylesheet.sub(f'<link rel="stylesheet" href="css/home.bundle.css?v={home_css_digest}">', text, count=1)

    text = re.sub(r'\s*<script src="js/home\.bundle\.js(?:\?v=[a-z0-9]+)?"[^>]*></script>', '', text, flags=re.IGNORECASE)
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
    new = normalize_preference_controls(new, html.name == 'index.html')
    if html.name == 'index.html':
        new = remove_legacy_home_preference_scripts(new)
    new = remove_legacy_home_language_style(new)
    new = remove_inline_fab_styles(new)
    new = re.sub(
        r'js/home\.bundle(?:\.[a-z0-9]+)?\.js(?:\?v=[a-z0-9]+)?',
        f'js/home.bundle.js?v={js_home_digest}',
        new,
        flags=re.IGNORECASE,
    )
    new = re.sub(
        r'css/home\.bundle(?:\.[a-z0-9]+)?\.css(?:\?v=[a-z0-9]+)?',
        f'css/home.bundle.css?v={css_home_digest}',
        new,
        flags=re.IGNORECASE,
    )

    if html.name == 'index.html':
        new = ensure_home_assets(new, css_core_digest, js_home_digest)
    else:
        new = ensure_core_assets(new, css_core_digest, js_core_digest)

    new = re.sub(r'css/brand\.bundle\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/brand.bundle.css', new, flags=re.IGNORECASE)
    new = re.sub(r'css/legal\.bundle\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/legal.bundle.css', new, flags=re.IGNORECASE)
    new = re.sub(r'css/admin-reviews\.[a-f0-9]+\.css(?:\?v=[a-f0-9]+)?', 'css/admin-reviews.css', new, flags=re.IGNORECASE)

    if new != text:
        html.write_text(new, encoding='utf-8')
        print(f'HTML mis à jour: {html.name}')
