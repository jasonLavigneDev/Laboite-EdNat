import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { UserStatus } from 'meteor/mizzao:user-status';
import i18n from 'meteor/universe:i18n';

import { isActive } from '../../utils';
import AnalyticsEvents from '../analyticsEvents';

export const getAnalyticsConnection = new ValidatedMethod({
  name: 'analytics.getAnalyticsConnection',
  validate: null,
  run() {
    return UserStatus.connections.findOne({ _id: this.connection.id });
  },
});

export const createAnalyticsEvents = new ValidatedMethod({
  name: 'analytics.createAnalyticsEvents',
  validate: AnalyticsEvents.schema.validator(),

  run(data) {
    const authorized = isActive(this.userId); // && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.helps.createAnalyticsEvents.notPermitted', i18n.__('api.users.notPermitted'));
    }
    return AnalyticsEvents.insert(data);
  },
});

// Get list of all method names on Helps
const LISTS_METHODS = _.pluck([createAnalyticsEvents], 'name');

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000,
  );
}
