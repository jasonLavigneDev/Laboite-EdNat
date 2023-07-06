import { Meteor } from 'meteor/meteor';
import Countly from 'countly-sdk-web';
import AnalyticsEvents from './analyticsEvents';
import Structures from '../structures/structures';

const enabledAnalytics = !Meteor.settings.public.disabledFeatures?.analytics;
const { countly } = Meteor.settings.public;

let connectionInfo = null;
let upperStructureName = null;

const trackCountly = async (options) => {
  const { target, content } = options;
  const user = Meteor.user();
  const structure = user?.structure ? Structures.findOne(user.structure) : null;

  await new Promise((resolve) => {
    if (connectionInfo) return resolve();

    return Meteor.call('analytics.getConnectionInfo', (error, { connection, upperStructure }) => {
      if (error) {
        console.error(error);
        return;
      }

      connectionInfo = connection;
      upperStructureName = upperStructure;
      resolve();
    });
  });

  Countly.q.push([
    'add_event',
    {
      key: content,
      count: 1,
      segmentation: {
        target,
        fromPage: window.location.toString().replace(Meteor.absoluteUrl(), '/'),
        isLoggedIn: !!user,
        username: user?.username || null,
        structure: structure?.name || null,
        structureId: structure?._id || null,
        upperStructure: upperStructureName || null,
        connectionId: connectionInfo?._id || null,
        ipAddr: connectionInfo?.ipAddr || null,
        userAgent: window.navigator.userAgent || null,
        // isFramed: IS_FRAMED,
      },
    },
  ]);
};

export const eventTracking = (options) => {
  if (countly?.url) {
    trackCountly(options);
  }

  if (!enabledAnalytics) {
    return;
  }

  Meteor.call('analytics.createAnalyticsEvents', { ...options });
};

if (enabledAnalytics) {
  let openedWidget = false;

  const receiveMessageFromIframe = ({ data }) => {
    if (data === 'openWidget' && !openedWidget) {
      openedWidget = true;

      eventTracking({
        target: AnalyticsEvents.targets.WIDGET,
        content: 'Opening widget',
      });
    }
  };

  window.addEventListener('message', receiveMessageFromIframe, false);
}
