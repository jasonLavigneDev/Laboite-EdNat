import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Settings from './settings';

export const getSettings = new ValidatedMethod({
  name: 'settings.getSettings',
  validate: null,
  run() {
    let res = Settings.find({ name: 'settings' }).fetch();
    if (!res) {
      Settings.insert({ name: 'settings' });
      res = Settings.find({ name: 'settings' }).fetch();
    }
    return res;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on Structures
  const LISTS_METHODS = _.pluck([getSettings], 'name');

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
