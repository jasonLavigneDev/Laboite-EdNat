# Architecture

L'architecture du projet se décompense tel que;

```bash
.
├── .husky # Les hooks de pre-commit et pre-push
├── .vscode # Dossier spécifique à vscode
├── app # Application MeteorJS 
│   ├── .meteor # Packages meteors
│   ├── .vscode # Dossier spécifique à vscode
│   ├── client # Les fichiers de départ du client, on y touche rarement
│   ├── imports
│   │   ├── api # Essentiellement les schemas, methods meteor, publications, fonctions utilitaires. Le code métier est présent ici. On  sépare par entités.
│   │   │   ├── appclients
│   │   │   ├── appsettings
│   │   │   │   └── server
│   │   │   ├── (etc ...)
│   │   ├── startup # Ce qui concerne l'initialisation de l'application (le client à chaque fois qu'on accède au client, et le serveur quand il est démarré)
│   │   │   ├── client
│   │   │   ├── i18n
│   │   │   └── server
│   │   │       ├── config
│   │   │       └── db-initialize
│   │   └── ui
│   │       ├── components # Tout les composants de l'interface. On range par entité/schema.
│   │       │   ├── admin
│   │       │   ├── articles
│   │       │   ├── groups
│   │       │   ├── (etc ...)
│   │       ├── contexts # Les contextes react (comme `useAppContext`)
│   │       ├── layouts # Les pages gérant le routage générale
│   │       ├── pages # Les pages, qui sont généralement lié à une route donnée. Les composants react de type "pages" ne sont pas censé avoir des props paramétrables.
│   │       │   ├── admin
│   │       │   ├── articles
│   │       │   ├── groups
│   │       │   ├── legal
│   │       │   ├── (etc ...)
│   │       ├── themes # Les différents themes de `laboite`, servant à surcharger la librairie `mui`
│   │       │   ├── eole
│   │       │   │   └── components
│   │       │   ├── laboite
│   │       │   │   └── components
│   │       │   └── rizomo
│   │       │       └── components
│   │       └── utils
│   ├── node_modules # Les dépendances `npm`
│   ├── public # Le statique
│   │   ├── fonts
│   │   ├── images
│   │   │   ├── avatars
│   │   │   ├── groups
│   │   │   ├── i18n
│   │   │   └── logos
│   │   │       ├── eole
│   │   │       │   └── widget
│   │   │       ├── laboite
│   │   │       │   └── widget
│   │   │       └── rizomo
│   │   │           └── widget
│   │   └── themes
│   │       └── default
│   │           └── assets
│   │               └── fonts
│   ├── server # Dossier servant à important les fichiers d'initialisation du serveur
│   └── tests # Dossier des tests à la base, mais il n'est pas utilisé. Les tests sont chargés de par leur noms `*.test[s].js` 
├── config # Fichier de configuration (sera appelée dansle package.json pour enrichir `Meteor.settings`)
└── doc # Les difféntes documentation générale
```


