import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import sanitizeHtml from 'sanitize-html';

import { isActive, sanitizeParameters, validateString } from '../../utils';

import GlobalInfos from '../globalInfo';
import Structures from '../../structures/structures';

export const createGlobalInfo = new ValidatedMethod({
  name: 'globalInfos.createGlobalInfo',
  validate: new SimpleSchema({
    language: {
      type: String,
    },
    content: {
      type: String,
    },
    expirationDate: {
      type: Date,
      optional: false,
    },
    structure: {
      type: Boolean,
      defaultValue: false,
    },
  }).validator({ clean: true }),

  run({ content, language, expirationDate, structure }) {
    if (language) validateString(language, true);
    let sanitizedContent = '';
    if (content) {
      sanitizedContent = sanitizeHtml(content, sanitizeParameters);
      validateString(sanitizedContent);
    }
    try {
      const structId = Meteor.users.findOne(this.userId)?.structure;
      const authorized =
        isActive(this.userId) && structure
          ? Roles.userIsInRole(this.userId, 'adminStructure', structId)
          : Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error(
          'api.appsettings.updateIntroductionLanguage.notPermitted',
          i18n.__('api.users.adminNeeded'),
        );
      }

      const newGlobalInfo = {
        language,
        content,
        expirationDate,
      };

      if (structure) {
        const structName = Structures.findOne(structId).name;
        newGlobalInfo.structureId = [structId];
        newGlobalInfo.structureName = structName;
      }

      const newId = GlobalInfos.insert(newGlobalInfo);
      return GlobalInfos.findOne({ _id: newId });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const getAllGlobalInfo = new ValidatedMethod({
  name: 'globalInfos.getAllGlobalInfo',
  validate: new SimpleSchema({
    structure: {
      type: Boolean,
      defaultValue: false,
    },
  }).validator({ clean: true }),

  run({ structure }) {
    try {
      const structId = Meteor.users.findOne(this.userId)?.structure;
      const structQuery = structure ? { structureId: structId } : { structureId: [] };
      return GlobalInfos.find(structQuery).fetch();
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const getAllGlobalInfoByLanguage = new ValidatedMethod({
  name: 'globalInfos.getAllGlobalInfoByLanguage',
  validate: new SimpleSchema({
    language: {
      type: String,
    },
    structure: {
      type: Boolean,
      defaultValue: false,
    },
  }).validator({ clean: true }),

  run({ language, structure }) {
    validateString(language, true);
    try {
      const structId = Meteor.users.findOne(this.userId)?.structure;
      const structQuery = structure ? { language, structureId: structId } : { language, structureId: [] };
      return GlobalInfos.find(structQuery).fetch();
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const getGlobalInfoByLanguageAndNotExpired = new ValidatedMethod({
  name: 'globalInfos.getGlobalInfoByLanguageAndNotExpired',
  validate: new SimpleSchema({
    language: {
      type: String,
    },
    date: {
      type: Date,
    },
  }).validator({ clean: true }),

  run({ language, date }) {
    validateString(language, true);
    try {
      const structId = Meteor.users.findOne(this.userId)?.structure;
      let structures = [];
      if (structId) {
        const parentStructs = Structures.findOne(structId).ancestorsIds;
        structures = [structId, ...parentStructs];
      }
      return GlobalInfos.find(
        {
          $and: [
            { language },
            { expirationDate: { $gt: date } },
            { $or: [{ structureId: { $in: structures } }, { structureId: [] }] },
          ],
        },
        { sort: { updatedAt: -1 } },
      ).fetch();
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const deleteGlobalInfo = new ValidatedMethod({
  name: 'globalInfos.deleteGlobalInfo',
  validate: new SimpleSchema({
    messageId: {
      type: String,
    },
    structure: {
      type: Boolean,
      defaultValue: false,
    },
  }).validator({ clean: true }),

  run({ messageId, structure }) {
    try {
      const structId = Meteor.users.findOne(this.userId)?.structure;
      const authorized =
        isActive(this.userId) && structure
          ? Roles.userIsInRole(this.userId, 'adminStructure', structId)
          : Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error(
          'api.appsettings.updateIntroductionLanguage.notPermitted',
          i18n.__('api.users.adminNeeded'),
        );
      }
      return GlobalInfos.remove(messageId);
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const updateGlobalInfo = new ValidatedMethod({
  name: 'globalInfos.updateGlobalInfo',
  validate: new SimpleSchema({
    language: {
      type: String,
    },
    content: {
      type: String,
    },
    expirationDate: {
      type: Date,
      optional: true,
    },
    id: {
      type: String,
    },
    structure: {
      type: Boolean,
      defaultValue: false,
    },
    publish: {
      type: Boolean,
      defaultValue: false,
    },
  }).validator({ clean: true }),

  run({ language, content, expirationDate, id, structure, publish }) {
    if (language) validateString(language, true);
    let sanitizedContent = '';
    if (content) {
      sanitizedContent = sanitizeHtml(content, sanitizeParameters);
      validateString(sanitizedContent);
    }
    try {
      const structId = Meteor.users.findOne(this.userId)?.structure;
      const authorized =
        isActive(this.userId) && structure
          ? Roles.userIsInRole(this.userId, 'adminStructure', structId)
          : Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error(
          'api.appsettings.updateIntroductionLanguage.notPermitted',
          i18n.__('api.users.adminNeeded'),
        );
      }

      const updatedGlobalInfo = {
        language,
        content,
        expirationDate,
      };
      if (publish) updatedGlobalInfo.updatedAt = new Date();
      GlobalInfos.update({ _id: id }, { $set: updatedGlobalInfo });
      return GlobalInfos.findOne({ _id: id });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});
