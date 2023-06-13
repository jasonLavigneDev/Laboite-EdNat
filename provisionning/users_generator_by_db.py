import sys
import os
import random
from faker import Faker
from pymongo import MongoClient

fake = Faker()


def get_database():

    mongo_uri = os.getenv('MONGO_URI')
    client = MongoClient(mongo_uri)
    return client['meteor']


def getRandomStructure():
    allStructures = db['structures'].find()
    rand = random.randrange(db['structures'].count_documents({}))
    return allStructures[rand]["_id"]


def execUserGenerator(id):
    name = fake.name()
    mail = name.replace(' ', '.') + '_' + str(id) + '@ac-test.fr'

    firstname = name.split(' ')[0]
    lastname = name.split(' ')[1]

    username = name.replace(' ', '-')

    emails = [{"address": mail, "verified": True}]

    structure = getRandomStructure()

    user = db['users'].find_one({"username": mail})
    if user == None:
        entry = {
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

    else:
        execUserGenerator(id)


db = get_database()

nb = int(sys.argv[1])
for i in range(0, nb):
    execUserGenerator(i)
