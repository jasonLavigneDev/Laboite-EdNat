# Configuration

Copy `settings-development.json.sample` to `settings-development.json` and update values matching your configuration

## public:

| Key                                      | Type                          | Default value                        | Description                                                                                 |
| ---------------------------------------- | ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| keycloakUrl                              | string                        | ""                                   | Keycloak URL                                                                                |
| keycloakRealm                            | string                        | ""                                   | Keycloak Realm                                                                              |
| offlinePage                              | boolean                       | false                                | If true, offline services at signin page                                                    |
| theme                                    | string                        | "laboite"                            | laboite or rizomo theme                                                                     |
| appName                                  | string                        | "LaBoîte"                            | Application Name                                                                            |
| appDescription                           | string                        | ""                                   | Application description, it will be displayed under the title                               |
| keycloackPopupStyle                      | boolean                       | false                                | Use popup style for keycloak authentication (non iframe)                                    |
| keycloackPopupStyleIframe                | boolean                       | false                                | Use popup style for keycloak authentication (iframe)                                        |
| loginWithTokenUrls                       | string                        | "\*"                                 | Restrain API using to specific                                                              |
| URL                                      |
| enableBBB                                | boolean                       | true                                 | If true, Big Blue Button is enabled                                                         |
| BBBUrl                                   | string                        | ""                                   | Big Blue Button URL                                                                         |
| minioPort                                | number                        | null                                 | Minio port                                                                                  |
| minioEndPoint                            | string                        | ""                                   | Minio End Point                                                                             |
| minioBucket                              | string                        | ""                                   | Minio Bucket                                                                                |
| imageFilesTypes                          | [string]                      | ["svg", "png", "jpg", "gif", "jpeg"] | Allowed file extensions for images                                                          |
| audioFilesTypes                          | [string]                      | ["wav", "mp3", "ogg"]                | Allowed file extensions for sounds                                                          |
| videoFilesTypes                          | [string]                      | ["mp4", "webm", "avi", "wmv"]        | Allowed file extensions for videos                                                          |
| textFilesTypes                           | [string]                      | ["pdf", "odt", "txt", "docx"]        | Allowed file extensions for documents                                                       |
| otherFilesTypes                          | [string]                      | ["csv"]                              | Allowed file extensions for other files                                                     |
| minioFileSize                            | number                        | 500000                               | Maximum file size when uploading services images in admin space                             |
| minioStorageFilesSize                    | number                        | 3000000                              | Maximum file size when uploading media in user space                                        |
| maxMinioDiskPerUser                      | number                        | 1000000                              | Maximum disk capacity per user                                                              |
| NotificationsExpireDays                  | object                        | {}                                   | Number of days to keep notications by type (null or 0 for infinite)                         |
| NotificationsExpireDays.setRole          | number                        | null                                 | Number of days to keep setRole notications (null or 0 for infinite)                         |
| NotificationsExpireDays.unsetRole        | number                        | null                                 | Number of days to keep unsetRole notications (null or 0 for infinite)                       |
| NotificationsExpireDays.request          | number                        | null                                 | Number of days to keep request notications (null or 0 for infinite)                         |
| NotificationsExpireDays.group            | number                        | null                                 | Number of days to keep group notications (null or 0 for infinite)                           |
| NotificationsExpireDays.default          | number                        | null                                 | Number of days to keep no type notications (null or 0 for infinite)                         |
| groupPlugins                             | object                        | {}                                   | External plugins for group                                                                  |
| PLUGINNAME                               | object                        | {}                                   | General group plugin settings, see below "nextcloud" and "rocketChat" for specific settings |
| groupPlugins.PLUGINNAME.enable           | boolean                       | false                                | If true, the group plugin is enabled                                                        |
| groupPlugins.PLUGINNAME.URL              | string                        | ""                                   | Group plugin URL                                                                            |
| groupPlugins.PLUGINNAME.groupURL         | string                        | ""                                   | [URL]/group/[GROUPSLUG]" "[URL]/apps/files/?dir=/[GROUPNAME]                                |
| groupPlugins.PLUGINNAME.enableChangeName | boolean                       | true                                 | If true, changing the group name for this group plugin is possible                          |
| services                                 | object                        | {}                                   |                                                                                             |
| External services urls                   |                               |                                      |                                                                                             |
| services.agendaUrl                       | string                        | ""                                   |                                                                                             |
| External url for agenda                  |                               |                                      |                                                                                             |
| services.sondagesUrl                     | string                        | ""                                   |                                                                                             |
| External url for sondage                 |                               |                                      |                                                                                             |
| services.mezigUrl                        | string                        | ""                                   |                                                                                             |
| External url for mezig                   |                               |                                      |                                                                                             |
| services.laboiteBlogUrl                  | string                        | ""                                   |                                                                                             |
| External url for blog                    |                               |                                      |                                                                                             |
| disabledFeatures                         | object                        | {}                                   | add features to disabled                                                                    |
| disabledFeatures.blog                    | boolean                       | false                                | disable all blog                                                                            |
| disabledFeatures.groups                  | boolean                       | false                                | disable all groups                                                                          |
| disabledFeatures.notificationsTab        | boolean                       | false                                | disable notification divided in two tabs                                                    |
| disabledFeatures.bookmarksFromClipboard  | boolean                       | false                                | Read clipboard to propose bookmark creation from it                                         |
| disabledFeatures.franceTransfert         | boolean                       | false                                | Dsiplay france transfert menu                                                               |
| ui.defaultGridViewMode                   | string                        | list                                 | "compact" or "detail" for view mod in groups or service page                                |
| ui.hideLoginForm                         | boolean                       |                                      |                                                                                             |
| ui.defaultGridViewMode                   | boolean                       |                                      |                                                                                             |
| ui.isBusinessRegroupingMode              | boolean                       |                                      |                                                                                             |
| ui.feedbackLink                          | string                        |                                      | Feedback link to redirect to in the user menu                                               |
| matomo                                   | object                        | null                                 | matomo settings                                                                             |
| matomo.id                                | string                        | null                                 | id of the website                                                                           |
| matomo.urlBase                           | string                        | null                                 | url of the matomo instance                                                                  |
| countly.app_key                          | string                        | null                                 |                                                                                             |
| countly.url                              | string                        | null                                 |                                                                                             |
| forceRedirectToPersonalSpace             | boolean                       | true                                 | User will always be redirected to /personal at ech refresh                                  |
| appName                                  | string                        | null                                 |                                                                                             |
| onBoarding.enabled                       | boolean                       | false                                |                                                                                             |
| onBoarding.appDesignation                | string                        | null                                 | Name of the app used in the onboarding                                                      |
| features                                 | ["franceTransfert" \| string] | []                                   | List of enabled features                                                                    |
| widget.packageUrl                        | string                        | null                                 | Url pointing towards the widget script. If null the widget will not be enabled              |
| chatbotUrl                               | string                        | null                                 | Url pointing towards a chatbot instance.                                                    |

