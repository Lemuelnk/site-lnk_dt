# PASS 3 FIX

Le PASS 3 précédent avait placé par erreur une partie du markup de sécurité du formulaire (honeypot/Turnstile/bouton) à l'intérieur du textarea « Votre témoignage ». Le navigateur affichait donc le HTML comme texte.

Corrections :
- textarea restauré ;
- honeypot déplacé hors du textarea ;
- conteneur Turnstile déplacé hors du textarea ;
- bouton de soumission replacé au bon niveau ;
- cinq avis fictifs de démonstration restaurés pour tester l'affichage.

Les cinq avis sont explicitement fictifs et doivent être remplacés/supprimés avant la mise en production.
