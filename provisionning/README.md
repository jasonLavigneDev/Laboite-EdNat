### Description

These scripts allow the creation of a specified number of users in the database used by LaBoite. The goal is to test the integrity project, and to identify any performance issues with high amount of users. 

For now, it's possible to create users with API (users_generator_by_api)


### Install

requirements.txt contains all import necessary for scripts to work.

```pip install -r requirements.txt```

The API script needs some environment variables:
- MONGO_URI (example: mongodb://localhost:3001/meteor)


These scripts requires an active LaBoite setup.


### Usage

python3 users_generator_by_db.py <nb of structures> <nb of users>