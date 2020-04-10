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

**Caution** : you may want to clean previous volume : `docker-compose -f docker-compose-hub.yml down -v`

# Import/export of services/catégories :

- Enter in mongo container

```
docker-compose exec mongo /bin/bash
```

- Go in shared volume folder

```
cd /data/db
```

- Export services and categories collections in 2 json files ("_id" keys of services are deleted to be recreated on new App instances)

```
mongoexport --uri="mongodb://mongo:27017/meteor" --collection=services --jsonArray --pretty --out=services.json
sed -i '/_id/d' services.json
mongoexport --uri="mongodb://mongo:27017/meteor" --collection=categories --jsonArray --pretty --out=categories.json
```

- Put those collections into .env files (imported at startup)

```
serv=$(cat services.json | jq -c .)
cate=$(cat categories.json | jq -c .)
jq ".services=$serv | .categories=$cate" <config/settings.development.json >config/settings.datas.json
echo "METEOR_SETTINGS=$(cat config/settings.datas.json | jq -c .)" > .env
```
