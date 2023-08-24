import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import faker from 'faker';

import AnalyticsEvents from '../analyticsEvents';

Factory.define('analytic', AnalyticsEvents, {
  eventTypes: AnalyticsEvents.types.CLICK,
  target: faker.lorem.word,
  sessionId: () => Random.id(),
  userId: () => Random.id(),
});
