import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import sanitizeHtml from 'sanitize-html';
import { getLabel, isActive, sanitizeParameters, validateString, accentInsensitive } from '../utils';
import Structures, { IntroductionStructure } from './structures';
import { hasAdminRightOnStructure, isAStructureWithSameNameExistWithSameParent, getExternalService } from './utils';
import Services from '../services/services';
import Articles from '../articles/articles';
import Groups from '../groups/groups';
import { _createGroup, _removeGroup } from '../groups/methods';
import { removeFilesFolder } from '../files/server/methods';
import logServer, { levels, scopes } from '../logging';

function generatePathOfStructure(structure, tree) {
  if (structure.parentId) {
    const parent = Structures.findOne({ _id: structure.parentId });
    if (parent) {
      const obj = { structureName: parent.name, structureId: parent._id };
      tree.push(obj);
      generatePathOfStructure(parent, tree);
    }
  }
}

function getStructurePath(structure) {
  const tree = [];
  generatePathOfStructure(structure, tree);

  tree.reverse();
  return tree;
}

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
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - createStructure - ${i18n.__('api.structures.nameAlreadyTaken')}`,
        levels.WARN,
        scopes.SYSTEM,
        { name, parentId },
      );
      throw new Meteor.Error(
        'api.structures.createStructure.nameAlreadyTaken',
        i18n.__('api.structures.nameAlreadyTaken'),
      );
    }
    validateString(name);
    logServer(`STRUCTURE - METHODS - INSERT - createStructure`, levels.VERBOSE, scopes.SYSTEM, { name, parentId });
    const structureId = Structures.insert({
      name,
      parentId,
    });

    if (parentId) {
      logServer(
        `STRUCTURE - METHODS - UPDATE - createStructure - id: ${structureId} / ancestorsIds: ${parentId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      // Update ancestorsId with only direct parent
      Structures.update({ _id: structureId }, { $set: { ancestorsIds: [parentId] } });

      const directParentStructure = Structures.findOne({ _id: parentId });
      if (directParentStructure) {
        const { childrenIds: directParentStructureChildrenIds, ancestorsIds: directParentStructureAncestorIds } =
          directParentStructure;

        // Add structure to the parent childrenIds
        directParentStructureChildrenIds.push(structureId);
        logServer(
          `STRUCTURE - METHODS - UPDATE - createStructure - id: ${structureId}
          / childrenIds: ${directParentStructureChildrenIds}`,
          levels.INFO,
          scopes.SYSTEM,
        );

        const currentStructure = Structures.findOne({ _id: structureId });
        if (currentStructure) {
          currentStructure.structurePath = getStructurePath(currentStructure);
          Structures.update({ _id: structureId }, { $set: { structurePath: currentStructure.structurePath } });
        }

        Structures.update(
          { _id: parentId },
          {
            $set: {
              childrenIds: [...new Set(directParentStructureChildrenIds)],
            },
          },
        );

        logServer(
          `STRUCTURE - METHODS - UPDATE - createStructure - id: ${structureId}
          / ancestorsIds: ${parentId} / directParentStructureAncestorIds: ${directParentStructureAncestorIds}`,
          levels.INFO,
          scopes.SYSTEM,
        );
        // Update structure ancestors with parent structure's ancestors too
        Structures.update(
          { _id: structureId },
          { $set: { ancestorsIds: [parentId, ...directParentStructureAncestorIds] } },
        );
      }
    }

    const strucName = `${structureId}_${name}`;

    _createGroup({
      name: strucName,
      type: 15,
      description: 'groupe structure',
      content: '',
      avatar: '',
      plugins: {},
      userId: this.userId,
    });

    const structure = Structures.findOne({ _id: structureId });

    if (structure) {
      const group = Groups.findOne({ name: strucName });
      if (group) {
        structure.groupId = group._id;
        logServer(
          `STRUCTURE - METHODS - UPDATE - createStructure - id: ${structureId} / groupId: ${group._id}`,
          levels.INFO,
          scopes.SYSTEM,
        );
        Structures.update({ _id: structureId }, { $set: { groupId: group._id } });
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
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - updateStructure - ${i18n.__('api.structures.unknownStructure')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, name },
      );
      throw new Meteor.Error(
        'api.structures.updateStructure.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isAdminOfStructure);

    if (!authorized) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - updateStructure - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, name },
      );
      throw new Meteor.Error('api.structures.updateStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const structuresWithSameNameOnSameLevel = isAStructureWithSameNameExistWithSameParent({
      name,
      parentId: structure.parentId,
      structureId: structure._id,
    });

    if (structuresWithSameNameOnSameLevel) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - updateStructure - ${i18n.__('api.structures.nameAlreadyTaken')}}`,
        levels.WARN,
        scopes.SYSTEM,
        { structureId, name },
      );
      throw new Meteor.Error('api.structures.updateStructure.notPermitted', i18n.__('api.structures.nameAlreadyTaken'));
    }
    validateString(name);
    const group = Groups.findOne({ _id: structure.groupId });
    if (group) {
      group.name = `${structure._id}_${name}`;
      Groups.update({ _id: group._id }, { $set: { name: `${structure._id}_${name}` } });
    }

    const structureOfPath = structure.StructurePath;
    if (structureOfPath && structureOfPath.length > 0) {
      const ids = structureOfPath.map((struc) => struc.structureId);
      const allStructures = Structures.find({ _id: { $in: { ids } } }).fetch();
      if (allStructures && allStructures.length > 0) {
        allStructures.map((struc) => {
          if (struc.structurePath) {
            const obj = struc.structurePath.find((strucOnPath) => strucOnPath.structureId === structure._id);
            if (obj) {
              obj.structureName = name;
              return Structures.update({ _id: struc._id }, { $set: { structurePath: struc.StructurePath } });
            }
          }
          return null;
        });
      }
    }

    logServer(`STRUCTURE - METHODS - UPDATE - updateStructure`, levels.VERBOSE, scopes.SYSTEM, { structureId, name });
    return Structures.update({ _id: structureId }, { $set: { name } });
  },
});

export const setUserStructureAdminValidationMandatoryStatus = new ValidatedMethod({
  name: 'structures.setUserStructureAdminValidationMandatoryStatus',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
    userStructureValidationMandatory: {
      type: Boolean,
      label: getLabel('api.appsettings.userStructureValidationMandatory'),
    },
  }).validator(),

  run({ structureId, userStructureValidationMandatory }) {
    // check structure existence
    const structure = Structures.findOne({ _id: structureId });
    if (structure === undefined) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - setUserStructureAdminValidationMandatoryStatus - ${i18n.__(
          'api.structures.unknownStructure',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, userStructureValidationMandatory },
      );
      throw new Meteor.Error(
        'api.structures.setUserStructureAdminValidationMandatoryStatus.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isAdminOfStructure);

    if (!authorized) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - setUserStructureAdminValidationMandatoryStatus - ${i18n.__(
          'api.users.notPermitted',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, userStructureValidationMandatory },
      );
      throw new Meteor.Error(
        'api.structures.setUserStructureAdminValidationMandatoryStatus.notPermitted',
        i18n.__('api.users.notPermitted'),
      );
    }

    logServer(
      `STRUCTURE - METHODS - UPDATE - setUserStructureAdminValidationMandatoryStatus`,
      levels.VERBOSE,
      scopes.SYSTEM,
      { structureId, userStructureValidationMandatory },
    );
    return Structures.update({ _id: structureId }, { $set: { userStructureValidationMandatory } });
  },
});

export const structureRemoveIconOrCoverImagesFromMinio = (structure, removeIconImg, removeCoverImg) => {
  if (Meteor.isServer && !Meteor.isTest && Meteor.settings.public.minioEndPoint) {
    if (structure.iconUrlImage && removeIconImg) {
      removeFilesFolder(`structures/${structure._id}/iconImg`);
    }

    if (structure.coverUrlImage && removeCoverImg) {
      removeFilesFolder(`structures/${structure._id}/coverImg`);
    }
  }
};

export const removeStructure = new ValidatedMethod({
  name: 'structures.removeStructure',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),

  run({ structureId }) {
    // check structure existence
    const structure = Structures.findOne({ _id: structureId });
    if (structure === undefined) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - removeStructure - ${i18n.__('api.structures.unknownStructure')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId },
      );
      throw new Meteor.Error(
        'api.structures.removeStructure.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isAdminOfStructure);

    if (!authorized) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - removeStructure - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId },
      );
      throw new Meteor.Error('api.structures.removeStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    // Check if structure has children
    if (structure.childrenIds.length > 0) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - removeStructure - ${i18n.__('api.structures.hasChildren')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId },
      );
      throw new Meteor.Error('api.structures.removeStructure.hasChildren', i18n.__('api.structures.hasChildren'));
    }

    // Check if any service is attached to this structure
    const servicesCursor = Services.find({ structure: structureId });
    if (servicesCursor.count() > 0) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - removeStructure - ${i18n.__('api.structures.hasServices')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId },
      );
      throw new Meteor.Error('api.structures.removeStructure.hasServices', i18n.__('api.structures.hasServices'));
    }

    // Check if any user is attached to this structure
    const usersCursor = Meteor.users.find({ structure: structureId });
    if (usersCursor.count() > 0) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - removeStructure - ${i18n.__('api.structures.hasUsers')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId },
      );
      throw new Meteor.Error('api.structures.removeStructure.hasUsers', i18n.__('api.structures.hasUsers'));
    }

    logServer(`STRUCTURE - METHODS - REMOVE - removeStructure`, levels.INFO, scopes.SYSTEM, { structureId });
    // If there are any article attached to this structure, delete them
    Articles.rawCollection().deleteMany({ structure: structureId });

    const { ancestorsIds } = structure;

    if (ancestorsIds.length > 0) {
      const ancestorsCursor = Structures.find({ _id: { $in: ancestorsIds } });
      if (ancestorsCursor.count() > 0) {
        ancestorsCursor.forEach((ancestor) => {
          logServer(
            `STRUCTURE - METHODS - UPDATE - removeStructure - ancestor id: ${ancestor._id}
             / structureid: ${structureId}`,
            levels.INFO,
            scopes.SYSTEM,
          );
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

    const group = Groups.findOne({ _id: structure.groupId });
    if (group) {
      _removeGroup({ groupId: group._id, userId: this.userId });
    }
    // If there are icon or cover images ==> delete them from minio
    structureRemoveIconOrCoverImagesFromMinio(structure, true, true);

    logServer(`STRUCTURE - METHODS - REMOVE - removeStructure`, levels.VERBOSE, scopes.SYSTEM, { structureId });
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
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - getAllChilds - ${i18n.__('api.structures.unknownStructure')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId },
      );
      throw new Meteor.Error(
        'api.structures.removeStructure.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const authorized = isActive(this.userId);

    if (!authorized) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - getAllChilds - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId },
      );
      throw new Meteor.Error('api.structures.getAllChilds.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const childs = Structures.find({ ancestorsIds: structureId }).fetch();
    return childs;
  },
});

export const updateStructureContactEmail = new ValidatedMethod({
  name: 'structures.updateContactData',
  validate: new SimpleSchema({
    contactEmail: {
      type: String,
    },
    externalUrl: {
      type: String,
    },
    sendMailToParent: {
      type: Boolean,
    },
    sendMailToStructureAdmin: {
      type: Boolean,
    },
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),
  run({ structureId, contactEmail, externalUrl, sendMailToParent, sendMailToStructureAdmin }) {
    const structure = Structures.findOne({ _id: structureId });

    if (structure === undefined) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - updateStructureContactEmail - ${i18n.__(
          'api.structures.unknownStructure',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, contactEmail, externalUrl, sendMailToParent, sendMailToStructureAdmin },
      );
      throw new Meteor.Error(
        'api.structures.updateContactEmail.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const authorized = isActive(this.userId) && hasAdminRightOnStructure({ userId: this.userId, structureId });

    if (!authorized) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - updateStructureContactEmail - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, contactEmail, externalUrl, sendMailToParent, sendMailToStructureAdmin },
      );
      throw new Meteor.Error('api.structures.updateContactEmail.notPermitted', i18n.__('api.users.notPermitted'));
    }
    if (contactEmail) {
      validateString(contactEmail);
    }
    if (externalUrl) {
      validateString(externalUrl);
    }
    logServer(`STRUCTURE - METHODS - UPDATE - updateStructureContactEmail`, levels.VERBOSE, scopes.SYSTEM, {
      structureId,
      contactEmail,
      externalUrl,
      sendMailToParent,
      sendMailToStructureAdmin,
    });

    return Structures.update(
      { _id: structureId },
      { $set: { contactEmail, externalUrl, sendMailToParent, sendMailToStructureAdmin } },
    );
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
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - updateStructureIntroduction - ${i18n.__(
          'api.structures.unknownStructure',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, language, title, content },
      );
      throw new Meteor.Error(
        'api.structures.updateIntroduction.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }
    const isAdminOfStructure = hasAdminRightOnStructure({
      userId: this.userId,
      structureId,
    });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isAdminOfStructure);

    if (!authorized) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - updateStructureIntroduction - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, language, title, content },
      );
      throw new Meteor.Error('api.structures.updateIntroduction.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const oldIntroductionArray = [...structure.introduction];
    let introductionToChange = oldIntroductionArray.find((entry) => entry.language === language);
    if (!introductionToChange) {
      logServer(
        `STRUCTURE - METHODS - METEOR ERROR - updateStructureIntroduction - ${i18n.__(
          'api.users.unknownIntroduction',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId, language, title, content },
      );
      throw new Meteor.Error(
        'api.structures.updateIntroduction.introductionToChangeNotExists',
        i18n.__('api.users.unknownIntroduction'),
      );
    }
    validateString(title);
    const sanitizedContent = sanitizeHtml(content, sanitizeParameters);
    validateString(sanitizedContent);
    introductionToChange = {
      ...introductionToChange,
      title,
      content: sanitizedContent,
    };
    const newIntroductionArray = oldIntroductionArray.map((entry) => {
      if (entry.language === language) return introductionToChange;
      return entry;
    });

    logServer(
      `STRUCTURE - METHODS - UPDATE - updateStructureIntroduction - structure id: ${structureId}
      / introduction: ${newIntroductionArray}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    return Structures.update({ _id: structureId }, { $set: { introduction: newIntroductionArray } });
  },
});

export const getStructures = new ValidatedMethod({
  name: 'structures.getStructures',
  validate: null,
  run() {
    return Structures.find().fetch();
  },
});

export const getOneStructure = new ValidatedMethod({
  name: 'structures.getOneStructure',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),
  run({ structureId }) {
    const structure = Structures.findOne({ _id: structureId });
    return structure;
  },
});

export const getContactURL = new ValidatedMethod({
  name: 'structures.getContactURL',
  validate: null,
  run() {
    if (!this.userId) {
      throw new Meteor.Error('api.structures.getContactURL.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const user = Meteor.users.findOne(this.userId);
    const structure = Structures.findOne(user.structure);
    if (structure) return getExternalService(structure);
    return null;
  },
});

export const getTopLevelStructures = new ValidatedMethod({
  name: 'structures.getTopLevelStructures',
  validate: null,
  run() {
    return Structures.find({ $or: [{ parentId: null }, { parentId: '' }] }).fetch();
  },
});

function generateTreeParentToChild(structure, tree, level) {
  if (structure.childrenIds && structure.childrenIds.length > 0) {
    const structures = Structures.find({ _id: { $in: structure.childrenIds } }).fetch();
    if (structures) {
      structures.map((struc) => {
        const child = { structure: struc, level };
        tree.push(child);
        return generateTreeParentToChild(struc, tree, level + 1);
      });
    }
  }
}

export const getTreeOfStructure = new ValidatedMethod({
  name: 'structures.getTreeOfStructure',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  }).validator(),
  run({ structureId }) {
    const tree = [];
    const structure = Structures.findOne({ _id: structureId });
    const obj = { structure, level: 0 };
    tree.push(obj);
    generateTreeParentToChild(structure, tree, 1);

    return tree;
  },
});

export const searchStructure = new ValidatedMethod({
  name: 'structures.searchStructure',
  validate: new SimpleSchema({
    searchText: { type: String },
  }).validator(),
  run({ searchText }) {
    const regex = new RegExp(accentInsensitive(searchText), 'i');
    const structures = Structures.find({ name: { $regex: regex } }).fetch();
    return structures;
  },
});

export const searchStructureById = new ValidatedMethod({
  name: 'structures.searchStructureById',
  validate: new SimpleSchema({
    structureId: { type: String },
  }).validator(),
  run({ structureId }) {
    const structure = Structures.find({ _id: structureId }).fetch();
    return structure;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on Structures
  const LISTS_METHODS = _.pluck(
    [
      createStructure,
      updateStructure,
      removeStructure,
      getAllChilds,
      updateStructureIntroduction,
      updateStructureContactEmail,
      getStructures,
      getOneStructure,
      getContactURL,
      setUserStructureAdminValidationMandatoryStatus,
      getTopLevelStructures,
      getTreeOfStructure,
      searchStructure,
    ],
    'name',
  );

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
