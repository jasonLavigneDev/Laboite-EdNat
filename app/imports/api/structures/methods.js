import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import { getLabel, isActive } from '../utils';
import Structures from './structures';

export const createStructure = new ValidatedMethod({
  name: 'structures.createStructure',
  validate: new SimpleSchema({
    ...Structures.schema,
  }).validator(),

  run({ name, childrenIds }) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.structures.createStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    return Structures.insert({
      name,
      childrenIds: childrenIds || [],
    });
  },
});

export const updateStructure = new ValidatedMethod({
  name: 'structures.updateStructure',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
    data: Object,
    'data.name': { type: String, min: 1, label: getLabel('api.structures.labels.name') },
  }).validator(),

  run({ structureId, data }) {
    // check structure existence
    const structure = Structures.findOne({ _id: structureId });
    if (structure === undefined) {
      throw new Meteor.Error(
        'api.structures.updateStructure.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    // check if current user is active AND is admin
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');

    if (!authorized) {
      throw new Meteor.Error('api.structures.updateStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    return Structures.update({ _id: structureId }, { $set: data });
  },
});

export const removeStructure = new ValidatedMethod({
  name: 'structures.removeStructure',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),

  run({ structureId }) {
    // check structure existence
    const structure = Structures.findOne({ _id: structureId });
    if (structure === undefined) {
      throw new Meteor.Error(
        'api.structures.removeStructure.unknownStructure',
        i18n.__('api.structures.unknownStructures'),
      );
    }

    // check if current user is active AND is admin
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');

    if (!authorized) {
      throw new Meteor.Error('api.structures.removeStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    return Structures.remove(structureId);
  },
});

// Get list of all method names on Structures
const LISTS_METHODS = _.pluck([createStructure, updateStructure, removeStructure], 'name');

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
