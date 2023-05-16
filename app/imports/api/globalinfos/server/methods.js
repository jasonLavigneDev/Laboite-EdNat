import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import sanitizeHtml from 'sanitize-html';

import { isActive, validateString } from '../../utils';

import GlobalInfos from '../globalInfo';

export const DEFAULT_EXPIRATION_IN_DAYS = 30;

export const createGlobalInfo = new ValidatedMethod({
  name: 'globalInfos.createGlobalInfo',
  validate: new SimpleSchema({
    language: {
      type: String,
    },
    content: {
      type: String,
    },
    expirationDays: {
      type: Number,
      min: 1,
      max: 90,
      optional: true,
    },
  }).validator({ clean: true }),

  run({ content, language, expirationDays = DEFAULT_EXPIRATION_IN_DAYS }) {
    if (language) validateString(language, true);
    let sanitizedContent = '';
    if (content) {
      sanitizedContent = sanitizeHtml(content);
      validateString(sanitizedContent);
    }
    try {
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error(
          'api.appsettings.updateIntroductionLanguage.notPermitted',
          i18n.__('api.users.adminNeeded'),
        );
      }
      const today = new Date();
      const expirationTimestamp = today.setDate(today.getDate() + expirationDays);
      const expirationDate = new Date(expirationTimestamp);

      const newGlobalInfo = {
        language,
        content,
        expirationDate,
      };

      const newId = GlobalInfos.insert(newGlobalInfo);
      return GlobalInfos.findOne({ _id: newId });
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
  }).validator({ clean: true }),

  run({ language }) {
    validateString(language, true);
    try {
      return GlobalInfos.find({ language }).fetch();
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
      return GlobalInfos.find(
        { $and: [{ language }, { expirationDate: { $gt: date } }] },
        { sort: { expirationDate: 1 } },
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
  }).validator({ clean: true }),

  run({ messageId }) {
    try {
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
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
