### Description

The script allows the creation of a specified number of structures and users in the database and keycloak used by LaBoite. The goal is to test the integrity project, and to identify any performance issues with high amount of users. 


### Install

requirements.txt contains all import necessary for scripts to work.

```pip install -r requirements.txt```

The script needs a well formed .env file.
- KEYCLOAK_URL: URL of keycloak
- KEYCLOAK_REALM: Realm to use to create and store users and structures groups
- KEYCLOAK_USERNAME: An administrator username
- KEYCLOAK_PASSWORD: An administrator password
- KEYCLOAK_CLIENT_ID: Keycloak client to use


The script also requires an active LaBoite setup.


### Usage

python3 users_generator.py <nb of structures> <nb of users> (<-r>)

-r is optional and it allows to reset all existing users and groups of keycloak