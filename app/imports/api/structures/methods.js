import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import { getLabel, isActive } from '../utils';
import Structures, { IntroductionStructure } from './structures';
import { hasAdminRightOnStructure, isAStructureWithSameNameExistWithSameParent } from './utils';
import Services from '../services/services';
import Articles from '../articles/articles';

export const createStructure = new ValidatedMethod({
  name: 'structures.createStructure',
  validate: Structures.schema.pick('name', 'parentId').validator(),
  run({ name, parentId }) {
    let isAdminOfStructure = false;

    if (parentId) {
      isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId: parentId });
    }

    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isAdminOfStructure);

    if (!authorized) {
      throw new Meteor.Error('api.structures.createStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const structuresWithSameNameOnSameLevel = isAStructureWithSameNameExistWithSameParent({ name, parentId });

    if (structuresWithSameNameOnSameLevel) {
      throw new Meteor.Error(
        'api.structures.createStructure.nameAlreadyTaken',
        i18n.__('api.structures.nameAlreadyTaken'),
      );
    }

    const structureId = Structures.insert({
      name,
      parentId,
    });

    if (parentId) {
      // Update ancestorsId with only direct parent
      Structures.update({ _id: structureId }, { $set: { ancestorsIds: [parentId] } });

      const directParentStructure = Structures.findOne({ _id: parentId });
      if (directParentStructure) {
        const { childrenIds: directParentStructureChildrenIds, ancestorsIds: directParentStructureAncestorIds } =
          directParentStructure;

        // Add structure to the parent childrenIds
        directParentStructureChildrenIds.push(structureId);
        Structures.update({ _id: parentId }, { $set: { childrenIds: [...new Set(directParentStructureChildrenIds)] } });

        // Update structure ancestors with parent structure's ancestors too
        Structures.update(
          { _id: structureId },
          { $set: { ancestorsIds: [parentId, ...directParentStructureAncestorIds] } },
        );
      }
    }

    return structureId;
  },
});

export const updateStructure = new ValidatedMethod({
  name: 'structures.updateStructure',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
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

    const isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isAdminOfStructure);

    if (!authorized) {
      throw new Meteor.Error('api.structures.updateStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const structuresWithSameNameOnSameLevel = isAStructureWithSameNameExistWithSameParent({
      name,
      parentId: structure.parentId,
      structureId: structure._id,
    });

    if (structuresWithSameNameOnSameLevel) {
      throw new Meteor.Error('api.structures.updateStructure.notPermitted', i18n.__('api.structures.nameAlreadyTaken'));
    }

    return Structures.update({ _id: structureId }, { $set: { name } });
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
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isAdminOfStructure);

    if (!authorized) {
      throw new Meteor.Error('api.structures.removeStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    // Check if structure has children
    if (structure.childrenIds.length > 0) {
      throw new Meteor.Error('api.structures.removeStructure.hasChildren', i18n.__('api.structures.hasChildren'));
    }

    // Check if any service is attached to this structure
    const servicesCursor = Services.find({ structure: structureId });
    if (servicesCursor.count() > 0) {
      throw new Meteor.Error('api.structures.removeStructure.hasServices', i18n.__('api.structures.hasServices'));
    }

    // Check if any user is attached to this structure
    const usersCursor = Meteor.users.find({ structure: structureId });
    if (usersCursor.count() > 0) {
      throw new Meteor.Error('api.structures.removeStructure.hasUsers', i18n.__('api.structures.hasUsers'));
    }

    // If there are any article attached to this structure, delete them
    Articles.rawCollection().deleteMany({ structure: structureId });

    const { ancestorsIds } = structure;

    if (ancestorsIds.length > 0) {
      const ancestorsCursor = Structures.find({ _id: { $in: ancestorsIds } });
      if (ancestorsCursor.count() > 0) {
        ancestorsCursor.forEach((ancestor) => {
          Structures.update(
            { _id: ancestor._id },
            {
              $set: {
                childrenIds: [...new Set(_.without(ancestor.childrenIds, structureId))],
              },
            },
          );
        });
      }
    }

    return Structures.remove(structureId);
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

export const updateStructureIntroduction = new ValidatedMethod({
  name: 'structures.updateIntroduction',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
    ...IntroductionStructure,
  }).validator(),
  run({ structureId, language, title, content }) {
    const structure = Structures.findOne({ _id: structureId });

    if (structure === undefined) {
      throw new Meteor.Error(
        'api.structures.updateIntroduction.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }
    const isAdminOfStructure = hasAdminRightOnStructure({
      userId: this.userId,
      structureId: structure.parentId ? structure.parentId : structureId,
    });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isAdminOfStructure);

    if (!authorized) {
      throw new Meteor.Error('api.structures.updateIntroduction.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const oldIntroductionArray = [...structure.introduction];
    let introductionToChange = oldIntroductionArray.find((entry) => entry.language === language);
    if (!introductionToChange) {
      throw new Meteor.Error(
        'api.structures.updateIntroduction.introductionToChangeNotExists',
        i18n.__('api.users.unknownIntroduction'),
      );
    }

    introductionToChange = {
      ...introductionToChange,
      title,
      content,
    };
    const newIntroductionArray = oldIntroductionArray.map((entry) => {
      if (entry.language === language) return introductionToChange;
      return entry;
    });

    return Structures.update({ _id: structureId }, { $set: { introduction: newIntroductionArray } });
  },
});

// Get list of all method names on Structures
const LISTS_METHODS = _.pluck(
  [createStructure, updateStructure, removeStructure, getAllChilds, updateStructureIntroduction],
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
