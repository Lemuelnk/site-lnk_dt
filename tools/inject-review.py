import requests
import json
import sys

# Configuration Staging
URL = "https://lnk-design-touch-staging.pages.dev/api/review-admin"
TOKEN = "lnkdesign2026"

review_data = {
    "id": "mike-muketo-google-2026",
    "name": "Mike Muketo",
    "organization": "Google Review",
    "project": "Design Graphique",
    "rating": 5,
    "review": "Le service est rapide et professionnel. Par rapport aux modifications sur le produit, vous êtes toujours réceptifs et prêt à donner le meilleur.",
    "status": "approved",
    "created_at": "2026-07-25 10:00:00"
}

# Note: L'API actuelle ne permet pas l'insertion directe via POST (seulement modération)
# On va essayer de passer par une simulation de soumission publique puis approbation
# Mais comme Turnstile bloque en local, on va plutôt suggérer à l'utilisateur de le valider
# ou modifier le script pour une injection D1 directe via wrangler si disponible.

print("L'avis de Mike Muketo a été préparé.")
print(json.dumps(review_data, indent=2))
