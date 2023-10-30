# CreateUser Rest API

Used to create an user in database.

**Preliminary setup**

This API endpoint will only be available if at least one API key is defined in createUserApiKeys tab in settings

In order to work, the API-KEY must be define in createUserApiKeys

```json
{
  "createUserApiKeys": ["createuser-password", "createuser-password2"],
  "createUserApiKeysByStructure": {
    "createuser-password": ["structure1", "structure2"]
  }
}
```

**URL** : `/api/createuser`

**Method** : `POST`

**X-API-KEY header required** : YES

**Data constraints**

This API call requires username, firstname, lastname and email to identify user, structure is not necessary because user can choose his structure while he's login for the first time on the app

```json
{
  "username": "[string : user login name]",
  "firstname": "[string : user first name]",
  "lastname": "[string : user last name]",
  "email": "[string : user email]",

  "structure": "[optional string : structure assign to user]"
}
```

**Data example**

```json
{
  "username": "usern",
  "firstname": "userf",
  "lastname": "userl",
  "email": "userf.userl@mail.fr",

  "structure": "structurename"
}
```

**Curl example**

```bash
curl -X  POST -H "X-API-KEY: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" \
     -H "Content-Type: application/json" \
     -d '{"username":"user01", "firstname": "userf", "lastname": "userl", "email": "userf.userl@mail.fr" }' \
     http://localhost:3000/api/createuser
```

**Or, with structure**

```bash
curl -X  POST -H "X-API-KEY: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" \
     -H "Content-Type: application/json" \
     -d '{"username":"user01", "firstname": "userf", "lastname": "userl", "email": "userf.userl@mail.fr", "structure": "structurename" }' \
     http://localhost:3000/api/createuser
```

## Success Response

- **Content example** : `{"response":"user created"}`

## Error Responses

- **Condition** : If no or bad API-KEY.
- **Content** : `API_KEY is required.`

---

- **Condition** : If structure given exist and isn't in tab of the object createUserApiKeysByStructure in settings.
- **Content** : `Error: Error encountered while creating user whith structure StructureName [Structure not allowed to create users]`

---

- **Condition** : If user already exist.
- **Content** : `Error: user already exists with this email: user@mail.fr [restapi.users.createuser.emailExists]`
