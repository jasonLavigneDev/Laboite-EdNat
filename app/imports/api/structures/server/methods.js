import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import SimpleSchema from 'simpl-schema';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import { Roles } from 'meteor/alanning:roles';
import { unauthorized } from '../../lib/errors';
import { getLabel, isActive, validateString } from '../../utils';
import Structures from '../structures';
import { hasAdminRightOnStructure } from '../utils';
import { structureRemoveIconOrCoverImagesFromMinio } from '../methods';
import logServer, { levels, scopes } from '../../logging';

const paramsSchema = new SimpleSchema({
  structureId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.structures.labels.id') },
  iconUrlImage: {
    type: String,
    regEx: SimpleSchema.RegEx.url,
  },
  coverUrlImage: {
    type: String,
    regEx: SimpleSchema.RegEx.url,
  },
});

export const updateStructureIconOrCoverImage = new ValidatedMethod({
  name: 'structures.updateStructureIconOrCoverImage',
  validate: paramsSchema.validator(),
  run({ structureId, iconUrlImage, coverUrlImage }) {
    const structure = Structures.findOne({ _id: structureId });

    if (structure === undefined) {
      logServer(
        `STRUCTURES - METHOD - METEOR ERROR - updateStructureIconOrCoverImage - ${i18n.__(
          'api.structures.unknownStructure',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          structureId,
          iconUrlImage,
          coverUrlImage,
        },
      );
      throw new Meteor.Error(
        'api.structures.updateIconOrCoverImage.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const authorized = isActive(this.userId) && hasAdminRightOnStructure({ userId: this.userId, structureId });

    if (!authorized) {
      logServer(
        `STRUCTURES - METHOD - METEOR ERROR - updateStructureIconOrCoverImage - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          structureId,
          iconUrlImage,
          coverUrlImage,
        },
      );
      throw new Meteor.Error('api.structures.updateIconOrCoverImage.notPermitted', i18n.__('api.users.notPermitted'));
    }
    if (iconUrlImage) validateString(iconUrlImage);
    if (coverUrlImage) validateString(coverUrlImage);
    let res = -1;

    if (iconUrlImage !== '-1') res = Structures.update({ _id: structureId }, { $set: { iconUrlImage } });

    if (coverUrlImage !== '-1') res = Structures.update({ _id: structureId }, { $set: { coverUrlImage } });

    logServer(`STRUCTURES - METHOD - UPDATE - updateStructureIconOrCoverImage`, levels.INFO, scopes.SYSTEM, {
      structureId,
      iconUrlImage,
      coverUrlImage,
    });
    return res;
  },
});

export const deleteIconOrCoverImage = new ValidatedMethod({
  name: 'structures.deleteIconOrCoverImage',
  validate: paramsSchema.validator(),
  run({ structureId, iconUrlImage, coverUrlImage }) {
    const structure = Structures.findOne({ _id: structureId });

    if (structure === undefined) {
      logServer(
        `STRUCTURES - METHOD - METEOR ERROR - deleteIconOrCoverImage - ${i18n.__('api.structures.unknownStructure')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          structureId,
          iconUrlImage,
          coverUrlImage,
        },
      );
      throw new Meteor.Error(
        'api.structures.updateIconOrCoverImage.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const authorized = isActive(this.userId) && hasAdminRightOnStructure({ userId: this.userId, structureId });

    if (!authorized) {
      logServer(
        `STRUCTURES - METHOD - METEOR ERROR - deleteIconOrCoverImage - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          structureId,
          iconUrlImage,
          coverUrlImage,
        },
      );
      throw new Meteor.Error('api.structures.deleteIconOrCoverImage.notPermitted', i18n.__('api.users.notPermitted'));
    }

    // If there are icon or cover images ==> delete them from minio
    structureRemoveIconOrCoverImagesFromMinio(structure, iconUrlImage !== '-1', coverUrlImage !== -1);

    let res = {};

    if (iconUrlImage !== '-1') res = Structures.update({ _id: structureId }, { $unset: { iconUrlImage: '' } });

    if (coverUrlImage !== '-1') res = Structures.update({ _id: structureId }, { $unset: { coverUrlImage: '' } });

    logServer(`STRUCTURES - METHOD - UPDATE - deleteIconOrCoverImage`, levels.INFO, scopes.SYSTEM, {
      structureId,
      iconUrlImage,
      coverUrlImage,
    });
    return res;
  },
});

export const getStructureAndAllChilds = new ValidatedMethod({
  name: 'structures.getStructureAndAllChilds',
  validate: new SimpleSchema({
    allStructures: {
      type: Boolean,
      optional: true,
    },
  }).validator(),
  run({ allStructures }) {
    const user = Meteor.user({ structure: 1 });
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');

    if (allStructures && !isAdmin) {
      throw unauthorized();
    }

    if (!(isAdmin || Roles.userIsInRole(this.userId, 'adminStructure', user.structure))) {
      throw unauthorized();
    }

    const $match = {};

    if (allStructures) {
      $match.parentId = null;
    } else {
      $match._id = user.structure;
    }

    const structureTree = Structures.aggregate([
      { $match },
      {
        $graphLookup: {
          from: 'structures',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'subStructures',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          subStructures: 1,
        },
      },
    ]);

    return structureTree;

    // return Structures.find(query, {
    //   fields: Structures.publicFields,
    //   sort: { name: 1 },
    //   limit: 10000,
    // }).fetch();
  },
});

// Get list of all method names on Structures

if (Meteor.isServer) {
  const LISTS_METHODS = _.pluck([updateStructureIconOrCoverImage, deleteIconOrCoverImage], 'name');

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
