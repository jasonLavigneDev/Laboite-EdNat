# GUIDE DU CRUD SUR LABOITE
Exemple pris dans le fichier Articles.js
Pour les extraits de code , on appellera la collection TUTO , bien penser a remplacer TUTO par le nom de votre collection

## STRUCTURE
### Dans imports/api
1. Creer le dossier ["tuto"]
2. Creer les fichiers ["tuto".js] et ["methods.js"]
3. Creer un dossier ["server"]
4. Dans le dossier server creer les fichiers ["tuto".tests.js] , ["publications.js"] et ?????? ["factories.js"] ???

## PREPARATION DE LA COLLECTION
### Dans le fichier ["tuto".js]
1. Création de la Collection 
```jsx
const Tuto = new Mongo.Collection("tuto");
```
2.  Options deny ( permet de refuser les mises a jour coté client lorsqu’on utlise des methodes. voir le guide sur la différence méthode/publication) 
```jsx
Tuto.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});
```
3. Création du schéma ( utilisation de la lib simpleSchema)
```jsx
Tuto.schema = new SimpleSchema(
  {
    tutoField1: {type: String, min: 1},
    tutoField2: {type: String, min: 1},
  },
  { tracker: Tracker },
);
```
4. Déclaration des champs publics
```jsx
Tuto.publicFields = {
  tutoField1: 1,
  tutoField2 : 1,
};
```
5. Attachement du Schéma
```jsx
Tuto.attachSchema(Tuto.schema);
```
6.  if Meteor isServer ( condition a ajouter dans les methodes , pour forcer l execution du code coté server et ne rien rendre coté client . A placer dans les fichiers qui partagent le code coté client / server typiquement les methodes . )
```jsx
if (Meteor.isServer) {
  const updateGroupWithArticles = (doc, remove) => {
    if (doc.groups) {
      doc.groups.forEach(({ _id }) => {
        if (remove) {
          const isThereStillArticles = Articles.findOne({ 'groups._id': _id });
          if (!isThereStillArticles) {
            Groups.update({ _id }, { $set: { articles: false } });
          }
        } else {
          Groups.update({ _id }, { $set: { articles: true } });
        }
      });
    }
  };

  Tuto.after.insert(function (userId, doc) {
    updateGroupWithArticles(doc, false);
  });
  Tuto.after.update(function (userId, doc) {
    updateGroupWithArticles(doc, false);
  });
  Tuto.after.remove(function (userId, doc) {
    updateGroupWithArticles(doc, true);
  });
};
```
7. Export de la collection
```jsx
export default Tuto;
```

## CREATE ( Utilisation de Methods )
### Dans imports/api/[tuto]/methods.js
1. Definition de la fonction ( utilisation de ValidateMethod intégré a Meteor et SimpleSchema )
```jsx
export const createTuto = new ValidatedMethod({
  name: 'tuto.createTuto',
  validate: new SimpleSchema({
     tutoField1: { type: String, min: 1},
     tutoField2: { type: String, min: 1},
  }).validator({ clean: true }),

  run({ tutoField1, tutoField2 }) {
// Create one Tuto with tutoField set in DB
    return Tuto.insert({ tutoField1, tutoField2});
  },
});
```

## READ ( Utilisation de Publications )
### Dans imports/api/[tuto]/server/publications.js
1. Définition de la fonction 
```jsx
Meteor.publish('tuto.all', function "getAllTutos" () {
// return all tutos in DB
  return Tuto.find({});
});
```

