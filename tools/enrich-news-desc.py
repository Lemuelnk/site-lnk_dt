#!/usr/bin/env python3
"""Enrichit les titres et descriptions FR/EN des publications LNK_DT NEWS."""
import json

REPO = "/home/ubuntu/site-lnk_dt"
DATA_PATH = f"{REPO}/data/news.json"
CATALOG_PATH = f"{REPO}/js/news-catalog.js"

ENRICHMENTS = {
    "news-creation-affiche-01.webp": {
        "title_fr": "Création graphique",
        "title_en": "Graphic creation",
        "description_fr": "Réalisation visuelle pour un projet de communication.",
        "description_en": "Visual creation for a communication project.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-flyer-02.webp": {
        "title_fr": "Design de flyer",
        "title_en": "Flyer design",
        "description_fr": "Conception d'un support de communication imprimé.",
        "description_en": "Design of a printed communication material.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-affiche-03.webp": {
        "title_fr": "Affiche événementielle",
        "title_en": "Event poster",
        "description_fr": "Affiche pour un événement, claire et percutante.",
        "description_en": "Event poster, clear and impactful.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-affiche-04.webp": {
        "title_fr": "Affiche créative",
        "title_en": "Creative poster",
        "description_fr": "Composition visuelle originale pour une campagne.",
        "description_en": "Original visual composition for a campaign.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-flyer-05.webp": {
        "title_fr": "Flyer professionnel",
        "title_en": "Professional flyer",
        "description_fr": "Support de communication soigné et lisible.",
        "description_en": "Polished and readable communication material.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-affiche-06.webp": {
        "title_fr": "Création affiche",
        "title_en": "Poster creation",
        "description_fr": "Visuel percutant pour une communication efficace.",
        "description_en": "Impactful visual for effective communication.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-affiche-07.webp": {
        "title_fr": "Affiche sociale",
        "title_en": "Social poster",
        "description_fr": "Création pour les réseaux sociaux et événements.",
        "description_en": "Creation for social media and events.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-affiche-08.webp": {
        "title_fr": "Design graphique",
        "title_en": "Graphic design",
        "description_fr": "Mise en page professionnelle pour un projet visuel.",
        "description_en": "Professional layout for a visual project.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-affiche-09.webp": {
        "title_fr": "Composition visuelle",
        "title_en": "Visual composition",
        "description_fr": "Exploration créative avec les couleurs de la marque.",
        "description_en": "Creative exploration with brand colors.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-flyer-10.webp": {
        "title_fr": "Flyer événement",
        "title_en": "Event flyer",
        "description_fr": "Communication visuelle pour un événement spécial.",
        "description_en": "Visual communication for a special event.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-affiche-11.webp": {
        "title_fr": "Affiche promotionnelle",
        "title_en": "Promotional poster",
        "description_fr": "Support visuel pour une campagne de promotion.",
        "description_en": "Visual material for a promotional campaign.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-creation-affiche-12.webp": {
        "title_fr": "Création récente",
        "title_en": "Recent creation",
        "description_fr": "Dernière réalisation du studio LNK Design Touch.",
        "description_en": "Latest creation from LNK Design Touch studio.",
        "badge": {"fr": "Nouvelle création", "en": "New creation"},
    },
    "news-promo-brand-13.webp": {
        "title_fr": "LNK Brand",
        "title_en": "LNK Brand",
        "description_fr": "Identité visuelle LNK Design Touch en mouvement.",
        "description_en": "LNK Design Touch visual identity in motion.",
        "badge": {"fr": "Promotion", "en": "Promotion"},
    },
}


def main():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data["publications"]:
        filename = item["file"].split("/")[-1]
        if filename in ENRICHMENTS:
            enrich = ENRICHMENTS[filename]
            item["title_fr"] = enrich["title_fr"]
            item["title_en"] = enrich["title_en"]
            item["description_fr"] = enrich["description_fr"]
            item["description_en"] = enrich["description_en"]
            item["badge"] = enrich["badge"]
            if "link" not in item or not item["link"]:
                item["link"] = "https://www.instagram.com/lnkdt"

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Mettre à jour aussi le fichier JS
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        f.write(
            "// Auto-généré par tools/generate-news-catalog.py — NE PAS ÉDITER MANUELLEMENT\n"
        )
        f.write(
            "window.LNK_NEWS_CATALOG = "
            + json.dumps(data, ensure_ascii=False)
            + ";\n"
        )

    print("Descriptions enrichies pour", len(ENRICHMENTS), "publications.")


if __name__ == "__main__":
    main()
