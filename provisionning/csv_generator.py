#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from sys import argv, exit
from os import getenv
from os.path import isfile
from faker import Faker
from dotenv import load_dotenv
from datetime import datetime
import csv
from utils import *

load_dotenv()
fake = Faker()

structures = {}
mailExtensions = []
users = []
userCount = 0

ECOLE_PAR_ACADEMIE = int(getenv("ECOLE_PAR_ACADEMIE"))
COLLEGE_PAR_ACADEMIE = int(getenv("COLLEGE_PAR_ACADEMIE"))
LYCEE_PAR_ACADEMIE = int(getenv("LYCEE_PAR_ACADEMIE"))

PERSONNE_PAR_ECOLE = int(getenv("PERSONNE_PAR_ECOLE"))
PERSONNE_PAR_COLLEGE = int(getenv("PERSONNE_PAR_COLLEGE"))
PERSONNE_PAR_LYCEE = int(getenv("PERSONNE_PAR_LYCEE"))

DEFAULT_PASSWORD = "Eole-123456!"
INITIAL_ACA = 1     # Nombre à ajouter au numéro d'académie


def generateMailExtension(struc):
    extension = "{}.fr".format(
        struc["name"].replace(" ", "-").replace("(", "").replace(")", "")
    )
    extension = extension.replace("-academie", ".academie")
    mailExtension = {
        "extension": extension,
        "entiteNomCourt": "",
        "entiteNomLong": "",
        "familleNomCourt": "",
        "familleNomLong": "",
        "structureId": struc["_id"],
    }
    mailExtensions.append(mailExtension)


def generateCSVForStructure(nb):
    rows = []
    headers = ["_id", "name", "parentId", "ancestorsIds", "childrenIds"]
    for ac in range(0, nb):
        name = "academie {}".format(ac+INITIAL_ACA)

        mainEntry = {
            "_id": generateID(),
            "name": name,
            "parentId": None,
            "ancestorsIds": [],
            "childrenIds": [],
        }


        # print("[{}] Created structure: {}".format(datetime.now(), name))

        for ec in range(0, ECOLE_PAR_ACADEMIE):
            school_name = "ecole {} ({})".format(ec + 1, name)
            subEntry = {
                "_id": generateID(),
                "name": school_name,
                "parentId": mainEntry["_id"],
                "ancestorsIds": [mainEntry["_id"]],
                "childrenIds": [],
            }
            mainEntry["childrenIds"].append(subEntry["_id"])

            rows.append(subEntry)

            generateMailExtension(subEntry)

            structures[subEntry["_id"]] = PERSONNE_PAR_ECOLE

        #     print(
        #         "[{}] Elementary School created: {}".format(datetime.now(), school_name)
        #     )

        # print("=============================================")

        for col in range(0, COLLEGE_PAR_ACADEMIE):
            col_name = "college {} ({})".format(col + 1, name)

            subEntry2 = {
                "_id": generateID(),
                "name": col_name,
                "parentId": mainEntry["_id"],
                "ancestorsIds": [mainEntry["_id"]],
                "childrenIds": [],
            }
            mainEntry["childrenIds"].append(subEntry2["_id"])

            rows.append(subEntry2)

            generateMailExtension(subEntry2)

            structures[subEntry2["_id"]] = PERSONNE_PAR_COLLEGE
        #     print("[{}] Middle school created: {}".format(datetime.now(), col_name))

        # print("=============================================")

        for lyc in range(0, LYCEE_PAR_ACADEMIE):
            lyc_name = "lycee {} ({})".format(lyc + 1, name)

            subEntry3 = {
                "_id": generateID(),
                "name": lyc_name,
                "parentId": mainEntry["_id"],
                "ancestorsIds": [mainEntry["_id"]],
                "childrenIds": [],
            }
            mainEntry["childrenIds"].append(subEntry3["_id"])

            rows.append(subEntry3)

            generateMailExtension(subEntry3)

            structures[subEntry3["_id"]] = PERSONNE_PAR_LYCEE
    #         print("[{}] High school created: {}".format(datetime.now(), lyc_name))

    #     print("=============================================")
    #     print("=============================================")
        rows.append(mainEntry)
        generateMailExtension(mainEntry)

    print("[{}] Creation of CSV: structures.csv".format(datetime.now()))
    with open("structures.csv", "w", encoding="UTF8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    # print("=============================================")


def generateUser(structure):
    global userCount

    mailExtension = next((x["extension"] for x in mailExtensions if x["structureId"] == structure), None)

    if mailExtension != None:

        name = fake.name()
        userCount += 1
        username = name.lower().replace(" ", "_").replace(".", "") + str(userCount)
        mail = username + "@" + mailExtension

        firstname = name.split(" ")[0]
        lastname = name.split(" ")[1]

        entry = {
            "username": username,
            "emails": mail,
            "password": DEFAULT_PASSWORD,
            "structure": structure,
            "firstName": firstname,
            "lastName": lastname,
            "favGroups": [],
            "favServices": [],
            "isActive": True,
        }

        users.append(entry)

        # print(userCount)
        progress("Generate Users : ", userCount, userNumber)
        # print("=============================================")
        return


def generateCSVForMailExtensions():

    print("[{}] Creation of CSV: mails.csv".format(datetime.now()))
    headers = [
        "extension",
        "entiteNomCourt",
        "entiteNomLong",
        "familleNomCourt",
        "familleNomLong",
        "structureId",
    ]
    with open("mails.csv", "w", encoding="UTF8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(mailExtensions)

    # print("=============================================")


def generateCSVForUsers():
    print("[{}] Creation of CSV: users.csv".format(datetime.now()))
    headers = [
        "username",
        "emails",
        "password",
        "structure",
        "firstName",
        "lastName",
        "favGroups",
        "favServices",
        "isActive",
    ]

    with open("users.csv", "w", encoding="UTF8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(users)

    # print("=============================================")


#####################################

if __name__ == "__main__":

    # Confirmation de l'écrasement des fichiers csv pré-existants
    if isfile("users.csv") or isfile("mails.csv") or isfile("structures.csv"):
        confirm = input("Overwrites files users.csv, mails.csv and structures.csv ? [yN] ")
        if confirm != "y":
            exit("\nExit script.")

    nbStruc = int(argv[1])
    if nbStruc > 0:
        generateCSVForStructure(nbStruc)

    generateCSVForMailExtensions()


    userNumber = nbStruc * (PERSONNE_PAR_ECOLE * ECOLE_PAR_ACADEMIE + PERSONNE_PAR_COLLEGE * COLLEGE_PAR_ACADEMIE + PERSONNE_PAR_LYCEE * LYCEE_PAR_ACADEMIE)
    for key in structures:
        for i in range(0, structures.get(key)):
            generateUser(key)

    generateCSVForUsers()
