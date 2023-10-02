import { createInstance } from '@datapunt/matomo-tracker-react';
import Countly from 'countly-sdk-web';
import PackageJSON from '../../../package.json';

const { matomo, countly } = Meteor.settings.public;
const { version } = PackageJSON;

export const instance =
  matomo?.urlBase && matomo?.siteId
    ? createInstance({
        urlBase: matomo.urlBase,
        siteId: matomo.siteId,
        //   userId: 'UID76903202', // optional, default value: `undefined`.
        // trackerUrl: `${urlBase}/matomo.php`, // optional, default value: `${urlBase}matomo.php`
        // srcUrl: `${urlBase}/matomo.js`, // optional, default value: `${urlBase}matomo.js`
        disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
        heartBeat: {
          // optional, enabled by default
          active: true, // optional, default value: true
          seconds: 10, // optional, default value: `15
        },
        linkTracking: false, // optional, default value: true
        configurations: {
          // optional, default value: {}
          // any valid matomo configuration, all below are optional
          disableCookies: true,
          // setSecureCookie: true,
          // setRequestMethod: 'POST',
        },
      })
    : null;

if (countly?.url) {
  window.Countly = Countly;

  Countly.init({
    app_key: countly.app_key,
    url: countly.url,
    session_update: 10,
    use_session_cookie: false,
    debug: countly.debug,
    require_consent: countly.consent,
    app_version: version,
    inactivity_time: 1,
    offline_mode: false,
    // remote_config: true,
  });

  const response = ['activity', 'interaction', 'crashes'];
  Countly.q.push(['add_consent', response]);
  localStorage.setItem('countly_consents', JSON.stringify(response));

  // Since Countly is loaded and available, you can use synchronus or asynchronus calls, does not matter
  Countly.q.push([
    'group_features',
    {
      activity: ['sessions', 'events', 'views', 'location'],
      interaction: ['scrolls', 'clicks', 'crashes'],
      whereabouts: ['users'],
    },
  ]);

  // Countly.q.push(['enable_feedback', { widgets: ['widget-id-1', 'widget-id-2'] }]);
  Countly.q.push(['track_sessions']);
  Countly.q.push(['track_scrolls']);
  Countly.q.push(['track_clicks']);
  Countly.q.push(['track_links']);
  Countly.q.push(['track_errors']);
}
