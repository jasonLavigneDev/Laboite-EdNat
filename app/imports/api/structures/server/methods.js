import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import Structures from '../structures';

export const getStructures = new ValidatedMethod({
  name: 'structures.getStructures',
  validate: null,
  run() {
    return Structures.find().fetch();
  },
});

// Get list of all method names on Structures
const LISTS_METHODS = _.pluck([getStructures], 'name');

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
