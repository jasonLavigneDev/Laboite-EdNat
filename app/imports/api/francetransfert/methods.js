import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';

import { isActive } from '../utils';
import { initializeFold } from './ft';

export const initFold = new ValidatedMethod({
  name: 'francetransfert.initFold',
  validate: new SimpleSchema({
    data: Object,
    'data.foldType': Number,
    'data.message': { type: String, optional: true },
    'data.subject': { type: String, optional: true },
    'data.title': { type: String, optional: true },
    'data.recipients': { type: Array, optional: true },
    'data.recipients.$': { type: String, optional: true },
    'data.settings': { type: Object, optional: true },
    'data.settings.expiryDate': { type: Date, optional: true },
    'data.settings.password': { type: String, optional: true },
    'data.settings.language': { type: String, optional: true },
    'data.settings.encrypt': { type: Boolean, optional: true },
    'data.tos': Boolean,
    files: Array,
    'files.$': Object,
    'files.$.id': String,
    'files.$.name': String,
    'files.$.size': Number,
  }).validator(),

  async run(data) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.francetransfert.initFold.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }

    const user = Meteor.users.findOne(this.userId, { fields: { primaryEmail: 1, emails: 1 } });
    const email = user.primaryEmail || user.emails[0].address;

    try {
      const result = await initializeFold(email, data);

      return result.data;
    } catch (error) {
      throw new Meteor.Error(
        'api.francetransfert.initFold.franceTransfertError',
        error.response.data.erreurs[0].libelleErreur,
      );
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([initFold], 'name');

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
