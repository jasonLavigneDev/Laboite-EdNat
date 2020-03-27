# Cloner ce dépot

Run local laboite app in container :

```
cp config/settings.development.json.sample config/settings.development.json

docker-compose build

./run.sh
```

# Browse to localhost url with user 'eole@ac-dijon.fr' and password 'changeme'.

Run laboite with the dev image from [docker-hub](https://hub.docker.com/repository/docker/eoleteam/laboite) :

```
docker-compose -f docker-compose-hub.yml up -d
```

**Caution** : you may want to clean previous volume :
`docker-compose -f docker-compose-hub.yml down -v`

# Gestion de l'import/export des services/catégories :

Entrer dans le conteneur mongo

`docker-compose exec mongo /bin/bash`

Aller dans le dossier du volume partagé

`cd /data/db`

Exporter les collections services et catégories en 2 fichiers json

```
mongoexport --uri="mongodb://mongo:27017/meteor" --collection=services --jsonArray --pretty --out=services.json
mongoexport --uri="mongodb://mongo:27017/meteor" --collection=categories --jsonArray --pretty --out=categories.json
```

Importer ces mêmes collections

```
mongoimport --uri="mongodb://mongo:27017/meteor" --collection=categories --jsonArray --file=categories.json
mongoimport --uri="mongodb://mongo:27017/meteor" --collection=services --jsonArray --file=services.json
```
