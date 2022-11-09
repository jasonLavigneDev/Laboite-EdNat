import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel } from '../utils';
import BusinessReGrouping from './businessReGrouping';
import Services from '../services/services';
import Structures from '../structures/structures';

export const createBusinessReGrouping = new ValidatedMethod({
  name: 'BusinessReGrouping.createBusinessReGrouping',
  structure: 'BusinessReGrouping.createBusinessReGrouping',
  validate: new SimpleSchema({
    name: { type: String, min: 1, label: getLabel('api.businessReGrouping.labels.name') },
    structure: { type: String, min: 1, label: getLabel('api.businessReGrouping.labels.structure') },
  }).validator(),

  run({ name, structure }) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');

    const businessRegr = BusinessReGrouping.findOne({ name, structure });
    // Check if business regrouping exists in structure ancestors
    const currStructure = Structures.findOne(structure);
    const businessRegrForStructureAncestors = BusinessReGrouping.find({
      structure: { $in: currStructure?.ancestorsIds },
    }).fetch();
    if (businessRegr !== undefined) {
      throw new Meteor.Error(
        'api.businessReGrouping.createBusinessReGrouping.alreadyExists',
        i18n.__('api.businessReGrouping.createBusinessReGrouping.nameAlreadyUse'),
      );
    }
    if (
      businessRegrForStructureAncestors.length > 0 &&
      businessRegrForStructureAncestors.some((rg) => rg.name === name)
    ) {
      throw new Meteor.Error(
        'api.businessReGrouping.createBusinessReGrouping.nameAlreadyUsedForOneOfStructureAncestors',
        i18n.__('api.businessReGrouping.createBusinessReGrouping.nameAlreadyUsedForOneOfStructureAncestors'),
      );
    }
    if (!authorized) {
      throw new Meteor.Error(
        'api.businessReGrouping.createBusinessReGrouping.notPermitted',
        i18n.__('api.users.adminNeeded'),
      );
    }
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
  }).validator(),

  run({ businessReGroupingId }) {
    // check businessReGrouping existence
    const businessReGrouping = BusinessReGrouping.findOne(businessReGroupingId);
    if (businessReGrouping === undefined) {
      throw new Meteor.Error(
        'api.businessReGrouping.removeBusinessReGrouping.unknownBusinessReGrouping',
        i18n.__('api.businessReGrouping.unknownBusinessReGrouping'),
      );
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error(
        'api.businessReGrouping.removeBusinessReGrouping.notPermitted',
        i18n.__('api.users.adminNeeded'),
      );
    }
    // remove businessReGrouping from services
    Services.update({}, { $pull: { businessReGrouping: businessReGroupingId } }, { multi: true });
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
    'data.structure': { type: String, min: 1, label: getLabel('api.businessReGrouping.labels.structure') },
  }).validator(),

  run({ businessReGroupingId, data }) {
    // check businessReGrouping existence
    const businessReGrouping = BusinessReGrouping.findOne({ _id: businessReGroupingId });
    if (businessReGrouping === undefined) {
      throw new Meteor.Error(
        'api.businessReGrouping.updateBusinessReGrouping.unknownBusinessReGrouping',
        i18n.__('api.businessReGrouping.unknownBusinessReGrouping'),
      );
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error(
        'api.businessReGrouping.updateBusinessReGrouping.notPermitted',
        i18n.__('api.users.adminNeeded'),
      );
    }
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
