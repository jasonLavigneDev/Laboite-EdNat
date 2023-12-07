# CreateUserToken Rest API

Used to create a connection token for user

**Preliminary setup**

Similar to /createUser, this API endpoint will only be available if at least one API key is defined in createUserApiKeys tab in settings

In order to work, the API-KEY must be define in createUserApiKeys

```json
{
  "createUserTokenApiKeys": ["createusertoken-password"],
  "createUserTokenApiKeysByStructures": {
    "createusertoken-password": ["structure1", "structure2"]
  }
}
```

**URL** : `/api/createusertoken`

**Method** : `POST`

**X-API-KEY header required** : YES

**Data constraints**

This API call requires email to identify user, structure is find with user's mail extension and used to check if this structure can create a connection token

```json
{
  "email": "[string : user email]"
}
```

**Data example**

```json
{
  "email": "userf.userl@mail.fr"
}
```

**Curl example**

```bash
curl -iX POST -H "X-API-KEY: createusertoken-password" \
    -H "Content-Type: application/json" \
    -d '{"email":"userf.userl@mail.fr"}' \
    http://localhost:3000/api/createusertoken
```

## Success Response

- **Content example** : `{"response":{"token":"XXXXXXXXXXXXXXXXXXXXXX","when":"AAAA-MM-JJ_Time"}}`

## Error Responses

- **Condition** : If no or bad API-KEY.
- **Content** : `API_KEY is required.`

---

- **Condition** : If structure given exist and isn't in tab of the object createUserTokenApiKeysByStructure in settings.
- **Content** : `Error: Error encountered while creating userf.userl@mail.fr user token [This structure is not allow to create a connection token]`

---

- **Condition** : If user doesn't exist.
- **Content** : `Error: user userf.userl@mail.fr  is not existing [restapi.users.createusertoken.notExisting]`
