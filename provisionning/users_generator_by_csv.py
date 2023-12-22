#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from sys import argv, exit
from os import getenv, popen
from os.path import isfile
import argparse
from pymongo import MongoClient
from keycloak import KeycloakAdmin
from keycloak import KeycloakOpenIDConnection
from dotenv import load_dotenv
from datetime import datetime
import csv
from utils import *

HELP = """
Script to insert into keycloak and mongo the structures, mails and users contained in csv files.

There must be the files structures.csv, mails.csv and users.csv in the same folder.

See '.env.sample' to set needed environment variables.
"""

load_dotenv()
structures = {}

KEYCLOAK_URL = getenv("KEYCLOAK_URL")
KEYCLOAK_REALM = getenv("KEYCLOAK_REALM")
KEYCLOAK_USER_REALM = getenv("KEYCLOAK_USER_REALM")
KEYCLOAK_USERNAME = getenv("KEYCLOAK_USERNAME")
KEYCLOAK_PASSWORD = getenv("KEYCLOAK_PASSWORD")
KEYCLOAK_CLIENT_ID = getenv("KEYCLOAK_CLIENT_ID")

MONGO_URI = getenv("MONGO_URI")
MONGO_DATABASE = getenv("MONGO_DATABASE")


def get_KC_admin():
    # Keycloak connection
    keycloak_connection = KeycloakOpenIDConnection(
        server_url=KEYCLOAK_URL,
        user_realm_name=KEYCLOAK_USER_REALM,
        realm_name=KEYCLOAK_REALM,
        username=KEYCLOAK_USERNAME,
        password=KEYCLOAK_PASSWORD,
        client_id=KEYCLOAK_CLIENT_ID,
        verify=True,
    )
    return KeycloakAdmin(connection=keycloak_connection)


def get_database():
    # MongoDB Connection
    client = MongoClient(MONGO_URI)
    return client[MONGO_DATABASE]


def resetUsers():
    users = keycloak_admin.get_users()
    for user in users:
        if user["username"] != KEYCLOAK_USERNAME:
            print("Remove user: {}".format(user["username"]))
            keycloak_admin.delete_user(user["id"])
            dbUser = db["users"].find_one({"username": user["username"]})
            if dbUser != None:
                db["personalspaces"].delete_one({"userId": dbUser["_id"]})
                db["users"].delete_one({"_id": dbUser["_id"]})


def resetStructures():
    groups = keycloak_admin.get_groups()
    for gr in groups:
        print("Remove group: {}".format(gr["name"]))
        keycloak_admin.delete_group(gr["id"])
        db["groups"].delete_one({"name": gr["name"]})
        db["structures"].delete_one({"name": gr["name"]})
        db["asamextensions"].delete_one(
            {
                "extension": "{}.fr".format(
                    gr["name"].replace(
                        " ", "-").replace("(", "").replace(")", "")
                )
            }
        )


def resetData():
    resetStructures()
    resetUsers()


def addUserToStructureGroup(idDB, structureID):
    structure = db["structures"].find_one({"_id": structureID})
    if structure != None:
        group = db["groups"].find_one({"_id": structure["groupId"]})
        if group != None:
            members = group["members"]
            user = db["users"].find_one({"_id": idDB})
            if user != None:
                members.append(user["_id"])
                db["groups"].update_one(
                    {"_id": group["_id"]}, {"$set": {"members": members}}
                )

                favgroups = user["favGroups"]
                favgroups.append(group["_id"])
                db["users"].update_one(
                    {"_id": idDB}, {"$set": {"favGroups": favgroups}}
                )

                persoSpace = db["personalspaces"].find_one(
                    {"userId": user["_id"]})
                if(persoSpace != None):
                    item = {"type": "group", "element_id": group["_id"]}
                    tab = persoSpace["unsorted"]
                    tab.append(item)
                    db["personalspaces"].update_one({"userId": user["_id"]}, {
                                                    "$set": {"unsorted": tab}})

                role = {
                    "_id": generateID(),
                    "role": {"_id": "member"},
                    "scope": group["_id"],
                    "user": {"_id": user["_id"]},
                    "inheritedRoles": [{"_id": "member"}],
                }
                db["role-assignment"].insert_one(role)


def insertUser(user):

    alreadyExist = db["users"].find_one({"username": user["username"]})
    if alreadyExist == None:
        emails = [{"address": user["emails"], "verified": True}]
        new_user = keycloak_admin.create_user(
            {
                "email": user["emails"],
                "username": user["username"],
                "enabled": True,
                "firstName": user["firstName"],
                "lastName": user["lastName"],
                "credentials": [
                    {
                        "value": user["password"],
                        "type": "password",
                    }
                ],
            },
            exist_ok=False,
        )

        idDB = generateID()
        entry = {
            "_id": idDB,
            "username": user["username"],
            "emails": emails,
            "password": user["password"],
            "structure": user["structure"],
            "firstName": user["firstName"],
            "lastName": user["lastName"],
            "favGroups": [],
            "favServices": [],
            "isActive": True,
        }
        print("[{}] Insert user: {}".format(datetime.now(), entry["username"]))
        db["users"].insert_one(entry)

        persoSpace = {
            "_id": generateID(),
            "userId": idDB,
            "unsorted": [],
            "sorted": [],
        }
        db["personalspaces"].insert_one(persoSpace)

        addUserToStructureGroup(idDB, user["structure"])
        structure = db["structures"].find_one({"_id": user["structure"]})
        if(structure != None):
            if(structure["ancestorsIds"] != None and len(structure["ancestorsIds"]) > 0):
                for struc in structure["ancestorsIds"]:
                    addUserToStructureGroup(idDB, struc)

    else:
        print(
            "[{}] user {} already exists. Pass...".format(
                datetime.now(), alreadyExist["username"]
            )
        )


