import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import SimpleSchema from 'simpl-schema';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
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
      throw new Meteor.Error(
        'api.structures.updateIconOrCoverImage.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const authorized = isActive(this.userId) && hasAdminRightOnStructure({ userId: this.userId, structureId });

    if (!authorized) {
      throw new Meteor.Error('api.structures.updateIconOrCoverImage.notPermitted', i18n.__('api.users.notPermitted'));
    }
    if (iconUrlImage) validateString(iconUrlImage);
    if (coverUrlImage) validateString(coverUrlImage);
    let res = -1;

    if (iconUrlImage !== '-1') res = Structures.update({ _id: structureId }, { $set: { iconUrlImage } });

    if (coverUrlImage !== '-1') res = Structures.update({ _id: structureId }, { $set: { coverUrlImage } });

    logServer(
      `STRUCTURES - METHOD - UPDATE - updateStructureIconOrCoverImage - structureId: ${structureId} 
      / iconUrlImage: ${iconUrlImage} / coverUrlImage: ${coverUrlImage}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    return res;
  },
});

export const deleteIconOrCoverImage = new ValidatedMethod({
  name: 'structures.deleteIconOrCoverImage',
  validate: paramsSchema.validator(),
  run({ structureId, iconUrlImage, coverUrlImage }) {
    const structure = Structures.findOne({ _id: structureId });

    if (structure === undefined) {
      throw new Meteor.Error(
        'api.structures.updateIconOrCoverImage.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }

    const authorized = isActive(this.userId) && hasAdminRightOnStructure({ userId: this.userId, structureId });

    if (!authorized) {
      throw new Meteor.Error('api.structures.deleteIconOrCoverImage.notPermitted', i18n.__('api.users.notPermitted'));
    }

    // If there are icon or cover images ==> delete them from minio
    structureRemoveIconOrCoverImagesFromMinio(structure, iconUrlImage !== '-1', coverUrlImage !== -1);

    let res = {};

    if (iconUrlImage !== '-1') res = Structures.update({ _id: structureId }, { $unset: { iconUrlImage: '' } });

    if (coverUrlImage !== '-1') res = Structures.update({ _id: structureId }, { $unset: { coverUrlImage: '' } });

    logServer(
      `STRUCTURES - METHOD - UPDATE - deleteIconOrCoverImage - structureId: ${structureId} 
      / iconUrlImage: ${iconUrlImage} / coverUrlImage: ${coverUrlImage}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    return res;
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
    _id: {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.structures.labels.id'),
    },
  }).validator(),
  run({ _id }) {
    const user = Meteor.users.findOne({ _id: this.userId });
    return Structures.findOne({ _id: _id || user.structure }, { fields: Structures.publicFields });
  },
});

export const getStructureAndAllChilds = new ValidatedMethod({
  name: 'structures.getStructureAndAllChilds',
  validate: new SimpleSchema({
    structureId: {
      type: String,
      optional: true,
      label: getLabel('api.structures.labels.id'),
    },
    allStructures: {
      type: Boolean,
      optional: true,
    },
  }).validator(),
  run({ structureId, allStructures }) {
    const query = allStructures ? {} : { $or: [{ ancestorsIds: structureId || '' }, { _id: structureId || '' }] };
    return Structures.find(query, {
      fields: Structures.publicFields,
      sort: { name: 1 },
      limit: 10000,
    }).fetch();
  },
});

// Get list of all method names on Structures
const LISTS_METHODS = _.pluck(
  [updateStructureIconOrCoverImage, deleteIconOrCoverImage, getStructures, getOneStructure],
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
