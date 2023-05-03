import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';

import { isActive, getLabel, validateString } from '../utils';
import Helps from './helps';
import logServer, { levels, scopes } from '../logging';

const validateHelp = (data) => {
  validateString(data.title);
  if (data.description) validateString(data.description);
  validateString(data.content);
  validateString(data.category);
};

export const createHelp = new ValidatedMethod({
  name: 'tags.createHelp',
  validate: Helps.schema.validator(),

  run(data) {
    const authorized = isActive(this.userId); // && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.helps.createHelp.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const help = Helps.findOne({ title: data.title });
    if (help) {
      throw new Meteor.Error('api.helps.createHelp.alreadyExists', i18n.__('api.helps.createHelp.alreadyExists'));
    }
    validateHelp(data);
    logServer(`HELPS - METHOD - INSERT - createHelp - data: ${data}`, levels.VERBOSE, scopes.ADMIN);
    return Helps.insert(data);
  },
});

export const removeHelp = new ValidatedMethod({
  name: 'tags.removeHelp',
  validate: new SimpleSchema({
    helpId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.helps.labels.id') },
  }).validator(),

  run({ helpId }) {
    // check tag existence
    const tag = Helps.findOne(helpId);
    if (tag === undefined) {
      throw new Meteor.Error('api.helps.removeHelp.unknownHelp', i18n.__('api.helps.unknownHelp'));
    }
    // check if current user is active
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.helps.removeHelp.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // changed: do not remove tag from existing articles
    // Articles.update({}, { $pull: { tags: tag.name } }, { multi: true });
    logServer(`HELPS - METHOD - REMOVE - removeHelp - help id: ${helpId}`, levels.VERBOSE, scopes.ADMIN);
    return Helps.remove(helpId);
  },
});

export const updateHelp = new ValidatedMethod({
  name: 'tags.updateHelp',
  validate: new SimpleSchema({
    helpId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.helps.labels.id') },
    data: Helps.schema,
  }).validator(),

  run({ helpId, data }) {
    // check tag existence
    const tag = Helps.findOne({ _id: helpId });
    if (tag === undefined) {
      throw new Meteor.Error('api.helps.updateHelp.unknownHelp', i18n.__('api.helps.unknownHelp'));
    }

    // check if current user is active
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.helps.updateHelp.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const tagWithTitle = Helps.findOne({ $and: [{ title: data.title }, { _id: { $ne: helpId } }] });
    if (tagWithTitle) {
      throw new Meteor.Error('api.helps.updateHelp.alreadyExists', i18n.__('api.helps.updateHelp.titleAlreadyTaken'));
    }

    validateHelp(data);
    logServer(
      `HELPS - METHOD - UPDATE - updateHelp - id: ${helpId} / data: ${JSON.stringify(data)}`,
      levels.VERBOSE,
      scopes.ADMIN,
    );
    return Helps.update({ _id: helpId }, { $set: data });
  },
});

// Get list of all method names on Helps
const LISTS_METHODS = _.pluck([createHelp, removeHelp, updateHelp], 'name');

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
