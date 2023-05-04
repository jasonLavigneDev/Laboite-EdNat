import { Meteor } from 'meteor/meteor';
import Countly from 'countly-sdk-web';
import AnalyticsEvents from './analyticsEvents';

const enabledAnalytics = !Meteor.settings.public.disabledFeatures?.analytics;
const { countly } = Meteor.settings.public;
let openedWidget = false;

const trackCountly = (options) => {
  const { target, content } = options;
  Countly.q.push([
    'add_event',
    {
      key: content,
      count: 1,
      segmentation: { target },
    },
  ]);
};

export const eventTracking = (options) => {
  if (countly) {
    trackCountly(options);
  }

  if (!enabledAnalytics) {
    return;
  }

  Meteor.call('analytics.createAnalyticsEvents', { ...options });
};

const receiveMessageFromIframe = ({ data }) => {
  if (data === 'openWidget' && !openedWidget) {
    openedWidget = true;
    const options = {
      target: AnalyticsEvents.targets.WIDGET,
      content: 'Widget',
    };
    eventTracking(options);
  }
};
if (enabledAnalytics) {
  window.addEventListener('message', receiveMessageFromIframe, false);
}
