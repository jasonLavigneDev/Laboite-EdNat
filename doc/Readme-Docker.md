# Run local laboite app in container :

```
cp config/settings.development.json.sample config/settings.development.json

docker-compose build

./run.sh
```

Browse to localhost url with user 'eole@ac-dijon.fr' and password 'changeme'.

# Run laboite with the dev image from [docker-hub](https://hub.docker.com/repository/docker/eoleteam/laboite) :

```
docker-compose -f docker-compose-hub.yml up -d
```

**Caution** : you may want to clean previous volume :
`docker-compose -f docker-compose-hub.yml down -v`

# Import/export of services/catégories :

* Enter in mongo container

`docker-compose exec mongo /bin/bash`

* Go in shared volume folder

`cd /data/db`

* Export services and categories collections in 2 json files

```
mongoexport --uri="mongodb://mongo:27017/meteor" --collection=services --jsonArray --pretty --out=services.json
mongoexport --uri="mongodb://mongo:27017/meteor" --collection=categories --jsonArray --pretty --out=categories.json
```

* Import those collections from json files

```
mongoimport --uri="mongodb://mongo:27017/meteor" --collection=categories --jsonArray --file=categories.json
mongoimport --uri="mongodb://mongo:27017/meteor" --collection=services --jsonArray --file=services.json
```