## UPDATE ( Utilisation de Methods )
### Dans imports/api/tuto/methods.js
1. Definition de la fonction
```jsx
export const updateTuto = new ValidatedMethod({
  name: 'tuto.updateTuto',
  validate: new SimpleSchema({
    tutoId: { type: String },
    tutoField1: {type: String, min: 1},
    tutoField2: {type: String, min: 1},
  }).validator(),

  run({ tutoId, tutoField1, tutoField2 }) {
// check tuto existence
    const tuto = Tuto.findOne({ _id: tutoId });
    if (structure === undefined) {
      throw new Meteor.Error('api.tuto.updateTuto.unknownTuto',i18n.__('api.tuto.unknownTuto'));
    }
// update Tuto with tutoField in DB
    return Tuto.update({ _id: tutoId }, { $set: { tutoField1, tutoField2 }});
  },
});
```

## DELETE ( Utilisation de Methods )
### Dans imports/api/[tuto]/methods.js
1. Definition de la fonction ( utilisation de ValidateMethod intégré a Meteor et SimpleSchema )
```jsx
export const removeTuto = new ValidatedMethod({
  name: 'tuto.removeTuto',
  validate: new SimpleSchema({
    tutoId: { type: String },
  }).validator(),

  run({ tutoId }) {
// check tuto existence
    const tuto = Tuto.findOne({ _id: tutoId });
    if (tuto === undefined) {
        throw new Meteor.Error('api.tuto.removeTuto.unknownTuto',i18n.__('api.tuto.unknownTuto'));
    }
// remove Tuto in DB
    return Tuto.remove(tuto);
  },
});
```


# Migrations

Dans le contexte du CRUD, toute modification sur les collections existantes nécessitent la présence d'une migration, afin de préserver l'intégrité des données sur l'application. Cela s'applique donc principalement sur les ajouts, suppression ou modification de champs déjà existant dans une collection.

## Principe

Le principe de la migration est de permettre de conserver l'intégrité des données déjà présentes lors du passage d'une version à l'autre. La migration permet donc d'ajouter, modifier et supprimer des champs d'une collection.
Chaque migration est indexé par un numéro de version, qu'il suffit d'incrémenter à chaque nouveauté.


## Procédé

### Modification de la collection

- Il faut tout d'abord modifier notre collection dans l'API. Pour cela, il suffit de se rendre dans le fichier correspondant, et ajouter, modifier ou supprimer le champ que l'on souhaite.
- Suivre les procédures lors de la modification d'une collection (Autre readme)


### Vérification des migrations

- Se rendre dans le fichier app/imports/api/migrations.js, et se placer à la fin du fichier.
- vérifier la dernière migration existante, et récupérer le numéro de version. Votre futur migration correspondra donc à la version suivante.


### Réalisation de la migration

- Utiliser la librairie Migrations pour créer une nouvelle migration, à l'aide de Migrations.add
- La fonction doit contenir une requête, qui elle même contient les éléments suivants:
  - Le numéro de version
  - Le nom, permettant de définir l'opération qui est effectuée
  - Le processus réalisé lors du passage de la version antérieure vers la version supérieure (up)
  - La requête réalisée lors du passage de la version supérieure vers la version inférieure (down)

### Réalisation des requêtes MongoDB

A partir de cet étape, il s'agit de réaliser les requêtes qui seront exécutés lors de la migration. Les opérations sur les collections s'effectuent de façon habituel.

#### Passage de version inférieure vers version supérieure (up)

Dans ce cas là, vous devez effectuer une requête Mongo qui permettra d'opérer la modification que vous souhaitez apporter. La requête est similaire à ce qu'il se fait dans le reste de l'application.

#### Passage de la version supérieure vers inférieure (down)

Il faut que l'application puisse revenir en arrière. En effet, il est possible de changer de version de migration à tout moment, sur n'importe quelle version qu'elle soit. 

