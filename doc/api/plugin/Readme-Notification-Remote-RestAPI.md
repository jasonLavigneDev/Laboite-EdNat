# Notifications Remote Server Rest API

Used to get notifications for a single user.

Find out the API sremote server API of your instance
Each user has a unique auth token to use this api, they can find it in their profile page

**URL** : `/api/notifications/me`

**Method** : `GET`

**x-auth-token required** : YES

**Curl example to get single user notifications**

```bash
curl GET -H "x-auth-token: my_ultra_secure_token_from_rizomo/laboite" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/notifications/me
```

---

## Success Response

- **Code** : `200 OK`
- **Content example for single user notifications data** :

```json
{
  "code": 200,
  "status": "success",
  "message": "this is a success",
  "data": [
    {
      "_id": "eLGtPJf6HWpS2TnLg",
      "title": "une notif",
      "content": "Un contenu incroyablement intéressant",
      "type": "info",
      "userId": "m7dAFnnXcYExNKAEX",
      "read": false,
      "createdAt": "2022-02-07T11:08:29.246Z"
    }
  ]
}
```

## Error Responses

- **Condition** : If no or bad AUTH-TOKEN.
- **Code** : `401 Unauthorized`
- **Content** : `x-auth-token is required.`
