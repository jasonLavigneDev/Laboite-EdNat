import { Mongo } from 'meteor/mongo';

/**
 * @typedef {Object} NotificationExpireSettings
 *
 * @property {?number} setRole - Expiry in days for setting role notifications.
 * @property {?number} unsetRole - Expiry in days for unsetting role notifications.
 * @property {?number} request - Expiry in days for request notifications.
 * @property {?number} group - Expiry in days for group notifications.
 * @property {?number} default - Default expiry in days for notifications.
 */

/**
 * @typedef {Object} PluginSettings
 *
 * @property {boolean} enable - Specifies if the plugin is enabled.
 * @property {string} URL - URL for the plugin.
 * @property {string} groupURL - URL format for groups in the plugin.
 * @property {boolean} enableChangeName - Flag determining if changing names is allowed.
 */

/**
 * @typedef {Object} GroupPlugins
 *
 * @property {PluginSettings} rocketChat - Settings for the RocketChat plugin.
 * @property {PluginSettings} nextcloud - Settings for the Nextcloud plugin.
 */

/**
 * @typedef {Object} Services
 *
 * @property {string} agendaUrl - URL for the agenda service.
 * @property {string} sondagesUrl - URL for the sondages service.
 * @property {string} mezigUrl - URL for the mezig service.
 * @property {string} laboiteBlogURL - URL for the Laboite blog.
 * @property {string} questionnaireURL - URL for the questionnaire service.
 */

/**
 * @typedef {Object} FranceTransfert
 *
 * @property {string} apiKey - API key for France Transfert.
 * @property {string} endpoint - Endpoint URL for France Transfert.
 */

/**
 * @typedef {Object} KeycloakSettings
 *
 * @property {string} pubkey - Public key for Keycloak.
 * @property {string} client - Client name (e.g., "sso").
 * @property {string[]} adminEmails - List of administrative emails for Keycloak.
 * @property {string} adminUser - Admin username for Keycloak.
 * @property {string} adminPassword - Admin password for Keycloak.
 */

/**
 * @typedef {Object} NextcloudSettings
 *
 * @property {string} nextcloudUser - User for Nextcloud.
 * @property {string} nextcloudPassword - Password for Nextcloud user.
 * @property {string} circlesUser - User for Circles in Nextcloud.
 * @property {string} circlesPassword - Password for Circles user in Nextcloud.
 * @property {string} nextcloudQuota - Quota for Nextcloud in bytes.
 * @property {string[]} nextcloudApiKeys - List of API keys for Nextcloud.
 * @property {string} sessionTokenKey - Token key for Nextcloud sessions.
 * @property {string} sessionTokenAppName - App name associated with Nextcloud session token.
 */

/**
 * @typedef {Object} RocketChatSettings
 *
 * @property {string} rocketChatUser - Username for RocketChat.
 * @property {string} rocketChatPassword - Password for RocketChat user.
 */

/**
 * @typedef {Object} SmtpSettings
 *
 * @property {string} url - SMTP URL in the format "smtps://USERNAME:PASSWORD@HOST:PORT".
 * @property {string} fromEmail - Email address for the sender (from).
 * @property {string} toEmail - Default email address for the recipient (to).
 */

