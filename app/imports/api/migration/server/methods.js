import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { Migrations } from 'meteor/percolate:migrations';
import logServer, { levels, scopes } from '../../logging';

export const getVersion = new ValidatedMethod({
  name: 'migration.getVersion',
  validate: null,
  run() {
    if (!this.userId) {
      logServer(
        `MIGRATION - METHOD - METEOR ERROR - getVersion - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.ERROR,
        scopes.SYSTEM,
      );
      throw new Meteor.Error('api.migration.getVersion.mustBeLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    return Migrations.getVersion();
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck([getVersion], 'name');
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
