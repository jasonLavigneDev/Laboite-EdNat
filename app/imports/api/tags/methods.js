import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';

import { isActive, getLabel, validateString } from '../utils';
import Tags from './tags';
import logServer, { levels, scopes } from '../logging';

export const createTag = new ValidatedMethod({
  name: 'tags.createTag',
  validate: new SimpleSchema({
    name: { type: String, min: 1, label: getLabel('api.tags.labels.name') },
  }).validator(),

  run({ name }) {
    const authorized = isActive(this.userId); // && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      logServer(
        `TAGS - METHODS - METEOR ERROR - createTag - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { name },
      );
      throw new Meteor.Error('api.tags.createTag.notPermitted', i18n.__('api.users.notPermitted'));
    }
    if (name !== name.toLowerCase()) {
      logServer(
        `TAGS - METHODS - METEOR ERROR - createTag - ${i18n.__('api.tags.notLowerCase')}`,
        levels.WARN,
        scopes.SYSTEM,
        { name },
      );
      throw new Meteor.Error('api.tags.createTag.notLowerCase', i18n.__('api.tags.notLowerCase'));
    }
    validateString(name);
    logServer(`TAGS - METHODS - INSERT - createTag - name: ${name}`, levels.VERBOSE, scopes.SYSTEM);
    return Tags.insert({
      name: name.toLowerCase(),
    });
  },
});

export const removeTag = new ValidatedMethod({
  name: 'tags.removeTag',
  validate: new SimpleSchema({
    tagId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.tags.labels.id') },
  }).validator(),

  run({ tagId }) {
    // check tag existence
    const tag = Tags.findOne(tagId);
    if (tag === undefined) {
      logServer(
        `TAGS - METHODS - METEOR ERROR - removeTag - ${i18n.__('api.tags.unknownTag')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { tagId },
      );
      throw new Meteor.Error('api.tags.removeTag.unknownTag', i18n.__('api.tags.unknownTag'));
    }
    // check if current user is active
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      logServer(
        `TAGS - METHODS - METEOR ERROR - removeTag - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { tagId },
      );
      throw new Meteor.Error('api.tags.removeTag.notPermitted', i18n.__('api.users.notPermitted'));
    }
    logServer(`TAGS - METHODS - REMOVE - removeTag - id: ${tagId}`, levels.INFO, scopes.SYSTEM);
    // changed: do not remove tag from existing articles
    // Articles.update({}, { $pull: { tags: tag.name } }, { multi: true });
    return Tags.remove(tagId);
  },
});

export const updateTag = new ValidatedMethod({
  name: 'tags.updateTag',
  validate: new SimpleSchema({
    tagId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.tags.labels.id') },
    data: Object,
    'data.name': { type: String, min: 1, label: getLabel('api.tags.labels.name') },
  }).validator(),

  run({ tagId, data }) {
    // check tag existence
    const tag = Tags.findOne({ _id: tagId });
    if (tag === undefined) {
      logServer(
        `TAGS - METHODS - METEOR ERROR - updateTag - ${i18n.__('api.tags.unknownTag')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { tagId, data },
      );
      throw new Meteor.Error('api.tags.updateTag.unknownTag', i18n.__('api.tags.unknownTag'));
    }
    // check if current user is active
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      logServer(
        `TAGS - METHODS - METEOR ERROR - updateTag - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { tagId, data },
      );
      throw new Meteor.Error('api.tags.updateTag.notPermitted', i18n.__('api.users.notPermitted'));
    }
    validateString(data.name);
    logServer(`TAGS - METHODS - UPDATE - updateTag`, levels.VERBOSE, scopes.SYSTEM, { tagId, data });
    return Tags.update({ _id: tagId }, { $set: data });
  },
});

// Get list of all method names on Tags
const LISTS_METHODS = _.pluck([createTag, removeTag, updateTag], 'name');

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
