import sys
import os
from faker import Faker
import random
from pymongo import MongoClient
from random import randint, choice, choices, sample
from keycloak import KeycloakAdmin
from keycloak import KeycloakOpenIDConnection
from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv()
fake = Faker()


KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_USERNAME = os.getenv("KEYCLOAK_USERNAME")
KEYCLOAK_PASSWORD = os.getenv("KEYCLOAK_PASSWORD")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")
MONGO_URI = os.getenv("MONGO_URI")

# Keycloak connection
keycloak_connection = KeycloakOpenIDConnection(
    server_url=KEYCLOAK_URL,
    realm_name=KEYCLOAK_REALM,
    username=KEYCLOAK_USERNAME,
    password=KEYCLOAK_PASSWORD,
    client_id=KEYCLOAK_CLIENT_ID,
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


def resetData():
    groups = keycloak_admin.get_groups()
    for gr in groups:
        print("Remove group: {}".format(gr['name']))
        keycloak_admin.delete_group(gr['id'])
        db['groups'].delete_one({"name": gr['name']})
        db['structures'].delete_one({"name": gr['name']})

    users = keycloak_admin.get_users()
    for user in users:
        if user['username'] != KEYCLOAK_USERNAME:
            print("Remove user: {}".format(user['username']))
            keycloak_admin.delete_user(user['id'])
            db['users'].delete_one({"username": user['username']})


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
                "admins": [],
                "avatar": '',
            }
            db['groups'].insert_one(group)
            groupDB = db['groups'].find_one({"name": name})

            db['structures'].update_one(
                {"name": name}, {"$set": {"groupId": groupDB["_id"]}})


def execStructureGenerator(nb):
    for ac in range(0, nb):
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


# 104 personnes par école
# 440 personnes par collège
# 1760 personnes par lycée

def getRandomStructure():
    allStructures = db['structures'].find()
    rand = random.randrange(db['structures'].count_documents({}))
    return allStructures[rand]["_id"]


def addUserToStructureGroup(idDB, structureID):
    structure = db['structures'].find_one({"_id": structureID})
    if(structure != None):
        group = db['groups'].find_one({"_id": structure["groupId"]})
        if(group != None):
            members = group['members']
            user = db['users'].find_one({"_id": idDB})
            if(user != None):
                members.append(user["_id"])
                db['groups'].update_one({"_id": group["_id"]}, {
                                        "$set": {"members": members}})

                favgroups = user["favGroups"]
                favgroups.append(group["_id"])
                db['users'].update_one(
                    {"_id": idDB}, {"$set": {"favGroups": favgroups}})

                item = {"type": "group", "element_id": group["_id"]}

                persoSpace = {
                    "_id": generateID(),
                    "userId": idDB,
                    "unsorted": [item],
                    "sorted": []
                }
                db['personalspaces'].insert_one(persoSpace)

                role = {
                    "_id": generateID(),
                    "role": {
                        "_id": "member"
                    },
                    "scope": group["_id"],
                    "user": {
                        "_id": user["_id"]
                    },
                    "inheritedRoles": [
                        {
                            "_id": "member"
                        }
                    ]
                }
                db['role-assignment'].insert_one(role)


def execUserGenerator(id):
    name = fake.name()
    mail = name.replace(' ', '.') + '_' + str(id) + '@ac-test.fr'

    firstname = name.split(' ')[0]
    lastname = name.split(' ')[1]

    emails = [{"address": mail, "verified": True}]

    structure = getRandomStructure()

    user = db['users'].find_one({"username": mail})

    idDB = generateID()
    if user == None:
        new_user = keycloak_admin.create_user({"email": mail,
                                               "username": mail,
                                               "enabled": True,
                                               "firstName": firstname,
                                               "lastName": lastname,
                                               "credentials": [{"value": "eole", "type": "password", }]},
                                              exist_ok=False)

        entry = {
            "_id": idDB,
            "username": mail,
            "emails": emails,
            "password": "123",
            "structure": structure,
            "firstName": firstname,
            "lastName": lastname,
            "favGroups": [],
            "isActive": True
        }
        print("Create user: {}".format(entry["username"]))
        db['users'].insert_one(entry)

        addUserToStructureGroup(idDB, structure)

    else:
        execUserGenerator(id)


db = get_database()

nbStruc = int(sys.argv[1])
nbUsers = int(sys.argv[2])

if(len(sys.argv) == 4):
    reset = sys.argv[3]

    if reset == '-r':
        resetData()


if nbStruc > 0:
    execStructureGenerator(nbStruc)

if nbUsers > 0:
    for i in range(0, nbUsers):
        execUserGenerator(i)
