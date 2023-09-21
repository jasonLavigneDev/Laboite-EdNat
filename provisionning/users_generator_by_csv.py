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
import csv


load_dotenv()
fake = Faker()


structures = {}


KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_USER_REALM = os.getenv("KEYCLOAK_USER_REALM")
KEYCLOAK_USERNAME = os.getenv("KEYCLOAK_USERNAME")
KEYCLOAK_PASSWORD = os.getenv("KEYCLOAK_PASSWORD")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")

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


def insertUser(user):

    alreadyExist = db['users'].find_one({"username": user["emails"]})
    if(alreadyExist == None):
        emails = [{"address": user["emails"], "verified": True}]
        new_user = keycloak_admin.create_user({"email": user["emails"],
                                               "username": user["emails"],
                                               "enabled": True,
                                               "firstName": user["firstName"],
                                               "lastName": user["lastName"],
                                               "credentials": [{"value": user["password"], "type": "password", }]},
                                              exist_ok=False)

        idDB = generateID()
        entry = {
            "_id": idDB,
            "username": user["emails"],
            "emails": emails,
            "password": user["password"],
            "structure": user["structure"],
            "firstName": user["firstName"],
            "lastName": user["lastName"],
            "favGroups": [],
            "favServices": [],
            "isActive": True
        }
        print("[{}] Insert user: {}".format(datetime.now(), entry["username"]))
        db['users'].insert_one(entry)

        addUserToStructureGroup(idDB, user["structure"])
    else:
        print("[{}] user {} already exists. Pass...".format(
            datetime.now(), alreadyExist["username"]))


def insertStructure(structure):
    alreadyExist = db["structures"].find_one({"name": structure["name"]})
    if(alreadyExist == None):
        db['structures'].insert_one(structure)

        keycloak_admin.create_group({"name": structure["name"]})
        group = {
            "_id": generateID(),
            "name": structure["name"],
            "slug": '{}_{}'.format(structure['_id'], structure["name"].replace(' ', '_')),
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
        print("[{}] Insert group: {}".format(datetime.now(), group["name"]))
        db['groups'].insert_one(group)
        groupDB = db['groups'].find_one({"name": structure["name"]})

        db['structures'].update_one(
            {"name": structure["name"]}, {"$set": {"groupId": groupDB["_id"]}})
    else:
        print("[{}] structure {} already exists. Pass...".format(
            datetime.now(), alreadyExist["name"]))


def insertMailExtension(mailExtension):
    alreadyExist = db.find_one({"extension": mailExtension["extension"]})
    if(alreadyExist == None):
        print("[{}] Insert mail extension: {}".format(
            datetime.now(), mailExtension["extension"]))
        db['asamextensions'].insert_one(mailExtension)
    else:
        print("[{}] Mail extension {} already exists. Pass...".format(
            datetime.now(), alreadyExist["extension"]))


db = get_database()


csvStructurePath = "structures.csv"
csvMailPath = "mails.csv"
csvUserPath = "users.csv"

if '-r' in sys.argv:
    resetData()

if '-s' in sys.argv:
    index = sys.argv.index('-s')
    csvStructurePath = sys.argv[index+1]

if '-m' in sys.argv:
    index = sys.argv.index('-m')
    csvMailPath = sys.argv[index+1]

if '-u' in sys.argv:
    index = sys.argv.index('-u')
    csvUserPath = sys.argv[index+1]


if(csvStructurePath != '' and csvStructurePath != 'none' and csvStructurePath != None):
    print("[{}] Start insert structures".format(datetime.now()))
    with open(csvStructurePath, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        line_count = 0
        for row in csv_reader:
            insertStructure(row)
    print("======================================================")
else:
    print("[{}] No CSV found for structures.".format(datetime.now()))


if(csvMailPath != '' and csvMailPath != 'none' and csvMailPath != None):
    print("[{}] Start insert mails extension".format(datetime.now()))
    with open(csvMailPath, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        for row in csv_reader:
            data = row
            data["_id"] = generateID()
            insertMailExtension(data)
    print("======================================================")
else:
    print("[{}] No CSV found for mails extensions.".format(datetime.now()))

if(csvUserPath != '' and csvUserPath != 'none' and csvUserPath != None):
    print("[{}] Start insert users".format(datetime.now()))
    with open(csvUserPath, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        for row in csv_reader:
            insertUser(row)
    print("======================================================")
else:
    print("[{}] No CSV found for users.".format(datetime.now()))
