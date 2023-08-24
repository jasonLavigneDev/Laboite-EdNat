# Configuration

Copy `settings-development.json.sample` to `settings-development.json` and update values matching your configuration

## public:

| Key                                      | Type     | Default value                        | Description                                                                                 |
| ---------------------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| keycloakUrl                              | string   | ""                                   | Keycloak URL                                                                                |
| keycloakRealm                            | string   | ""                                   | Keycloak Realm                                                                              |
| offlinePage                              | boolean  | false                                | If true, offline services at signin page                                                    |
| theme                                    | string   | "laboite"                            | laboite or rizomo theme                                                                     |
| appName                                  | string   | "LaBoîte"                            | Application Name                                                                            |
| appDescription                           | string   | ""                                   | Application description, it will be displayed under the title                               |
| keycloackPopupStyle                             | boolean  | false                                | Use popup style for keycloak authentication (non iframe)                                    |
| keycloackPopupStyleIframe                       | boolean  | false                                | Use popup style for keycloak authentication (iframe)                                        |
| enableBBB                                | boolean  | true                                 | If true, Big Blue Button is enabled                                                         |
| BBBUrl                                   | string   | ""                                   | Big Blue Button URL                                                                         |
| minioPort                                | number   | null                                 | Minio port                                                                                  |
| minioEndPoint                            | string   | ""                                   | Minio End Point                                                                             |
| minioBucket                              | string   | ""                                   | Minio Bucket                                                                                |
| imageFilesTypes                          | [string] | ["svg", "png", "jpg", "gif", "jpeg"] | Allowed file extensions for images                                                          |
| audioFilesTypes                          | [string] | ["wav", "mp3", "ogg"]                | Allowed file extensions for sounds                                                          |
| videoFilesTypes                          | [string] | ["mp4", "webm", "avi", "wmv"]        | Allowed file extensions for videos                                                          |
| textFilesTypes                           | [string] | ["pdf", "odt", "txt", "docx"]        | Allowed file extensions for documents                                                       |
| otherFilesTypes                          | [string] | ["csv"]                              | Allowed file extensions for other files                                                     |
| minioFileSize                            | number   | 500000                               | Maximum file size when uploading services images in admin space                             |
| minioStorageFilesSize                    | number   | 3000000                              | Maximum file size when uploading media in user space                                        |
| maxMinioDiskPerUser                      | number   | 1000000                              | Maximum disk capacity per user                                                              |
| NotificationsExpireDays                  | object   | {}                                   | Number of days to keep notications by type (null or 0 for infinite)                         |
| NotificationsExpireDays.setRole          | number   | null                                 | Number of days to keep setRole notications (null or 0 for infinite)                         |
| NotificationsExpireDays.unsetRole        | number   | null                                 | Number of days to keep unsetRole notications (null or 0 for infinite)                       |
| NotificationsExpireDays.request          | number   | null                                 | Number of days to keep request notications (null or 0 for infinite)                         |
| NotificationsExpireDays.group            | number   | null                                 | Number of days to keep group notications (null or 0 for infinite)                           |
| NotificationsExpireDays.default          | number   | null                                 | Number of days to keep no type notications (null or 0 for infinite)                         |
| groupPlugins                             | object   | {}                                   | External plugins for group                                                                  |
| PLUGINNAME                               | object   | {}                                   | General group plugin settings, see below "nextcloud" and "rocketChat" for specific settings |
| groupPlugins.PLUGINNAME.enable           | boolean  | false                                | If true, the group plugin is enabled                                                        |
| groupPlugins.PLUGINNAME.URL              | string   | ""                                   | Group plugin URL                                                                            |
| groupPlugins.PLUGINNAME.groupURL         | string   | ""                                   | [URL]/group/[GROUPSLUG]" "[URL]/apps/files/?dir=/[GROUPNAME]                                |
| groupPlugins.PLUGINNAME.enableChangeName | boolean  | true                                 | If true, changing the group name for this group plugin is possible                          |
| services                                 | object   | {}                                   |
External services urls                                                                      |
| services.agendaUrl                                | string   | ""                          |
External url for agenda                                                                     |
| services.sondagesUrl                              | string   | ""                          |
External url for sondage                                                                    |
| services.mezigUrl                                 | string   | ""                          |
External url for mezig                                                                      |
| services.laboiteBlogUrl                                  | string   | ""                          |
External url for blog                                                                       |
| disabledFeatures                         | object   | {}                                   | add features to disabled                                                                    |
| disabledFeatures.blog                    | boolean  | false                                | disable all blog                                                                            |
| disabledFeatures.groups                  | boolean  | false                                | disable all groups                                                                          |
| disabledFeatures.notificationsTab        | boolean  | false                                | disable notification divided in two tabs                                                    |
| ui.defaultGridViewMode 				   | string   | list | "compact" or "detail" for view mod in groups or service page																					   |
| matomo                                   | object   | null                                 | matomo settings                                                                             |
| matomo.id                                | string   | null                                 | id of the website                                                                           |
| matomo.urlBase                           | string   | null                                 | url of the matomo instance                                                                  |

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

## smtp:

| Key       | Type   | Default value                         | Description                       |
| --------- | ------ | ------------------------------------- | --------------------------------- |
| url       | string | "smtps://USERNAME:PASSWORD@HOST:PORT" | SMTP server URI                   |
| fromEmail | string | ""                                    | Contact mail default "from" value |
| toEmail   | string | ""                                    | Contact mail default "to" value   |

## private:

| Key                   | Type     | Default value                              | Description                                        |
| --------------------- | -------- | ------------------------------------------ | -------------------------------------------------- |
| fillWithFakeData      | boolean  | false                                      | If true, fake datas are generated at start         |
| minioAccess           | string   | ""                                         | Minio user                                         |
| minioSecret           | string   | ""                                         | Minio password                                     |
| apiKeys               | [string] | [""]                                       | API access keys for external services              |
| BBBSecret             | string   | ""                                         | Big Blue Button Secret                             |
| whiteDomains          | [string] | ["^ac-[a-z-]_\\.fr", "^[a-z-]_\\.gouv.fr"] | Emails white domains for user account activation   |
| loginExpirationInDays | number   | 1                                          | Number of days for the token session to expire     |
| cspFrameAncestors     | [string] | ["'self'"]                                 | values for frame-ancestors directive in CSP header |
