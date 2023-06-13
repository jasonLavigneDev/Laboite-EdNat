import sys
import os
from faker import Faker
fake = Faker()


def execUserGenerator(id):
    name = fake.name()
    mail = name.replace(' ', '.') + '_' + str(id) + '@ac-test.fr'
    print(mail)

    firstname = name.split(' ')[0]
    lastname = name.split(' ')[1]

    cmd = '''curl -iX  POST -H "X-API-KEY: createuser-password" -H "Content-Type: application/json" -d '{"username":"''' + mail + \
        '''", "email":"''' + mail + '''", "firstname":"''' + firstname + \
        '''", "lastname":"''' + lastname + '''"}' http://localhost:3000/api/createuser'''

    os.system(cmd)


nb = int(sys.argv[1])

for i in range(0, nb):
    execUserGenerator(i)