Lorsque vous changez de version, Meteor s'occupe d'effectuer toutes les migrations (dans un sens ou l'autre) jusqu'à revenir à l'état de la version souhaité. Il faut donc que la migration soit capable d'annuler la modification que vous avez apporté. 

- Exemple: Si votre migration, à son niveau, à ajoute un champ dans une collection, il faut qu'elle puisse également le supprimer dans le cas d'un retour à une version antérieure.


## Modèle de migration


Cas d'ajout de champ dans une collection: up contient la fonction qui ajoute le champ, down contient la faction qui le retire

```jsx
Migrations.add({
  version: X,
  name: 'nom de migration',
  up: () => {
    Collections.find({})
      .fetch()
      .forEach((data) => {
        Collections.update({ _id: data._id }, { $set: { champNouveau: valeurDefaut } });
      });
  },
  down: () => {
    Collections.rawCollection().updateMany({}, { $unset: { champNouveau: 1 } }, { multi: true });
  },
});
```


# Tests

## Principe

Le but des tests est de pouvoir vérifier le bon fonctionnement actuel ou futur de vos méthodes et publications. Initialement, un test s'écrit avant même l'écriture du code fonctionnel correspondant.

Votre test doit être en mesure de vérifier que votre script fonctionne, et doit pouvoir éliminer tout les cas d'exceptions possible.

## Processus

- Se rendre dans le dossier imports/app/api/categorie, categorie étant le dossier correspondant à l'endroit où vous souhaitez faire vos tests.
- Se placer dans le dossier server, puis créé le fichier categorie.tests.js
- Veillez à créer un test pour chaque méthode et publications que vous avez créé, ou que vous allez créer.


## Modèle

- Tout les tests fonctionne via méthode describe, qui se présente de la façon suivante: 

```jsx
describe('méthode testée', function() => {
    //code ici
});
```

- Il est possible, au besoin, de définir des données de tests, avant que les tests s'exécute. Dans votre fichier test, utilisez la méthode before.

```jsx
describe('méthode testée', function() => {
    before(function() => {
        //code ici
    });

    //code ici
});
```

- Chaque test peut contenir des méthodes de tests permettant de vérifier le bon fonctionnement d'une méthode, et des méthodes permettant de vérifier les erreurs et exceptions possibles.

```jsx
describe('méthode testée', function() => {
    //Vérifier le fonctionnement d'une méthode
    it('description du test', function () {
        //code ici
    });
})
```

Dans vos tests, la méthode assert.equals permet de vérifier le résultat obtenu par le test avec le résultat attendu. La méthode assert.throws permet de vérifier une erreur obtenue avec une erreur attendue.


```jsx
describe('MethodName', function () {
      it('description du test', function () {
        //code ici

        assert.equal(resultatObtenu, resultatAttendu);
      });
      it("description du test d'erreur", function () {
        assert.throws(
          () => {
            //code ici
          },
          Meteor.Error,
          /api.categorie.method.erreurAttendue/,
        );
      });
    });
```

## Fichier factories

Il est possible d'ajouter un fichier au dossier server, afin de générer des objets et données de tests.
Pour cela:
- créér un fichier factories.js
- Utiliser l'import suivant

```jsx
import { Factory } from 'meteor/dburles:factory';
```

- Utiliser la méthode suivante pour générer vos données:

```jsx
Factory.define('nom', Collection, {
    champ1: valeur1,
    champ2: valeur2,
    ...
})

champ correspondant à un champ présent dans la collection
```

- Pour l'utiliser dans les tests, il suffit de faire appel à la factory de la façon suivante:

```jsx
let data = Factory.create('nom')
```


## Lancement des tests

Le lancement des tests s'exécuté avec la ligne de commande suivante:

```bash
meteor test --once --exclude-archs 'web.browser.legacy, web.cordova' --driver-package meteortesting:mocha --allow-superuser
```

ou, si l'entrée existe:

```bash
meteor run test
```

Si le script n'existe pas, il est possible de l'ajouter dans le fichier package.json. Par défaut, se rendre dans le fichier, se placer dans scripts, et ajouter l'entrée suivante:

```bash
test: "meteor test --once --exclude-archs 'web.browser.legacy, web.cordova' --driver-package meteortesting:mocha --allow-superuser"
```


