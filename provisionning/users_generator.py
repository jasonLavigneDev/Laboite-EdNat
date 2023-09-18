import sys
import os
from faker import Faker
import random
from pymongo import MongoClient
from random import randint, choice, choices, sample
from keycloak import KeycloakAdmin
from keycloak import KeycloakOpenIDConnection
from dotenv import load_dotenv
from datetime import datetime


load_dotenv()
fake = Faker()


structures = {}


KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_USER_REALM = os.getenv("KEYCLOAK_USER_REALM")
KEYCLOAK_USERNAME = os.getenv("KEYCLOAK_USERNAME")
KEYCLOAK_PASSWORD = os.getenv("KEYCLOAK_PASSWORD")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")

ECOLE_PAR_ACADEMIE = os.getenv("ECOLE_PAR_ACADEMIE")
COLLEGE_PAR_ACADEMIE = os.getenv("COLLEGE_PAR_ACADEMIE")
LYCEE_PAR_ACADEMIE = os.getenv("LYCEE_PAR_ACADEMIE")

PERSONNE_PAR_ECOLE = os.getenv("PERSONNE_PAR_ECOLE")
PERSONNE_PAR_COLLEGE = os.getenv("PERSONNE_PAR_COLLEGE")
PERSONNE_PAR_LYCEE = os.getenv("PERSONNE_PAR_LYCEE")

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DATABASE = os.getenv("MONGO_DATABASE")

# Keycloak connection
keycloak_connection = KeycloakOpenIDConnection(
    server_url=KEYCLOAK_URL,
    user_realm_name=KEYCLOAK_USER_REALM,
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

    client = MongoClient(MONGO_URI)
    return client[MONGO_DATABASE]


def resetData():
    groups = keycloak_admin.get_groups()
    for gr in groups:
        print("Remove group: {}".format(gr['name']))
        keycloak_admin.delete_group(gr['id'])
        db['groups'].delete_one({"name": gr['name']})
        db['structures'].delete_one({"name": gr['name']})
        db['asamextensions'].delete_one(
            {"extension": '{}.fr'.format(gr['name'].replace(' ', '-').replace('(', '').replace(')', ''))})

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

            mailExtension = {"_id": generateID(),
                             "extension": "{}.fr".format(name.replace(' ', '-').replace('(', '').replace(')', '')),
                             "entiteNomCourt": "",
                             "entiteNomLong": "",
                             "familleNomCourt": "",
                             "familleNomLong": "",
                             "structureId": newStruc['_id']
                             }

            db['asamextensions'].insert_one(mailExtension)

            if 'ecole' in name:
                structures[newStruc["_id"]] = int(PERSONNE_PAR_ECOLE)

            elif 'college' in name:
                structures[newStruc["_id"]] = int(PERSONNE_PAR_COLLEGE)

            elif 'lycee' in name:
                structures[newStruc["_id"]] = int(PERSONNE_PAR_LYCEE)


def execStructureGenerator(nb):
    for ac in range(0, nb):
        name = 'academie {}'.format(ac)
        createStructure(name, 0)
        struc = db['structures'].find_one({"name": name})
        print("[{}] Created structure: {}".format(
            datetime.now(), struc["name"]))

        for ec in range(0, int(ECOLE_PAR_ACADEMIE)):
            school_name = 'ecole {} ({})'.format(ec+1, name)
            createStructure(school_name, struc["_id"])
            print("[{}] Ecole créée: {}".format(datetime.now(), school_name))

        print("=============================================")

        for col in range(0, int(COLLEGE_PAR_ACADEMIE)):
            col_name = 'college {} ({})'.format(col+1, name)
            createStructure(col_name, struc["_id"])
            print("[{}] Collège créé: {}".format(datetime.now(), col_name))

        print("=============================================")

        for lyc in range(0, int(LYCEE_PAR_ACADEMIE)):
            lyc_name = 'lycee {} ({})'.format(lyc+1, name)
            createStructure(lyc_name, struc["_id"])
            print("[{}] Lycée créé: {}".format(datetime.now(), lyc_name))

        print("=============================================")
        print("=============================================")


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


def execUserGenerator(id, structure):

    mailExtension = db['asamextensions'].find_one(
        {"structureId": structure})

    name = fake.name()
    mail = name.replace(' ', '.') + '_' + str(id) + \
        '@' + mailExtension["extension"]

    firstname = name.split(' ')[0]
    lastname = name.split(' ')[1]

    emails = [{"address": mail, "verified": True}]

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
            "favServices": [],
            "isActive": True
        }
        print("[{}] Create user: {}".format(datetime.now(), entry["username"]))
        db['users'].insert_one(entry)

        addUserToStructureGroup(idDB, structure)

    else:
        execUserGenerator(id)


db = get_database()

nbStruc = int(sys.argv[1])

if(len(sys.argv) == 3):
    reset = sys.argv[2]

    if reset == '-r':
        resetData()


if nbStruc > 0:
    execStructureGenerator(nbStruc)

for key in structures:
    for i in range(0, structures[key]):
        execUserGenerator(i, key)
