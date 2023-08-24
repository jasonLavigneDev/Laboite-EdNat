import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel, validateString } from '../utils';
import BusinessReGrouping from './businessReGrouping';
import Services from '../services/services';
import Structures from '../structures/structures';
import logServer, { levels, scopes } from '../logging';

export const createBusinessReGrouping = new ValidatedMethod({
  name: 'BusinessReGrouping.createBusinessReGrouping',
  structure: 'BusinessReGrouping.createBusinessReGrouping',
  validate: new SimpleSchema({
    name: { type: String, min: 1, label: getLabel('api.businessReGrouping.labels.name') },
    structure: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.businessReGrouping.labels.structure'),
    },
  }).validator(),

  run({ name, structure }) {
    const authorized =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'adminStructure', structure));

    const businessRegr = BusinessReGrouping.findOne({ name, structure });
    // Check if business regrouping exists in structure ancestors
    const currStructure = Structures.findOne(structure);
    const businessRegrForStructureAncestors = BusinessReGrouping.find({
      structure: { $in: currStructure?.ancestorsIds },
    }).fetch();
    if (businessRegr !== undefined) {
      logServer(
        `BUISINESS - METHOD - METEOR ERROR - createBusinessReGrouping - ${i18n.__(
          'api.businessReGrouping.createBusinessReGrouping.nameAlreadyUse',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
        { name, structure },
      );
      throw new Meteor.Error(
        'api.businessReGrouping.createBusinessReGrouping.alreadyExists',
        i18n.__('api.businessReGrouping.createBusinessReGrouping.nameAlreadyUse'),
      );
    }
    if (
      businessRegrForStructureAncestors.length > 0 &&
      businessRegrForStructureAncestors.some((rg) => rg.name === name)
    ) {
      logServer(
        `BUISINESS - METHOD - METEOR ERROR - createBusinessReGrouping - 
        ${i18n.__('api.businessReGrouping.createBusinessReGrouping.nameAlreadyUsedForOneOfStructureAncestors')}`,
        levels.WARN,
        scopes.SYSTEM,
        { name, structure },
      );
      throw new Meteor.Error(
        'api.businessReGrouping.createBusinessReGrouping.nameAlreadyUsedForOneOfStructureAncestors',
        i18n.__('api.businessReGrouping.createBusinessReGrouping.nameAlreadyUsedForOneOfStructureAncestors'),
      );
    }
    if (!authorized) {
      logServer(
        `BUISINESS - METHOD - METEOR ERROR - createBusinessReGrouping - 
        ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { name, structure },
      );
      throw new Meteor.Error(
        'api.businessReGrouping.createBusinessReGrouping.notPermitted',
        i18n.__('api.users.adminNeeded'),
      );
    }
    validateString(name);
    logServer(`BUISINESS - METHOD - INSERT - createBusinessReGrouping`, levels.VERBOSE, scopes.ADMIN, {
      name,
      structure,
    });
    BusinessReGrouping.insert({
      name,
      structure,
    });
  },
});

export const removeBusinessReGrouping = new ValidatedMethod({
  name: 'BusinessReGrouping.removeBusinessReGrouping',
  validate: new SimpleSchema({
    businessReGroupingId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.businessReGrouping.labels.id'),
    },
    structure: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.businessReGrouping.labels.structure'),
    },
  }).validator(),

  run({ businessReGroupingId, structure }) {
    // check businessReGrouping existence
    const businessReGrouping = BusinessReGrouping.findOne(businessReGroupingId);
    if (businessReGrouping === undefined) {
      logServer(
        `BUSINESS - METHOD - METEOR ERROR - removeBusinessReGrouping - ${i18n.__(
          'api.businessReGrouping.unknownBusinessReGrouping',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { businessReGroupingId, structure },
      );
      throw new Meteor.Error(
        'api.businessReGrouping.removeBusinessReGrouping.unknownBusinessReGrouping',
        i18n.__('api.businessReGrouping.unknownBusinessReGrouping'),
      );
    }
    // check if current user has admin rights
    const authorized =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'adminStructure', structure));
    if (!authorized) {
      logServer(
        `BUSINESS - METHOD - METEOR ERROR - removeBusinessReGrouping - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { businessReGroupingId, structure },
      );
      throw new Meteor.Error(
        'api.businessReGrouping.removeBusinessReGrouping.notPermitted',
        i18n.__('api.users.adminNeeded'),
      );
    }
    // remove businessReGrouping from services
    logServer(
      `BUSINESS - METHOD - UPDATE SERVICE - removeBusinessReGrouping - businessReGroupingId: ${businessReGroupingId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    Services.update({}, { $pull: { businessReGrouping: businessReGroupingId } }, { multi: true });
    logServer(
      `BUISINESS - METHOD - REMOVE - removeBusinessReGrouping - businessReGroupingId: ${businessReGroupingId}`,
      levels.VERBOSE,
      scopes.ADMIN,
    );
    BusinessReGrouping.remove(businessReGroupingId);
  },
});

export const updateBusinessReGrouping = new ValidatedMethod({
  name: 'BusinessReGrouping.updateBusinessReGrouping',
  validate: new SimpleSchema({
    businessReGroupingId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.businessReGrouping.labels.id'),
    },
    data: Object,
    'data.name': { type: String, min: 1, label: getLabel('api.businessReGrouping.labels.name') },
    'data.structure': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.businessReGrouping.labels.structure'),
    },
  }).validator(),

  run({ businessReGroupingId, data }) {
    // check businessReGrouping existence
    const businessReGrouping = BusinessReGrouping.findOne({ _id: businessReGroupingId });
    if (businessReGrouping === undefined) {
      logServer(
        `BUISINESS - METHOD - METEOR ERROR - updateBusinessReGrouping - ${i18n.__(
          'api.businessReGrouping.unknownBusinessReGrouping',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { businessReGroupingId, data },
      );
      throw new Meteor.Error(
        'api.businessReGrouping.updateBusinessReGrouping.unknownBusinessReGrouping',
        i18n.__('api.businessReGrouping.unknownBusinessReGrouping'),
      );
    }
    // check if current user has admin rights
    const authorized =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'adminStructure', data.structure));
    if (!authorized) {
      logServer(
        `BUISINESS - METHOD - METEOR ERROR - updateBusinessReGrouping - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { businessReGroupingId, data },
      );
      throw new Meteor.Error(
        'api.businessReGrouping.updateBusinessReGrouping.notPermitted',
        i18n.__('api.users.adminNeeded'),
      );
    }
    validateString(data.name);
    logServer(
      `BUISINESS - METHOD - UPDATE - updateBusinessReGrouping - businessReGroupingId: ${businessReGroupingId} /
      data: ${data}`,
      levels.VERBOSE,
      scopes.ADMIN,
    );
    BusinessReGrouping.update({ _id: businessReGroupingId }, { $set: data });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([createBusinessReGrouping, removeBusinessReGrouping, updateBusinessReGrouping], 'name');

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
