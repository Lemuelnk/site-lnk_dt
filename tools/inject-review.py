"""Prépare un avis de test pour une validation administrative manuelle.

Le script ne contacte aucune API et ne contient aucun secret. Toute
opération d’administration doit utiliser un token fourni hors du dépôt,
via l’interface d’administration ou un secret d’environnement dédié.
"""

import json


review_data = {
    "id": "mike-muketo-google-2026",
    "name": "Mike Muketo",
    "organization": "Google Review",
    "project": "Design Graphique",
    "rating": 5,
    "review": (
        "Le service est rapide et professionnel. Par rapport aux modifications "
        "sur le produit, vous êtes toujours réceptifs et prêts à donner le meilleur."
    ),
    "status": "approved",
    "created_at": "2026-07-25 10:00:00",
}

print("L’avis de Mike Muketo a été préparé.")
print(json.dumps(review_data, ensure_ascii=False, indent=2))