## keycloak:

| Key           | Type     | Default value | Description             |
| ------------- | -------- | ------------- | ----------------------- |
| pubkey        | string   | ""            | Keycloak public key     |
| client        | string   | "sso"         | Keycloak client type    |
| adminEmails   | [string] | []            | Keycloak admin emails   |
| adminUser     | string   | ""            | Keycloak admin user     |
| adminPassword | string   | ""            | Keycloak admin password |

## nextcloud:

| Key                 | Type     | Default value | Description                                      |
| ------------------- | -------- | ------------- | ------------------------------------------------ |
| nextcloudUser       | string   | ""            | Nextcloud user for user creation                 |
| nextcloudPassword   | string   | ""            | Nextcloud password for user creation             |
| circlesUser         | string   | ""            | Nextcloud user for circle and share creation     |
| circlesPassword     | string   | ""            | Nextcloud password for circle and share creation |
| nextcloudQuota      | number   | "1073741824"  | Nextcloud quota                                  |
| nextcloudApiKeys    | [string] | []            | API keys for nextcloud token retrieval           |
| sessionTokenKey     | string   | ""            | Password used to get token from sessiontoken app |
| sessionTokenAppName | string   | ""            | Application name given to sessiontoken app       |

## rocketChat:

| Key                | Type   | Default value | Description         |
| ------------------ | ------ | ------------- | ------------------- |
| rocketChatUser     | string | ""            | RocketChat user     |
| rocketChatPassword | string | ""            | RocketChat password |

## franceTransfert:

| Key      | Type   | Default value | Description                   |
| -------- | ------ | ------------- | ----------------------------- |
| apiKey   | string | ""            | France Transfert API KEY      |
| endpoint | string | ""            | France Transfert instance URL |

## monti:

| Key       | Type   | Default value | Description     |
| --------- | ------ | ------------- | --------------- |
| appId     | string | ""            | MontiAPM app ID |
| appSecret | string | ""            | MontiAPM Secret |

## smtp:

| Key       | Type   | Default value                         | Description                       |
| --------- | ------ | ------------------------------------- | --------------------------------- |
| url       | string | "smtps://USERNAME:PASSWORD@HOST:PORT" | SMTP server URI                   |
| fromEmail | string | ""                                    | Contact mail default "from" value |
| toEmail   | string | ""                                    | Contact mail default "to" value   |

## private:

| Key                    | Type     | Default value                              | Description                                        |
| ---------------------- | -------- | ------------------------------------------ | -------------------------------------------------- |
| fillWithFakeData       | boolean  | false                                      | If true, fake datas are generated at start         |
| minioAccess            | string   | ""                                         | Minio user                                         |
| minioSecret            | string   | ""                                         | Minio password                                     |
| apiKeys                | [string] | [""]                                       | API access keys for external services              |
| BBBSecret              | string   | ""                                         | Big Blue Button Secret                             |
| whiteDomains           | [string] | ["^ac-[a-z-]_\\.fr", "^[a-z-]_\\.gouv.fr"] | Emails white domains for user account activation   |
| loginExpirationInDays  | number   | 1                                          | Number of days for the token session to expire     |
| cspFrameAncestors      | [string] | ["'self'"]                                 | values for frame-ancestors directive in CSP header |
| createUserApiKeys      | [string] | []                                         | Api key to create user from the api                |
| createUserTokenApiKeys | [string] | []                                         | Api key to create login token from the api         |
