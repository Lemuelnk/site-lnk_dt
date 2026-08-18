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
            projects.append({
                "category": category["id"],
                "title": title,
                "image": image,
                "alt": alt,
            })

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
    print(f"Generated {len(projects)} portfolio project(s).")


if __name__ == "__main__":
    main()
