# GUIDE DE CREATION DE LOG SERVER

Nous allons voir avec cette documentation où et comment ajouté des logs server dans les différentes méthodes de **laBoite**

## FONCTIONNEMENT

### Logger

Le système de log a été mis en place dans le fichier `logging.js` avec la librairie [winston](https://github.com/winstonjs/winston#readme).

Le but de ce logger est de pouvoir être appelé n'importe où dans l'application afin de générer un log côté serveur.

### Mise en place

Pour faciliter l'analyse des logs, il est important de respecter une certaine notation afin de rester cohérent dans toute l'application.

De manière génrérale, il est important d'ajouter un log à chaque modification au niveau de la base de donnée (CREATE / UPDATE / REMOVE / INSERT) et à chaque erreur levée (METEOR ERROR notamment).

De ce fait, voici la notion choisie:

Si je souhaite ajouter un log dans une méthode au niveau des structures (`api/structures/methods.js`) comme par exemple dans la fonction createStructure au niveau de l'UPDATE voici la notation :

```javascript
logServer(
  `STRUCTURE - METHODS - UPDATE - createStructure`,
  levels.INFO,
  scopes.SYSTEM,
  { structureId, structureId, directParentStructureAncestorIds }
);
```

Si on doit résumer cette notation dans l'ordre on retrouve:

- _STRUCTURE_ - représente le cadre du log
- _METHODS_ - fichier dans lequel on se trouve en relation avec le cadre
- _UPDATE_ - représente l'action faite en base de donnée
- _createStructure_ - nom de la méthod concerné
- _levels.INFO_ - représente l'importance du log cf. [levels](#levels)
- _scopes.SYSTEM_ - représente l'entité qui déclanche le log cf. [scopes](#scopes)
- _{`vars`}_ - représente les/la variables passées dans la méthods qui appel le log

#### Levels

On retrouve plusieur niveau de log:

- ERROR
- WARN
- INFO
- HTTP
- VERBOSE
- DEBUG
- SILLY

Pour le moment, la majorité des logs sont tagger ERROR, WARN, INFO et VERBOSE.

#### Scopes

Il y a trois scope majeur mis en place:

- SYSTEM
- ADMIN
- USER

Il est judicieux de choisir le scope selon quelle entité provoque le log.
