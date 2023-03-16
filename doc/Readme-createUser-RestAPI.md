# createuser Rest API

Used to create a new user.

**Preliminary setup**

This API endpoint will only be available if at least one API key is defined in laboite's settings : private.createUserApiKeys

**URL** : `/api/createuser`

**Method** : `POST`

**X-API-KEY header required** : YES

**Data constraints**

```json
{
  "username": "[string : user login name]",
  "email": "[string : user email]",
  "firstname": "[string : user firstname]",
  "lstname": "[string : user lastname]",
}
```

**Data example**

```json
{
  "username": "bleponge",
  "email": "bleponge@test.fr",
  "firstname": "Bob",
  "lastname": "Leponge",
}
```

**Curl example**

```bash
curl -X  POST -H "X-API-KEY: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" \
     -H "Content-Type: application/json" \
     -d '{"username":"bleponge", "email":"bleponge@test.fr", "firstname":"Bob", "lastname":"Leponge"}' \
     http://localhost:3000/api/createuser
```

## Success Response

- **Code** : `200 OK`
- **Content example** : `user created`

## Error Responses

- **Condition** : If no or bad API-KEY.
- **Code** : `401 Unauthorized`
- **Content** : `API_KEY is required.`

---

- **Condition** : If some param is missing.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: Missing request parameters [restapi.users.createuser.dataMissing]`

---

- **Condition** : If user already exists.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: user already exists [restapi.users.createuser.alreadyExists]`

---

- **Condition** : If error while inserting user in database.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: Error encountered while creating user xxxxx [restapi.users.createuser.insertError]`
