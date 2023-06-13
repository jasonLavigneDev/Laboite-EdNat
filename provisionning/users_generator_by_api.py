import sys
import os
from faker import Faker
fake = Faker()


def execUserGenerator(id):
    name = fake.name()
    mail = name.replace(' ', '.') + '_' + str(id) + '@ac-test.fr'
    print(mail)

    firstName = name.split(' ')[0]
    lastName = name.split(' ')[1]

    username = name.replace(' ', '-')

    cmd = '''curl -iX  POST -H "X-API-KEY: createuser-password" -H "Content-Type: application/json" - d
    '{"username":"''' + username + '''", "email":"''' + mail + '''", "firstname":"''' + firstname + ''''", "lastname":"''' + lastname + '''"}'
    http://localhost:3000/api/createuser'''

    print(cmd)
    # os.system('cmd')


nb = int(sys.argv[1])

for i in range(0, nb):
    execUserGenerator(i)
