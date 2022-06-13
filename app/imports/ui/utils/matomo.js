import { createInstance, useMatomo } from '@datapunt/matomo-tracker-react';
import { useEffect } from 'react';

const { matomo = {} } = Meteor.settings.public;

const { urlBase, siteId } = matomo;

export const instance =
  urlBase && siteId
    ? createInstance({
        urlBase,
        siteId,
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
          // disableCookies: true,
          // setSecureCookie: true,
          // setRequestMethod: 'POST',
        },
      })
    : null;

export const usePageTracking = (args) => {
  const { trackPageView } = useMatomo();
  useEffect(() => {
    trackPageView(args);
  }, []);
};
