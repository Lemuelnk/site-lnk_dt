#!/usr/bin/env python3
"""Génère data/news.json et js/news-catalog.js à partir des images de assets/images/news/.

Convention de nommage : news-{type}-{description}-{NN}.webp
  - type : promo, creation, quote, cta, event, autre (utilisé pour le badge)
  - description : libellé lisible du fichier
  - NN : numéro d'ordre de la publication

Métadonnées personnalisées (titre_fr/en, description_fr/en, link) placées dans
data/news.json sont préservées à chaque régénération. Les nouvelles images
reçoivent un titre et une description générés depuis le nom de fichier.
"""
import json
import os
import re
import unicodedata

REPO = os.path.dirname(os.path.abspath(__file__ + "/.."))
NEWS_DIR = os.path.join(REPO, "assets/images/news")
DATA_PATH = os.path.join(REPO, "data/news.json")
CATALOG_PATH = os.path.join(REPO, "js/news-catalog.js")

BADGE_LABELS = {
    "promo": {"fr": "Promotion", "en": "Promotion"},
    "creation": {"fr": "Nouvelle création", "en": "New creation"},
    "quote": {"fr": "Citation", "en": "Quote"},
    "cta": {"fr": "Appel à l'action", "en": "Call to action"},
    "event": {"fr": "Événement", "en": "Event"},
    "autre": {"fr": "Actualité", "en": "News"},
    "news": {"fr": "Actualité", "en": "News"},
}


def slugify(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return text.lower()


def build_items(existing):
    items = []
    if not os.path.isdir(NEWS_DIR):
        return items
    for filename in sorted(os.listdir(NEWS_DIR)):
        ext = os.path.splitext(filename)[1].lower()
        if ext not in (".webp", ".jpg", ".jpeg", ".png"):
            continue
        base = os.path.splitext(filename)[0]
        parts = [p for p in base.split("-") if p]
        kind = parts[0] if parts else "news"
        desc_parts = " ".join(parts[1:]).strip()
        label = BADGE_LABELS.get(kind, BADGE_LABELS["news"])
        default_title = desc_parts.replace("-", " ").strip().title() or "Publication"

        existing_item = existing.get(filename)
        item = {
            "file": f"assets/images/news/{filename}",
            "kind": kind,
            "badge": {"fr": existing_item["badge"]["fr"] if existing_item and existing_item.get("badge") else label["fr"],
                      "en": existing_item["badge"]["en"] if existing_item and existing_item.get("badge") else label["en"]},
            "title_fr": existing_item["title_fr"] if existing_item and existing_item.get("title_fr") else default_title,
            "title_en": existing_item["title_en"] if existing_item and existing_item.get("title_en") else default_title,
            "description_fr": existing_item.get("description_fr") if existing_item else None,
            "description_en": existing_item.get("description_en") if existing_item else None,
            "link": existing_item.get("link") if existing_item else None,
        }
        items.append(item)
    return items


def main():
    existing = {}
    if os.path.isfile(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            existing = {item["file"].split("/")[-1]: item for item in data.get("publications", [])}
        except (json.JSONDecodeError, KeyError):
            existing = {}

    items = build_items(existing)
    catalog = {"generated": True, "publications": items}
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        f.write("// Auto-généré par tools/generate-news-catalog.py — NE PAS ÉDITER MANUELLEMENT\n")
        f.write("window.LNK_NEWS_CATALOG = " + json.dumps(catalog, ensure_ascii=False) + ";\n")

    print(f"{len(items)} publication(s) dans le catalogue news.")


if __name__ == "__main__":
    main()
