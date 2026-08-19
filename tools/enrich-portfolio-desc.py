#!/usr/bin/env python3
"""Add custom FR/EN descriptions to newly added portfolio projects."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data/portfolio.json"
JS_OUTPUT = ROOT / "js/portfolio-catalog.js"

# Custom descriptions for new projects
CUSTOM = {
    # Affiches
    "assets/images/portfolio/affiches/affiche-carwash-yesu-ni-jibu-16x9-01.webp": {
        "title": "CarWash — Yesu ni Jibu (16:9)",
        "alt": "Affiche publicitaire CarWash Yesu ni Jibu, voiture rouge avec éclaboussures d'eau, services de nettoyage",
        "description_fr": "Affiche promotionnelle pour le CarWash Yesu ni Jibu. Visuel dynamique avec une voiture rouge, éclaboussures d'eau et palette bleue intense, listant les services de nettoyage proposés.",
        "description_en": "Promotional poster for CarWash Yesu ni Jibu. A dynamic visual featuring a red car, water splashes and an intense blue palette, listing the cleaning services offered.",
    },
    "assets/images/portfolio/affiches/affiche-carwash-yesu-ni-jibu-carre-02.webp": {
        "title": "CarWash — Yesu ni Jibu (carré)",
        "alt": "Affiche carrée CarWash Yesu ni Jibu, pneu et voiture sous l'eau, services de nettoyage détaillés",
        "description_fr": "Version carrée de l'affiche CarWash Yesu ni Jibu, pensée pour les réseaux sociaux. Gros plan sur le pneu et l'éclaboussure, avec les services de nettoyage clairement listés.",
        "description_en": "Square version of the CarWash Yesu ni Jibu poster, designed for social media. Close-up on the tire and water splash, with cleaning services clearly listed.",
    },
    "assets/images/portfolio/affiches/affiche-tefilla-2024-21-matins-et-nuits-de-priere-03.webp": {
        "title": "Tefilla 2024 — 21 Matins et Nuits de Prière",
        "alt": "Affiche Tefilla 2024 du Centre Évangélique et Apostolique Bethel, portraits des orateurs, 21 jours de prière",
        "description_fr": "Affiche pour Tefilla 2024 — 21 Matins et Nuits de Prière du Centre Évangélique et Apostolique Bethel. Composition riche en portraits des orateurs avec une palette dorée et orange chaleureuse.",
        "description_en": "Poster for Tefilla 2024 — 21 Mornings and Nights of Prayer at the Centre Évangélique et Apostolique Bethel. A composition rich in speaker portraits with a warm golden and orange palette.",
    },
    "assets/images/portfolio/affiches/affiche-action-evangelique-5-jours-edition-3-04.webp": {
        "title": "Action Évangélique — 5 Jours (Édition 3)",
        "alt": "Affiche Action Évangélique 5 jours, Église Évangélique Source d'Eaux Vives, portraits des jeunes, thème la sanctification",
        "description_fr": "Affiche pour l'Action Évangélique — 5 Jours, Édition 3, organisée par le Département de la Jeunesse de l'Église Évangélique Source d'Eaux Vives. Portraits des jeunes participants sur fond de mur de pierre.",
        "description_en": "Poster for the Action Évangélique — 5 Days, Edition 3, organized by the Youth Department of the Église Évangélique Source d'Eaux Vives. Portraits of young participants against a stone wall background.",
    },
    "assets/images/portfolio/affiches/affiche-pentecote-2025-centre-evangelique-bethel-05.webp": {
        "title": "Pentecôte 2025 — Centre Évangélique Bethel",
        "alt": "Affiche Pentecôte 2025, Patriarche Balthazar et Sentinelle Mike, prière de renforcement des capacités",
        "description_fr": "Affiche pour Pentecôte 2025 du Centre Évangélique et Apostolique Bethel. Visuel lumineux avec les portraits du Patriarche Balthazar et de Sentinelle Mike, thème « Une prière de renforcement des capacités ».",
        "description_en": "Poster for Pentecost 2025 at the Centre Évangélique et Apostolique Bethel. A luminous visual featuring Patriarch Balthazar and Sentinel Mike, themed « A prayer for capacity building ».",
    },
    "assets/images/portfolio/affiches/affiche-eglise-peniel-concert-dg-emmanuel-malaika-06.webp": {
        "title": "Concert Live — D.G. Emanuel Malaika",
        "alt": "Affiche concert live D.G. Emanuel Malaika à l'Église Peniel, 14 décembre 2024",
        "description_fr": "Affiche pour le concert live de D.G. Emanuel Malaika à l'Église Peniel, le 14 décembre 2024. Portrait central sur fond doré rayonnant avec bandeau rouge « En concert live ».",
        "description_en": "Poster for the live concert of D.G. Emanuel Malaika at the Église Peniel, December 14, 2024. Central portrait on a radiant golden background with a red banner « En concert live ».",
    },
    # Logos
    "assets/images/portfolio/branding/logo-ejc-cep-paroisse-sinai-01.webp": {
        "title": "Logo EJC/CEP — Paroisse Sinaï",
        "alt": "Logo circulaire EJC/CEP Paroisse Sinaï avec montagne, croix, colombe et livre ouvert",
        "description_fr": "Logo pour la Paroisse Sinaï (EJC/CEP). Design circulaire combinant montagne, croix, colombe en vol, rayon de soleil et livre ouvert, traduisant foi, espérance et révélation.",
        "description_en": "Logo for the Sinaï Parish (EJC/CEP). A circular design combining a mountain, cross, flying dove, sun ray and open book, conveying faith, hope and revelation.",
    },
    "assets/images/portfolio/branding/logo-beston-business-habillement-02.webp": {
        "title": "Logo Beston Business — Habillement et Divers",
        "alt": "Logo Beston Business avec cintre bleu, chaussures noires et monogramme BB",
        "description_fr": "Logo pour Beston Business — Habillement et Divers. Emblème en forme de cintre bleu royal avec silhouette de chaussures, monogramme BB stylisé et base arrondie, évoquant l'élégance et le commerce textile.",
        "description_en": "Logo for Beston Business — Clothing and Various. A royal blue hanger-shaped emblem with shoe silhouettes, a stylized BB monogram and a rounded base, evoking elegance and textile commerce.",
    },
    "assets/images/portfolio/branding/logo-eepdp-eglise-evangelique-puissance-de-la-priere-03.webp": {
        "title": "Logo E.E.P.D.P. — Église Évangélique Puissance de la Prière",
        "alt": "Logo noir E.E.P.D.P. avec globe, croix, colombe, flamme et mains en prière",
        "description_fr": "Logo pour l'Église Évangélique Puissance de la Prière (E.E.P.D.P.). Design monochrome noir avec globe, croix, colombe du Saint-Esprit, flamme et mains jointes en prière, entouré de la référence Actes 12:5.",
        "description_en": "Logo for the Église Évangélique Puissance de la Prière (E.E.P.D.P.). A black monochrome design with a globe, cross, Holy Spirit dove, flame and praying hands, surrounded by the reference Acts 12:5.",
    },
    "assets/images/portfolio/branding/logo-kot-style-04.webp": {
        "title": "Logo KOT Style",
        "alt": "Logo KOT Style monogramme circulaire blanc sur fond noir",
        "description_fr": "Logo pour KOT Style. Monogramme circulaire en blanc sur fond noir, avec les lettres K, O et T stylisées en colonnes verticales géométriques, évoquant force et modernité.",
        "description_en": "Logo for KOT Style. A circular white monogram on a black background, with the letters K, O and T stylized as geometric vertical columns, evoking strength and modernity.",
    },
}

data = json.loads(OUTPUT.read_text(encoding="utf-8"))
updated = 0
for project in data["projects"]:
    img = project.get("image")
    if img in CUSTOM:
        c = CUSTOM[img]
        if "title" in c:
            project["title"] = c["title"]
        if "alt" in c:
            project["alt"] = c["alt"]
        if "description_fr" in c:
            project["description_fr"] = c["description_fr"]
        if "description_en" in c:
            project["description_en"] = c["description_en"]
        updated += 1

# Update category counts
for cat in data["categories"]:
    cat_projects = [p for p in data["projects"] if p["category"] == cat["id"]]
    cat["projectCount"] = len(cat_projects)
    cat["sampleImage"] = cat_projects[0]["image"] if cat_projects else None
    cat["sampleAlt"] = cat_projects[0]["alt"] if cat_projects else None

serialized = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
JS_OUTPUT.write_text(
    "/* Generated from assets/images/portfolio — do not edit manually. */\n"
    f"window.LNK_PORTFOLIO_CATALOG = {serialized};\n",
    encoding="utf-8",
)
print(f"Updated {updated} projects with custom descriptions.")
for cat in data["categories"]:
    print(f"  {cat['id']}: {cat['projectCount']} projets")
