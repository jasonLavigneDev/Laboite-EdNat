# Nextcloud Token Rest API

Used to retrieve a Nextcloud session token for a given user.

**Preliminary setup**

This API endpoint will only be available if at least one API key is defined in laboite's settings : nextcloud.nextcloudApiKeys

In order to work, it also requires the two following settings :
- nextcloud.sessionTokenKey: password for fetching token in Nextcloud sessiontoken app
- nextcloud.sessionTokenAppName: application name sent to Nextcloud sessiontoken app


**URL** : `/api/nctoken`

**Method** : `POST`

**X-API-KEY header required** : YES

**Data constraints**

```json
{
  "username": "[string : user login name]",
}
```

**Data example**

```json
{
  "username": "user01",
}
```

**Curl example**

```bash
curl -X  POST -H "X-API-KEY: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" \
     -H "Content-Type: application/json" \
     -d '{"username":"user01"}' \
     http://localhost:3000/api/nctoken
```

## Success Response

- **Code** : `200 OK`
- **Content example** : `{"nclocator":"https://nuage03.pp.appseducation.org","nctoken":"XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"}` (newly created notification ID)

## Error Responses

- **Condition** : If no or bad API-KEY.
- **Code** : `401 Unauthorized`
- **Content** : `API_KEY is required.`

---

- **Condition** : If no username param.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: User does not exist. [restapi.notifications.addNotifications.unknownUser]`

---

- **Condition** : If unknown username.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: request sent to API with no username [restapi.nextcloud.getNcToken.dataWithoutUsername]`

---

- **Condition** : If error while retrieving token via Nextcloud sessiontoken app.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: Error while retrieving Nextcloud token for user xxxxx [restapi.nextcloud.getNcToken.tokenRequestError]`
