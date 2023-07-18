### Description

The script allows the creation of a specified number of structures in the database and keycloak used by LaBoite. Each structures will be filled by a large amount of users, created by the script. The goal is to test the integrity project, and to identify any performance issues with high amount of users. 


### Install

requirements.txt contains all import necessary for scripts to work.

```pip install -r requirements.txt```

The script needs a well formed .env file.
- KEYCLOAK_URL: URL of keycloak
- KEYCLOAK_REALM: Realm to use to create and store users and structures groups
- KEYCLOAK_USERNAME: An administrator username
- KEYCLOAK_PASSWORD: An administrator password
- KEYCLOAK_CLIENT_ID: Keycloak client to use
- ECOLE_PAR_ACADEMIE: Number of school by academy (structure)
- COLLEGE_PAR_ACADEMIE: Number of middle-school by academy (structure)
- LYCEE_PAR_ACADEMIE: Number of high-school by academy (structure)
- PERSONNE_PAR_ECOLE: Number of users by school
- PERSONNE_PAR_COLLEGE: Number of users by middle-school
- PERSONNE_PAR_LYCEE: Number of users by high-school
- MONGO_URI: URI of mongo database
- MONGO_DATABASE: name of mongo database


The script also requires an active LaBoite setup.


### Usage

python3 users_generator.py <nb of structures> (<-r>)

-r is optional and it allows to reset all existing users and groups of keycloak