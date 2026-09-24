#!/usr/bin/env python3
"""Generate portfolio metadata from assets/images/portfolio folders."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets/images/portfolio"
OUTPUT = ROOT / "data/portfolio.json"
JS_OUTPUT = ROOT / "js/portfolio-catalog.js"
INDEX_HTML = ROOT / "index.html"
HTML_START_MARKER = "<!-- PORTFOLIO:START"
HTML_END_MARKER = "<!-- PORTFOLIO:END -->"


def escape_html(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def render_static_portfolio_html(projects: list[dict], categories: list[dict]) -> str:
    """Server-rendered fallback so real portfolio content (titles, alt text,
    descriptions) is present in the raw HTML for screen readers, search
    engines and AI agents that don't execute JavaScript. The interactive
    JS (js/portfolio.js) replaces this markup on load for JS-enabled
    visitors, so this only needs to be readable, not interactive."""
    label_by_id = {c["id"]: c["label"] for c in categories}
    cards = []
    for project in projects:
        label = label_by_id.get(project["category"], project["category"])
        title = escape_html(project["title"])
        alt = escape_html(project.get("alt") or project["title"])
        desc = project.get("description_fr") or ""
        desc_html = f'<p class="portfolio-static-desc">{escape_html(desc)}</p>' if desc else ""
        cards.append(
            f'<article class="portfolio-card" data-category="{project["category"]}">'
            f'<a class="portfolio-card-button" href="{project["image"]}">'
            f'<div class="portfolio-visual"><img class="portfolio-image" src="{project["image"]}" '
            f'alt="{alt}" loading="lazy" width="800" height="800"></div>'
            f'<div class="portfolio-card-meta"><span>{escape_html(label)}</span><strong>{title}</strong></div>'
            f'</a>{desc_html}</article>'
        )
    return "".join(cards)


def inject_static_html(fragment: str) -> None:
    if not INDEX_HTML.exists():
        return
    html = INDEX_HTML.read_text(encoding="utf-8")
    start = html.find(HTML_START_MARKER)
    end = html.find(HTML_END_MARKER)
    if start == -1 or end == -1:
        print("WARNING: portfolio markers not found in index.html — skipping static HTML injection.")
        return
    start_tag_end = html.find("-->", start) + len("-->")
    new_html = html[:start_tag_end] + fragment + html[end:]
    INDEX_HTML.write_text(new_html, encoding="utf-8")

CATEGORIES = [
    {"id": "affiches", "label": "Affiches", "visual": "sample", "variant": "teal", "folder": "affiches"},
    {"id": "branding", "label": "Branding", "visual": "sample", "variant": "dark", "folder": "branding"},
    {"id": "bannieres", "label": "Bannières", "visual": "sample", "variant": "coral", "folder": "bannieres"},
    {"id": "social-media", "label": "Social Media", "visual": "sample", "variant": "light", "folder": "social-media"},
    {"id": "calendriers", "label": "Calendriers", "visual": "sample", "variant": "dark", "folder": "calendriers"},
    {"id": "plus", "label": "Et plus encore", "visual": "sample", "variant": "coral", "folder": "et-plus-encore"},
]
EXTENSIONS = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"}


def humanize(stem: str) -> str:
    words = re.sub(r"[_-]+", " ", stem).split()
    return " ".join(word.capitalize() for word in words)


def main() -> None:
    existing = json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.exists() else {}
    previous = {
        project.get("image"): project
        for project in existing.get("projects", [])
        if project.get("image")
    }
    projects = []
    for category in CATEGORIES:
        folder = ASSETS / category["folder"]
        if not folder.is_dir():
            continue
        for path in sorted(folder.iterdir(), key=lambda item: item.name.lower()):
            if path.name.startswith(".") or path.suffix.lower() not in EXTENSIONS:
                continue
            image = f"assets/images/portfolio/{category['folder']}/{path.name}"
            old = previous.get(image, {})
            title = old.get("title") or humanize(path.stem)
            alt = old.get("alt") or f"Réalisation {category['label']} — {title}"
            project = {
                "category": category["id"],
                "title": title,
                "image": image,
                "alt": alt,
            }
            for desc_field in ("description_fr", "description_en"):
                if old.get(desc_field):
                    project[desc_field] = old[desc_field]
            projects.append(project)

    # Ajouter sampleImage / sampleAlt à chaque catégorie (première image du dossier)
    for category in CATEGORIES:
        cat_projects = [p for p in projects if p["category"] == category["id"]]
        category["sampleImage"] = cat_projects[0]["image"] if cat_projects else None
        category["sampleAlt"] = cat_projects[0]["alt"] if cat_projects else None
        category["projectCount"] = len(cat_projects)

    output = {
        "categories": CATEGORIES,
        "projects": projects,
        "_instructions": (
            "Les projets sont générés automatiquement depuis assets/images/portfolio. "
            "Pour un titre ou un texte alternatif personnalisé, conserver les métadonnées "
            "dans ce fichier ou utiliser le format recommandé dans le README du dossier."
        ),
    }
    serialized = json.dumps(output, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    JS_OUTPUT.write_text(
        "/* Generated from assets/images/portfolio — do not edit manually. */\n"
        f"window.LNK_PORTFOLIO_CATALOG = {serialized};\n",
        encoding="utf-8",
    )
    inject_static_html(render_static_portfolio_html(projects, CATEGORIES))
    print(f"Generated {len(projects)} portfolio project(s).")


if __name__ == "__main__":
    main()
