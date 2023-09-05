import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { Settings } from '../settings';
import logServer, { levels, scopes } from '../../logging';

import { isActive, getLabel } from '../../utils';

export const updateSettings = new ValidatedMethod({
  name: 'settings.update',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
  }).validator(),

  run(publicSettings) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');

    if (!authorized) {
      logServer(
        `SETTINGS - METHOD - METEOR ERROR - updateSettings - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { userId: this.userId },
      );
      throw new Meteor.Error('api.settings.updateSettings.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    Settings.update({}, { $set: { public: publicSettings } });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([updateSettings], 'name');

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
