import sys
import os
from faker import Faker
from pymongo import MongoClient
from keycloak import KeycloakAdmin
from keycloak import KeycloakOpenIDConnection
from dotenv import load_dotenv
from random import choices
from datetime import datetime
import csv

load_dotenv()
fake = Faker()


structures = {}
mailExtensions = []
users = []

ECOLE_PAR_ACADEMIE = os.getenv("ECOLE_PAR_ACADEMIE")
COLLEGE_PAR_ACADEMIE = os.getenv("COLLEGE_PAR_ACADEMIE")
LYCEE_PAR_ACADEMIE = os.getenv("LYCEE_PAR_ACADEMIE")

PERSONNE_PAR_ECOLE = os.getenv("PERSONNE_PAR_ECOLE")
PERSONNE_PAR_COLLEGE = os.getenv("PERSONNE_PAR_COLLEGE")
PERSONNE_PAR_LYCEE = os.getenv("PERSONNE_PAR_LYCEE")


def generateID():
    st = "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz"
    return "".join(choices(st, k=17))


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
        name = "academie {}".format(ac)

        mainEntry = {
            "_id": generateID(),
            "name": name,
            "parentId": None,
            "ancestorsIds": "",
            "childrenIds": "",
        }

        rows.append(mainEntry)
        generateMailExtension(mainEntry)

        print("[{}] Created structure: {}".format(datetime.now(), name))

        for ec in range(0, int(ECOLE_PAR_ACADEMIE)):
            school_name = "ecole {} ({})".format(ec + 1, name)

            subEntry = {
                "_id": generateID(),
                "name": school_name,
                "parentId": mainEntry["_id"],
                "ancestorsIds": mainEntry["_id"],
                "childrenIds": "",
            }

            rows.append(subEntry)

            generateMailExtension(subEntry)

            structures[subEntry["_id"]] = int(PERSONNE_PAR_ECOLE)

            print(
                "[{}] Elementary School created: {}".format(datetime.now(), school_name)
            )

        print("=============================================")

        for col in range(0, int(COLLEGE_PAR_ACADEMIE)):
            col_name = "college {} ({})".format(col + 1, name)

            subEntry2 = {
                "_id": generateID(),
                "name": col_name,
                "parentId": mainEntry["_id"],
                "ancestorsIds": mainEntry["_id"],
                "childrenIds": "",
            }

            rows.append(subEntry2)

            generateMailExtension(subEntry2)

            structures[subEntry2["_id"]] = int(PERSONNE_PAR_COLLEGE)
            print("[{}] Middle school created: {}".format(datetime.now(), col_name))

        print("=============================================")

        for lyc in range(0, int(LYCEE_PAR_ACADEMIE)):
            lyc_name = "lycee {} ({})".format(lyc + 1, name)

            subEntry3 = {
                "_id": generateID(),
                "name": lyc_name,
                "parentId": mainEntry["_id"],
                "ancestorsIds": mainEntry["_id"],
                "childrenIds": "",
            }

            rows.append(subEntry3)

            generateMailExtension(subEntry3)

            structures[subEntry3["_id"]] = int(PERSONNE_PAR_LYCEE)
            print("[{}] High school created: {}".format(datetime.now(), lyc_name))

        print("=============================================")
        print("=============================================")

    print("[{}] Creation of CSV".format(datetime.now()))
    with open("structures.csv", "w", encoding="UTF8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    print("=============================================")


def generateUser(id, structure):

    mailExtension = next(
        (x for x in mailExtensions if x["structureId"] == structure), None
    )

    if mailExtension != None:

        name = fake.name()
        username = name.lower().replace(" ", "_") + str(id)
        mail = username + "@" + mailExtension["extension"]

        usernameAllreadyExist = any(x for x in users if x["username"] == username)
        if usernameAllreadyExist:
            return generateUser(id, structure)

        firstname = name.split(" ")[0]
        lastname = name.split(" ")[1]

        idDB = generateID()

        entry = {
            "username": username,
            "emails": mail,
            "password": "123",
            "structure": structure,
            "firstName": firstname,
            "lastName": lastname,
            "favGroups": [],
            "favServices": [],
            "isActive": True,
        }

        users.append(entry)
        # print(
        #     "[{}] Creation of user: {} {} ({})".format(
        #         datetime.now(), firstname, lastname, mail
        #     )
        # )
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

    print("=============================================")


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

    print("=============================================")


nbStruc = int(sys.argv[1])
if nbStruc > 0:
    generateCSVForStructure(nbStruc)

generateCSVForMailExtensions()

for key in structures:
    for i in range(0, structures.get(key)):
        generateUser(i, key)

generateCSVForUsers()
