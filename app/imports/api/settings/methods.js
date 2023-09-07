import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Settings from './settings';

export const getAllSettings = new ValidatedMethod({
  name: 'settings.getAllSettings',
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

export const getSetting = new ValidatedMethod({
  name: 'settings.getSetting',
  validate: new SimpleSchema({
    field: {
      type: String,
    },
  }).validator(),
  run(field) {
    const res = Settings.find({ name: 'settings' }).fetch();
    return res[field];
  },
});

if (Meteor.isServer) {
  // Get list of all method names on Structures
  const LISTS_METHODS = _.pluck([getAllSettings, getSetting], 'name');

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