/**
 * @typedef {Object} PublicSettings
 *
 * @property {string} appName - Name of the application.
 * @property {string} appDescription - Description of the application.
 * @property {boolean} offlinePage - Whether offline page is enabled.
 * @property {string} keycloakUrl - URL for Keycloak authentication.
 * @property {string} keycloakRealm - Realm for Keycloak authentication.
 * @property {string} theme - Theme name for the application.
 * @property {boolean} keycloackPopupStyle - Whether to use popup style for Keycloak.
 * @property {boolean} keycloackPopupStyleIframe - Whether to use iframe style for Keycloak.
 * @property {string} loginWithTokenUrls - URLs for login with token.
 *
 * @property {Object} disabledFeatures - Features that can be enabled or disabled.
 * @property {boolean} disabledFeatures.blog - Whether the blog feature is disabled.
 * @property {boolean} disabledFeatures.notificationsTab - If the notifications tab is disabled.
 * @property {boolean} disabledFeatures.groups - If the groups feature is disabled.
 * @property {boolean} disabledFeatures.analytics - If the analytics feature is disabled.
 * @property {boolean} disabledFeatures.introductionTab - If the introduction tab is disabled.
 * @property {boolean} disabledFeatures.introductionTabStructuresInfos - If the introduction tab structures infos feature is disabled.
 * @property {boolean} disabledFeatures.menuAdminDefaultSpaces - If the menu admin default spaces feature is disabled.
 * @property {boolean} disabledFeatures.mediaStorageMenu - If the media storage menu feature is disabled.
 * @property {boolean} disabledFeatures.bookmarksFromClipboard - If the bookmarks from clipboard feature is disabled.
 *
 * @property {Object} ui - UI related configurations.
 * @property {string} ui.defaultGridViewMode - Default grid view mode.
 * @property {boolean} ui.isBusinessRegroupingMode - Business regrouping mode status.
 * @property {string} ui.feedbackLink - Link for feedback.
 *
 * @property {Object} matomo - Matomo related configurations.
 * @property {number} matomo.siteId - Site ID for Matomo tracking.
 * @property {string} matomo.urlBase - Base URL for Matomo.
 *
 * @property {Object} onBoarding - Onboarding related configurations.
 * @property {boolean} onBoarding.enabled - Whether onboarding is enabled.
 * @property {string} onBoarding.appDesignation - Designation of the app during onboarding.
 *
 * @property {Object} countly - Countly related configurations.
 * @property {string} countly.app_key - App key for Countly.
 * @property {string} countly.url - URL for Countly.
 * @property {boolean} countly.consent - Consent setting for Countly.
 *
 * @property {string} laboiteBlogURL - URL for the application's blog.
 * @property {boolean} enableBBB - Whether BigBlueButton (BBB) is enabled.
 * @property {string} BBBUrl - URL for BigBlueButton.
 *
 * @property {number|null} minioPort - Port for MinIO.
 * @property {string} minioEndPoint - Endpoint for MinIO.
 * @property {string} minioBucket - Bucket name for MinIO.
 * @property {string[]} imageFilesTypes - Supported image file types.
 * @property {string[]} audioFilesTypes - Supported audio file types.
 * @property {string[]} videoFilesTypes - Supported video file types.
 * @property {string[]} textFilesTypes - Supported text file types.
 * @property {string[]} otherFilesTypes - Other supported file types.
 * @property {number} minioFileSize - Maximum file size for MinIO.
 * @property {number} minioStorageFilesSize - Maximum storage files size for MinIO.
 * @property {number} maxMinioDiskPerUser - Maximum disk space per user in MinIO.
 * @property {number} analyticsExpirationInDays - Expiry for analytics data in days.
 *
 * @property {NotificationExpireSettings} notificationsExpireDays - Configuration for notification expiry.
 * @property {GroupPlugins} groupPlugins
 * @property {Services} services
 * @property {FranceTransfert} franceTransfert
 * @property {KeycloakSettings} keycloak
 * @property {NextcloudSettings} nextcloud
 * @property {SmtpSettings} smtp
 */

/**
 * @typedef {Object} PrivateSettings
 *
 * @property {number} loginExpirationInDays - Duration in days before a login token expires.
 * @property {boolean} fillWithFakeData - Determines whether to populate with mock data or not.
 * @property {string} minioAccess - Access key for Minio storage.
 * @property {string} minioSecret - Secret key for Minio storage.
 * @property {string[]} apiKeys - List of general-purpose API keys.
 * @property {string[]} createUserApiKeys - API keys used specifically for creating users.
 * @property {string[]} createUserTokenApiKeys - API keys used for creating user tokens.
 * @property {string} BBBSecret - Secret key used for BigBlueButton (if that's the BBB referred to).
 * @property {string[]} whiteDomains - List of whitelisted domains.
 * @property {string[]} cspFrameAncestors - Specifies valid parents that may embed a page using the `<frame>`, `<iframe>`, `<object>`, `<embed>`, or `<applet>` elements.
 * @property {boolean} checkKeyCloakWhiteListDomain - Flag determining if the domain should be checked against a whitelist for Keycloak.
 */

/**
 * @typedef {Object} MeteorSettings
 *
 * @property {PrivateSettings} private
 * @property {PublicSettings} public
 */

export const Settings = new Mongo.Collection('settings');

export const getSettings = () => {
  /**
   * @type {MeteorSettings}
   */
  const settings = Settings.findOne();

  return Object.assign(Meteor.settings, settings);
};
