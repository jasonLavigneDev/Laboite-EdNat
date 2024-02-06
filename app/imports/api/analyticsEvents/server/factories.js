import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';

import AnalyticsEvents from '../analyticsEvents';

Factory.define('analytic', AnalyticsEvents, {
  eventTypes: AnalyticsEvents.types.CLICK,
  target: faker.lorem.word,
  sessionId: () => Random.id(),
  userId: () => Random.id(),
});
