# Laboite

Plateforme de services en ligne.

Portail de presentation des applications disponibles et des groupes utilisateurs.

Développé dans le cadre du projet [APPS-EDUCATION](https://apps.education.fr/) en collaboration avec la direction interministérielle du numérique ([DINUM](https://www.numerique.gouv.fr/dinum/)) dans le cadre du projet Rizomo.

Plus d'information sur le [ wiki](https://gitlab.mim-libre.fr/alphabet/laboite/-/wikis/home).

Utilise :

- [METEOR](https://www.meteor.com)
- [REACT](https://fr.reactjs.org/)

## Initialisation

- Le projet nécessite l'installation de Meteor.
  https://www.meteor.com/developers/install

## Installation en local

- Se placer dans le dossier app du projet.
- Facultatif: Si présent, supprimer le dossier node_modules.
- Utiliser la commande suivante, toujours dans le dossier app:

`meteor npm ci`

- Une fois l'installation des packages effectuées, se rendre dans le dossier config du projet.
- Copier le fichier settings.development.json.sample et le coller au même endroit, en le renommant settings.development.json.
- Remplir le fichier settings.development.json avec les informations utiles.

## fichier settings.development.json

ATTENTION: Pour les développeurs, ne jamais publier le fichier settings.development.json et ne jamais remplir et publier le fichier settings.development.json.sample.

La description des champs et les valeurs requisent sont toutes définies dans le fichier README.md présent dans le dossier config.

## Lancement du projet

- Lorsque tout est convenablement installé et configuré, revenir dans le dossier app, puis exécuter la commande suivant:

`meteor npm start`
