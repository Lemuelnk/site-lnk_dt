from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / 'js'
CSS = ROOT / 'css'

js_order = ['navigation.js', 'hero-motion.js', 'services.js', 'portfolio-catalog.js', 'portfolio.js', 'testimonials.js', 'contact.js', 'footer.js']
css_order = ['styles.css', 'hero.css', 'services.css', 'portfolio.css', 'testimonials.css', 'contact.css', 'footer.css']

def bundle(source_dir, names, target, label):
    chunks = []
    for name in names:
        path = source_dir / name
        if path.exists():
            chunks.append(f'/* ===== {source_dir.name}/{name} ===== */\n{path.read_text(encoding="utf-8").strip()}\n')
    target.write_text('\n'.join(chunks).rstrip() + '\n', encoding='utf-8')
    print(f'{label}: {target.name} ({len(chunks)} modules)')

bundle(JS, js_order, JS / 'site.bundle.js', 'JavaScript')
bundle(CSS, css_order, CSS / 'site.bundle.css', 'CSS')
