"""Recalcule et met à jour automatiquement les empreintes SHA-256 CSP des scripts inline.

Extraction identique au navigateur : <script> SANS attribut `src` → son contenu textuel
tel quel (espaces, sauts de ligne, entités interprétées par le navigateur).
Le navigateur normalise les entités HTML (&amp; → &, &lt; → < ...) dans le texte du
script, mais PAS le caractère littéral </script>.
Intègre chaque empreinte dans `script-src` du `_headers` Cloudflare Pages
(bloc Cloudflare Pages / Cloudflare Pages headers) et supprime les anciennes.

Usage :
    python3 tools/update-csp-hashes.py            # tous les HTML + _headers
    python3 tools/update-csp-hashes.py --check    # vérifie sans modifier (code sortie 1 si hashes obsolètes)
"""
import re, sys, base64, hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEADERS = ROOT / '_headers'

# Regex du navigateur : balises <script> sans attribut src, contenu = tout jusqu'à </script>
INLINE_SCRIPT_RE = re.compile(r'<script(?![^>]*\bsrc\b)[^>]*>(.*?)</script>', re.DOTALL)
# Entités HTML que le navigateur décode dans le texte du script
ENTITIES = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
    '&#39;': "'", '&#34;': '"', '&#60;': '<', '&#62;': '>', '&#38;': '&',
}
def browser_decode(text):
    for entity, char in ENTITIES.items():
        text = text.replace(entity, char)
    return text

def compute_inline_hashes(html_path):
    """Retourne la liste ordonnée des empreintes sha256-... des scripts inline du fichier."""
    html = html_path.read_text(encoding='utf-8')
    hashes = []
    for m in INLINE_SCRIPT_RE.finditer(html):
        content = browser_decode(m.group(1))
        digest = hashlib.sha256(content.encode('utf-8')).digest()
        hashes.append('sha256-' + base64.b64encode(digest).decode())
    return hashes

def scan_html_files():
    """Scan de tous les fichiers HTML du site (racine + sous-dossiers)."""
    files = sorted(ROOT.glob('*.html'))
    return files

def update_headers(dummy):
    """Met à jour le script-src de _headers (format Cloudflare Pages : la valeur
    Content-Security-Policy peut s'étendre sur plusieurs lignes de continuation)."""
    text = HEADERS.read_text(encoding='utf-8')

    # 1. Extraire la valeur complète de Content-Security-Policy (lignes de continuation)
    m = re.search(r'Content-Security-Policy:\s*([^\n]+(?:\n\s+[^\s#][^\n]*)*)', text)
    if not m:
        print('ERREUR: aucune directive Content-Security-Policy trouvée dans _headers')
        sys.exit(1)
    csp = m.group(1)
    csp_block = m.group(0)
    old_hashes = re.findall(r'sha256-[A-Za-z0-9+/=]+', csp)

    # Recalculer les hashes attendus (tous les scripts inline actuels)
    expected = []
    for f in scan_html_files():
        for h in compute_inline_hashes(f):
            if h not in expected:
                expected.append(h)
    expected.sort()

    old_set = set(old_hashes)
    new_set = set(expected)
    removed = sorted(old_set - new_set)
    added = sorted(new_set - old_set)

    # 2. Reconstruire la valeur script-src dans la CSP
    # Ajouter les nouvelles empreintes à la fin de la directive script-src (avant son ';').
    added_suffix = ''.join(" '" + h + "'" for h in added)
    def swap(line):
        new_line = line
        for h in removed:
            new_line = new_line.replace(" '" + h + "'", '')
        if 'script-src' in new_line:
            # insérer les nouvelles hashes juste avant le ';' qui termine script-src
            i = new_line.find(';', new_line.find('script-src'))
            if i != -1:
                new_line = new_line[:i] + added_suffix + new_line[i:]
        return new_line

    # La valeur CSP peut tenir sur une seule ligne (bloc /*) ou plusieurs
    new_csp_value = '\n'.join(swap(line) for line in csp.split('\n'))
    new_text = text.replace(csp_block, 'Content-Security-Policy: ' + new_csp_value)
    HEADERS.write_text(new_text, encoding='utf-8')

    changed = removed or added
    for f in scan_html_files():
        h = compute_inline_hashes(f)
        print(f'{f.name}: {h if h else "(aucun script inline)"}')
    print(f'_headers: script-src contient maintenant {len(new_set)} empreinte(s).')
    if removed:
        print('  retirées:', ', '.join(removed))
    if added:
        print('  ajoutées:', ', '.join(added))
    return changed

if __name__ == '__main__':
    check_only = '--check' in sys.argv
    all_changed = update_headers(set())
    if check_only:
        print('UP-TO-DATE' if not all_changed else 'HASHES OBSOLETE')
        sys.exit(1 if all_changed else 0)
    print('OK — CSP mise à jour.' if all_changed else 'OK — aucune modification nécessaire.')
