import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { getLabel, isActive } from '../utils';
import Structures from './structures';
import Services from '../services/services';
import Articles from '../articles/articles';

export const createStructure = new ValidatedMethod({
  name: 'structures.createStructure',
  validate: new SimpleSchema({
    name: {
      type: String,
      min: 1,
      label: getLabel('api.structures.name'),
    },
    parentId: {
      type: SimpleSchema.RegEx.Id,
      label: getLabel('api.structures.parentId'),
      optional: true,
      defaultValue: null,
    },
  }).validator(),
  run({ name, parentId }) {
    const ancestors = [];
    if (parentId !== null) {
      const _ancestors = Structures.findOne({ _id: parentId }, { fields: { ancestorsIds: 1 } });
      if (_ancestors) ancestors.push(..._ancestors.ancestorsIds);
    }

    const isAdminStructure = ancestors.some((ancestor) => {
      return Roles.userIsInRole(this.userId, 'adminStructure', ancestor);
    });

    const authorized = (isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin')) || isAdminStructure;
    if (!authorized) {
      throw new Meteor.Error('api.structures.createStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const structureId = Structures.insert({
      name,
      parentId,
    });

    const parentIds = [];
    if (parentId) {
      parentIds.push(parentId);

      Structures.update({ _parentIdsid: structureId }, { $set: { ancestorsIds: parentIds } });

      const parentStructure = Structures.findOne({ _id: parentId });

      if (parentStructure) {
        const { childrenIds: parentStructureChildrenIds } = parentStructure;
        parentStructureChildrenIds.push(structureId);
        Structures.update({ _id: parentId }, { $set: { childrenIds: [...new Set(parentStructureChildrenIds)] } });
        Structures.update(
          { _id: structureId },
          { $set: { ancestorsIds: [parentId, ...parentStructure.ancestorsIds] } },
        );
      }
    }

    return structureId;
  },
});

export const updateStructure = new ValidatedMethod({
  name: 'structures.updateStructure',
  validate: new SimpleSchema({
    structureId: {
      type: SimpleSchema.RegEx.Id,
      label: getLabel('api.structures.id'),
    },
    name: {
      type: String,
      min: 1,
      label: getLabel('api.structures.name'),
    },
  }).validator(),
  run({ structureId, name }) {
    const ancestors = [];

    const _ancestors = Structures.findOne({ _id: structureId }, { fields: { ancestorsIds: 1 } });
    if (_ancestors) ancestors.push(..._ancestors.ancestorsIds);

    const isAdminStructure = ancestors.some((ancestor) => {
      return Roles.userIsInRole(this.userId, 'adminStructure', ancestor);
    });
    // check if current user is active AND is admin
    const authorized = (isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin')) || isAdminStructure;

    if (!authorized) {
      throw new Meteor.Error('api.structures.updateStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    // check structure existence
    const structure = Structures.findOne({ _id: structureId });
    if (structure === undefined) {
      throw new Meteor.Error(
        'api.structures.updateStructure.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    return Structures.update(
      { _id: structureId },
      {
        $set: {
          name,
        },
      },
    );
  },
});

export const removeStructure = new ValidatedMethod({
  name: 'structures.removeStructure',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),

  run({ structureId }) {
    const ancestors = [];

    const _ancestors = Structures.findOne({ _id: structureId }, { fields: { ancestorsIds: 1 } });
    if (_ancestors) ancestors.push(..._ancestors.ancestorsIds);

    const isAdminStructure = ancestors.some((ancestor) => {
      return Roles.userIsInRole(this.userId, 'adminStructure', ancestor);
    });
    // check if current user is active AND is admin
    const authorized = (isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin')) || isAdminStructure;

    if (!authorized) {
      throw new Meteor.Error('api.structures.removeStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    // check structure existence
    const structure = Structures.findOne({ _id: structureId });

    if (structure === undefined) {
      throw new Meteor.Error(
        'api.structures.removeStructure.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    if (structure.childrenIds.length > 0) {
      throw new Meteor.Error('api.structures.removeStructure.hasChildren', i18n.__('api.structures.hasChildren'));
    }

    const servicesCursor = Services.find({ structure: structureId });
    if (servicesCursor.count() > 0) {
      throw new Meteor.Error('api.structures.removeStructure.hasServices', i18n.__('api.structures.hasServices'));
    }

    // if there are users attached to this structure, unset it
    const usersCursor = Meteor.users.find({ structure: structureId });
    if (usersCursor.count() > 0) {
      throw new Meteor.Error('api.structures.removeStructure.hasUsers', i18n.__('api.structures.hasUsers'));
    }

    // if there are articles attached to this structure, delete aticles
    Articles.remove({ structure: structureId });

    const { ancestorsIds } = structure;

    // Remove id of structure from its ancestors
    if (ancestorsIds.length > 0) {
      // update old parent's children ids array
      const ancestorsList = Structures.find({ _id: { $in: ancestorsIds } });
      if (ancestorsList.length > 0) {
        ancestorsList.forEach((ancestor) => {
          Structures.update(
            { _id: ancestor._id },
            {
              $set: {
                childrenIds: [...new Set(_.without(ancestorsList.childrenIds, structureId))],
              },
            },
          );
        });
      }
    }
    return Structures.remove(structureId);
  },
});

export const getAncestorsIds = new ValidatedMethod({
  name: 'structures.getAncestorsIds',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),
  run({ structureId }) {
    const structure = Structures.findOne({ _id: structureId }, { fields: { ancestorsIds: 1 } });

    if (structure === undefined) {
      throw new Meteor.Error(
        'api.structures.getAncestorsIds.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const authorized = isActive(this.userId);

    if (!authorized) {
      throw new Meteor.Error('api.structures.getAncestorsIds.notPermitted', i18n.__('api.users.notPermitted'));
    }

    return structure.ancestorsIds;
  },
});

export const getAllChilds = new ValidatedMethod({
  name: 'structures.getAllChilds',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),
  run({ structureId }) {
    const structure = Structures.findOne({ _id: structureId });

    if (structure === undefined) {
      throw new Meteor.Error(
        'api.structures.removeStructure.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const authorized = isActive(this.userId);

    if (!authorized) {
      throw new Meteor.Error('api.structures.getAllChilds.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const childs = Structures.find({ ancestorsIds: structureId }).fetch();
    return childs;
  },
});

// Get list of all method names on Structures
const LISTS_METHODS = _.pluck(
  [createStructure, updateStructure, removeStructure, getAncestorsIds, getAllChilds],
  'name',
);

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