def insertStructure(structure):
    alreadyExist = db["structures"].find_one({"name": structure["name"]})
    if alreadyExist == None:
        st = {
            "_id": structure["_id"],
            "name": structure["name"],
            "parentId": structure["parentId"],
            "ancestorsIds": structure["ancestorsIds"].split(),
            "childrenIds": structure["childrenIds"].split(),
        }
        db["structures"].insert_one(st)

        keycloak_admin.create_group({"name": structure["name"]})
        group = {
            "_id": generateID(),
            "name": structure["name"],
            "slug": "{}_{}".format(
                structure["_id"], structure["name"].replace(" ", "_")
            ),
            "type": 15,
            "description": "groupe structure",
            "content": "",
            "avatar": "",
            "plugins": {},
            "owner": 0,
            "animators": [],
            "members": [],
            "candidates": [],
            "admins": [],
            "avatar": "",
        }
        print("[{}] Insert group: {}".format(datetime.now(), group["name"]))
        db["groups"].insert_one(group)
        groupDB = db["groups"].find_one({"name": structure["name"]})

        db["structures"].update_one(
            {"name": structure["name"]}, {"$set": {"groupId": groupDB["_id"]}}
        )
    else:
        print(
            "[{}] structure {} already exists. Pass...".format(
                datetime.now(), alreadyExist["name"]
            )
        )


def insertMailExtension(mailExtension):
    alreadyExist = db["asamextensions"].find_one(
        {"extension": mailExtension["extension"]}
    )
    if alreadyExist == None:
        print(
            "[{}] Insert mail extension: {}".format(
                datetime.now(), mailExtension["extension"]
            )
        )
        db["asamextensions"].insert_one(mailExtension)
    else:
        print(
            "[{}] Mail extension {} already exists. Pass...".format(
                datetime.now(), alreadyExist["extension"]
            )
        )


#####################################

if __name__ == "__main__":

    keycloak_admin = get_KC_admin()
    db = get_database()

    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter, description=HELP
    )
    parser.add_argument("-f","--force",action="store_true",help="Force insertion without confirmation")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("-r", "--remove_all", action="store_true", help="remove structures and users before inserting")
    group.add_argument("-u", "--remove_users", action="store_true", help="remove only users before inserting")
    group.add_argument("-s", "--remove_structures", action="store_true", help="remove only structures before inserting")
    args = parser.parse_args()

    csvStructurePath = "structures.csv"
    csvMailPath = "mails.csv"
    csvUserPath = "users.csv"
    
    try:
        # Retrieve line number of csv files
        structureNumber = int(popen(f'wc -l < {csvStructurePath}').read()[:-1]) -1
        mailNumber = int(popen(f'wc -l < {csvMailPath}').read()[:-1]) -1
        userNumber = int(popen(f'wc -l < {csvUserPath}').read()[:-1]) -1
    except:
        exit("\nCould not retrieve line number of csv file.")
    
    if not args.force:
        if input("Confirm insertion of datas [y/N] ? ").lower() not in [
            "y",
            "yes",
        ]:
            parser.print_help()
            exit()

    if args.remove_all:
        resetData()
    elif args.remove_users:
        resetUsers()
    elif args.remove_structures:
        resetStructures()

    if not (isfile(csvStructurePath) and isfile(csvMailPath) and isfile(csvUserPath)):
        parser.print_help()
        exit("Could not find one or more needed csv file in current folder.")

    print("[{}] Start insert structures".format(datetime.now()))
    with open(csvStructurePath, mode="r") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        line_count = 0
        for i,row in enumerate(csv_reader):
            progress("Insert Structures : ", i, structureNumber)
            insertStructure(row)
    # print("======================================================")

    print("[{}] Start insert mails extension".format(datetime.now()))
    with open(csvMailPath, mode="r") as csv_file:
        csv_reader = csv.DictReader(csv_file)

        for i,row in enumerate(csv_reader):
            data = row
            data["_id"] = generateID()
            progress("Insert Mails : ", i, mailNumber)
            insertMailExtension(data)
    # print("======================================================")

    print("[{}] Start insert users".format(datetime.now()))
    with open(csvUserPath, mode="r") as csv_file:
        csv_reader = csv.DictReader(csv_file)

        for i,row in enumerate(csv_reader):
            progress("Insert Users : ", i, userNumber)
            insertUser(row)
    # print("======================================================")
    print("[{}] All operations complete".format(datetime.now()))
