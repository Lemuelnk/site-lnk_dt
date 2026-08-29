# Guide d'Administration LNK Design Touch — Cockpit Staging

Ce guide détaille le fonctionnement interne et utilisateur de votre panneau d'administration. Conçu pour être à la fois un manuel d'utilisation et une base de réflexion pour vos futures améliorations, il décortique chaque mécanisme du système.

---

## 1. Architecture et Stockage des Données

Votre administration repose sur une architecture **Serverless** utilisant les technologies Cloudflare. Contrairement à un site classique, il n'y a pas de serveur central qui tourne en permanence ; tout est déclenché à la demande.

| Composant | Rôle | Technologie |
| :--- | :--- | :--- |
| **Base de Données** | Stockage des avis, des projets et des réglages de promo. | Cloudflare D1 (SQL) |
| **API Admin** | Traitement des actions (approuver, supprimer, publier). | Cloudflare Pages Functions |
| **Catalogue Statique** | Liste des images déjà présentes dans le code source. | `data/news.json` |
| **Catalogue Dynamique** | Images ajoutées via l'interface (URL ou Galerie). | Table `news_settings` |

> **Note sur le stockage des images de votre galerie** : Lorsque vous importez une image, elle est convertie en **Data URL (Base64)** et stockée directement dans la base de données D1. 
> *   **Avantage** : C'est instantané et ne nécessite pas de configuration complexe de stockage externe.
> *   **Limite** : Pour la production, si vous importez des centaines d'images très lourdes, la base de données pourrait ralentir.

---

## 2. Gestionnaire d'Annonces & Promos (Le nouveau système)

C'est le cœur interactif de votre stratégie de communication.

### A. Le Formulaire de Configuration
*   **Aperçu du visuel** : Affiche instantanément l'image sélectionnée.
*   **Importer un fichier** : Ouvre votre galerie/répertoire. L'image est lue localement puis envoyée à la base de données lors de la publication.
*   **Durée de diffusion** : Permet de choisir une valeur numérique et une unité (**Heures, Jours, Mois**). L'API calcule la date d'expiration exacte.
*   **Lien WhatsApp** : Un bouton "Générer" pré-remplit le lien avec votre numéro et un message personnalisé incluant le titre de la promo.

### B. Le Catalogue (3x3 Desktop / 2x2 Mobile)
*   **Bouton "Sélectionner"** : Remplit automatiquement le formulaire avec les données de l'image choisie (Titre, Description, Lien).
*   **Bouton "Corbeille"** : Retire l'image du catalogue actif. Elle ne peut plus être sélectionnée pour une promo.
*   **Badge "EN LIGNE"** : Indique visuellement quelle image est actuellement affichée sur le site public.

### C. La Corbeille des Visuels
*   **Restaurer** : Remet l'image dans le catalogue principal.
*   **Supprimer définitivement** : Efface l'entrée de la base de données. *Attention : Si c'est une image du projet (statique), le fichier reste dans le code mais n'apparaît plus dans l'admin.*

---

## 3. Modération des Avis & Demandes de Projets

### A. Système de Filtrage
Vous disposez de filtres rapides (**Tous, Publiés, Refusés**) pour naviguer dans l'historique. 
*   **Badge de notification** : Un point rouge ou un chiffre apparaît sur les onglets pour signaler les nouveaux éléments non traités.

### B. Actions sur les Avis
*   **Publier** : L'avis passe en `status='approved'` et devient visible sur la page principale.
*   **Refuser** : L'avis reste dans l'historique mais n'est pas publié.
*   **Corbeille** : L'avis est marqué pour suppression. Il sera invisible partout sauf dans votre zone de récupération pendant 30 jours.

---

## 4. Mes Propositions d'Expert pour LNK Design Touch

Après analyse de votre cockpit, voici mes recommandations pour pousser l'outil à **10/10** :

### 🚀 Proposition 1 : Dashboard de Performance Réel
Actuellement, les graphiques montrent la répartition des avis. Je propose d'intégrer :
*   **Compteur de clics** : Savoir combien de personnes ont cliqué sur "Voir l'offre" dans votre popup.
*   **Provenance** : Voir si vos visiteurs viennent plus du mobile ou du desktop pour adapter vos visuels de promo.

### 🎨 Proposition 2 : Éditeur de Visuels "Light"
Ajouter un bouton "Modifier" sur les images du catalogue pour :
*   Ajouter un **badge "PROMO"** ou un texte par-dessus l'image directement depuis l'admin sans avoir besoin de Photoshop.

### 📱 Proposition 3 : Notifications Push Admin
Au lieu de devoir vous connecter pour vérifier, recevoir une notification sur votre téléphone (via un service comme Pushover ou Telegram) dès qu'un nouvel avis ou un nouveau projet est reçu.

### 📂 Proposition 4 : Archivage Intelligent des Projets
Permettre de classer les demandes de projets par **"En cours"**, **"Terminé"**, ou **"Annulé"** avec une estimation du chiffre d'affaires généré pour chaque projet, afin de suivre la croissance de votre studio.

---

**Comment appliquer ces changements ?**
Toutes ces fonctionnalités peuvent être ajoutées au staging de manière isolée. Dites-moi laquelle vous intéresse le plus pour que nous puissions l'étudier ensemble !
