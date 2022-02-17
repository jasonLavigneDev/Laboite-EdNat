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
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
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
    // check structure existence
    const structure = Structures.findOne({ _id: structureId });

    if (structure.childrenIds.length > 0) {
      throw new Meteor.Error('api.structures.removeStructure.hasChildren', i18n.__('api.structures.hasChildren'));
    }

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
    const { ancestorsIds } = structure;

    // Remove id of structure from its ancestors
    if (ancestorsIds.length > 0) {
      // update old parent's children ids array
      const ancestors = Structures.find({ _id: { $in: ancestorsIds } });
      if (ancestors.length > 0) {
        ancestors.forEach((ancestor) => {
          Structures.update(
            { _id: ancestor._id },
            {
              $set: {
                childrenIds: [...new Set(_.without(ancestors.childrenIds, structureId))],
              },
            },
          );
        });
      }
    }
    return Structures.remove(structureId);
  },
});

export const getAllParentIdsTreeStructure = new ValidatedMethod({
  name: 'structures.getAllParentIdsTree',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),
  run({ structureId }) {
    const structureIds = [];

    (function enrichParents(parentId) {
      const struct = Structures.findOne({ _id: parentId });
      if (struct === undefined) {
        return;
      }
      if (struct) {
        structureIds.push(struct._id);
        if (!struct.parentId) return;
        enrichParents(struct.parentId);
      }
    })(structureId);

    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');

    if (!authorized) {
      throw new Meteor.Error('api.structures.getAllParentIdsTree.notPermitted', i18n.__('api.users.notPermitted'));
    }

    return structureIds;
  },
});

// Get list of all method names on Structures
const LISTS_METHODS = _.pluck(
  [createStructure, updateStructure, removeStructure, getAllParentIdsTreeStructure],
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
