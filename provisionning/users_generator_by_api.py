import sys
import os
from faker import Faker
from pymongo import MongoClient
from random import randint, choice, choices, sample
from keycloak import KeycloakAdmin
from keycloak import KeycloakOpenIDConnection
from pymongo import MongoClient

fake = Faker()

# Keycloak connection
keycloak_connection = KeycloakOpenIDConnection(
    server_url="http://localhost:8080/auth/",
    realm_name="master",
    username="admin",
    password="admin",
    client_id="admin-cli",
    verify=True)

keycloak_admin = KeycloakAdmin(connection=keycloak_connection)


def generateID():
    st = "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz"
    return "".join(choices(st, k=17))

# MongoDB Connection


def get_database():

    mongo_uri = os.getenv('MONGO_URI')
    client = MongoClient(mongo_uri)
    return client['meteor']


# 60000 > 1200 par structure dont
# 4 instit par école, 40 prof par collège, 160 prof par lycée
# 100 élèves par école, 400 par collège, 1600 par lycée

# 50000 écoles, 7000 collèges, 3000 lycées
# 50000/50 = 1000
# 7000/50 = 140
# 3000/50 = 60


def createStructure(name, parentId):
    entry = {}
    struc = db['structures'].find_one({"name": name})
    if struc == None:
        groupDB = db['groups'].find_one({"name": name})
        if groupDB == None:
            if parentId != 0:
                entry = {
                    "_id": generateID(),
                    "name": name,
                    "parentId": parentId,
                    "ancestorsIds": [parentId],
                    "childrenIds": [],
                }

                parent = db['structures'].find_one({"_id": parentId})
                if parent != None:
                    newTab = parent["childrenIds"]
                    newTab.append(parentId)
                    db['structures'].update_one(
                        {"_id": parentId}, {"$set": {"childrenIds": newTab}})
            else:
                entry = {
                    "_id": generateID(),
                    "name": name,
                    "parentId": None,
                    "ancestorsIds": [],
                    "childrenIds": [],
                }

            db['structures'].insert_one(entry)
            newStruc = db['structures'].find_one({"name": name})

            keycloak_admin.create_group({"name": name})
            group = {
                "_id": generateID(),
                "name": name,
                "slug": '{}_{}'.format(newStruc['_id'], name.replace(' ', '_')),
                "type": 15,
                "description": 'groupe structure',
                "content": '',
                "avatar": '',
                "plugins": {},
                "owner": 0,
                "animators": [],
                "members": [],
                "candidates": [],
                "avatar": '',
            }
            db['groups'].insert_one(group)
            groupDB = db['groups'].find_one({"name": name})

            db['structures'].update_one(
                {"name": name}, {"$set": {"groupId": groupDB["_id"]}})


def execStructureGenerator():
    for ac in range(0, 50):
        name = 'academie {}'.format(ac)
        createStructure(name, 0)
        struc = db['structures'].find_one({"name": name})
        print("Created structure: {}".format(struc["name"]))

        for ec in range(0, 1000):
            school_name = 'Ecole {} ({})'.format(ec+1, name)
            createStructure(school_name, struc["_id"])
            print("Ecole créée: {}".format(school_name))

        print("=============================================")

        for col in range(0, 140):
            col_name = 'college {} ({})'.format(col+1, name)
            createStructure(col_name, struc["_id"])
            print("Collège créé: {}".format(col_name))

        print("=============================================")

        for lyc in range(0, 60):
            lyc_name = 'lycee {} ({})'.format(lyc+1, name)
            createStructure(lyc_name, struc["_id"])
            print("Lycée créé: {}".format(lyc_name))

        print("=============================================")
        print("=============================================")


def execUserGenerator(id):
    name = fake.name()
    mail = name.replace(' ', '.') + '_' + str(id) + '@ac-test.fr'

    firstname = name.split(' ')[0]
    lastname = name.split(' ')[1]

    print(mail)

    emails = [{"address": mail, "verified": True}]

    structure = getRandomStructure()

    user = db['users'].find_one({"username": mail})
    if user == None:
        entry = {
            "_id": generateID(),
            "username": mail,
            "emails": emails,
            "password": "123",
            "structure": structure,
            "firstName": firstname,
            "lastName": lastname,
            "isActive": True
        }
        print("Create user: {}".format(entry["username"]))
        db['users'].insert_one(entry)

        new_user = keycloak_admin.create_user({"email": mail,
                                               "username": mail,
                                               "enabled": True,
                                               "firstName": firstname,
                                               "lastName": lastname,
                                               "credentials": [{"value": "eole", "type": "password", }]},
                                              exist_ok=False)

    else:
        execUserGenerator(id)


db = get_database()

nb = int(sys.argv[1])


# groups = keycloak_admin.get_groups()
# for gr in groups:
#     keycloak_admin.delete_group(gr['id'])


execStructureGenerator()

# for i in range(0, nb):
#    execUserGenerator(i)
