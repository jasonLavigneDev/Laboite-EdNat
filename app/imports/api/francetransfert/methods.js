import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';

import { isActive } from '../utils';
import * as ft from './ft';

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
      const result = await ft.initFold(email, data);

      return result.data;
    } catch (error) {
      if (error.response?.data?.erreurs?.[0]?.libelleErreur) {
        throw new Meteor.Error(
          'api.francetransfert.initFold.franceTransfertError',
          error.response?.data?.erreurs?.[0]?.libelleErreur || JSON.stringify(),
        );
      } else {
        console.error('Unkown FT error', error);
        throw new Meteor.Error('api.francetransfert.initFold.franceTransfertError');
      }
    }
  },
});

export const getFoldStatus = new ValidatedMethod({
  name: 'francetransfert.getFoldStatus',
  validate: new SimpleSchema({
    foldId: String,
  }).validator(),

  async run({ foldId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.francetransfert.getFoldStatus.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }

    const user = Meteor.users.findOne(this.userId, { fields: { primaryEmail: 1, emails: 1 } });
    const email = user.primaryEmail || user.emails[0].address;

    try {
      const result = await ft.getFoldStatus(foldId, email);

      return result.data;
    } catch (error) {
      if (error.response?.data?.libelleErreur) {
        throw new Meteor.Error(
          'api.francetransfert.getFoldStatus.franceTransfertError',
          error.response?.data?.libelleErreur || JSON.stringify(),
        );
      } else {
        console.error('Unkown FT error', error);
        throw new Meteor.Error('api.francetransfert.getFoldStatus.franceTransfertError');
      }
    }
  },
});

export const getFoldData = new ValidatedMethod({
  name: 'francetransfert.getFoldData',
  validate: new SimpleSchema({
    foldId: String,
  }).validator(),

  async run({ foldId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.francetransfert.getFoldData.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }

    const user = Meteor.users.findOne(this.userId, { fields: { primaryEmail: 1, emails: 1 } });
    const email = user.primaryEmail || user.emails[0].address;

    try {
      const result = await ft.getFoldData(foldId, email);

      return result.data;
    } catch (error) {
      if (error.response?.data?.libelleErreur) {
        throw new Meteor.Error(
          'api.francetransfert.getFoldData.franceTransfertError',
          error.response?.data?.libelleErreur || JSON.stringify(),
        );
      } else {
        console.error('Unkown FT error', error);
        throw new Meteor.Error('api.francetransfert.getFoldData.franceTransfertError');
      }
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([initFold, getFoldStatus, getFoldData], 'name');

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
