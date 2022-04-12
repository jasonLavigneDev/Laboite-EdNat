import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';

import { isActive } from '../utils';
import StructureSpaces from './structurespaces';
import Services from '../services/services';

const addItem = (structureId, item) => {
  const currentPersonalSpace = StructureSpaces.findOne({ structureId });
  let alreadyExists = false;
  if (currentPersonalSpace === undefined) {
    // create personalSpace if not existing
    StructureSpaces.insert({ structureId, sorted: [] });
  } else {
    // check that item is not already present
    alreadyExists =
      StructureSpaces.findOne({
        $and: [
          { structureId },
          {
            $or: [{ 'sorted.elements': { $elemMatch: { type: item.type, element_id: item.element_id } } }],
          },
        ],
      }) !== undefined;
  }
  if (!alreadyExists) StructureSpaces.update({ structureId }, { $push: { unsorted: item } });
};

export const removeElement = new ValidatedMethod({
  name: 'structurespaces.removeElement',
  validate: new SimpleSchema({
    elementId: { type: String, regEx: SimpleSchema.RegEx.Id },
    type: String,
  }).validator(),

  run({ elementId, type }) {
    // check if active and logged in
    if (!isActive(this.structureId)) {
      throw new Meteor.Error('api.structurespaces.addService.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // remove all entries matching item type and element_id
    StructureSpaces.update(
      { structureId: this.structureId },
      {
        $pull: {
          'sorted.$[].elements': { type, element_id: elementId },
        },
      },
    );
  },
});

export const addService = new ValidatedMethod({
  name: 'structurespaces.addService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ serviceId }) {
    // check if active and logged in
    if (!isActive(this.structureId)) {
      throw new Meteor.Error('api.structurespaces.addService.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.structurespaces.addService.unknownService', i18n.__('api.services.unknownService'));
    }
    addItem(this.structureId, { type: 'service', element_id: serviceId });
  },
});

export const updateStructureSpace = new ValidatedMethod({
  name: 'structurespaces.updateStructureSpace',
  validate: new SimpleSchema({
    data: StructureSpaces.schema,
  }).validator({ clean: true }),

  run({ data }) {
    // check if active and logged in
    if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, ['admin'])) {
      throw new Meteor.Error(
        'api.structurespaces.updateStructureSpace.notPermitted',
        i18n.__('api.users.notPermitted'),
      );
    }
    // console.log(data);
    const currentStructureSpace = StructureSpaces.findOne({ structureId: data.structureId });
    if (currentStructureSpace === undefined) {
      // create StructureSpaces if not existing
      StructureSpaces.insert({ ...data });
    } else {
      StructureSpaces.update({ _id: currentStructureSpace._id }, { $set: data });
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([updateStructureSpace, removeElement, addService], 'name');

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
