import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import sanitizeHtml from 'sanitize-html';

import { isActive, validateString } from '../../utils';

import GlobalInfos from '../globalInfo';

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
  }).validator({ clean: true }),

  run({ content, language, expirationDate }) {
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

export const getAllGlobalInfo = new ValidatedMethod({
  name: 'globalInfos.getAllGlobalInfo',
  validate: new SimpleSchema({}).validator({ clean: true }),

  run() {
    try {
      return GlobalInfos.find({}).fetch();
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
  }).validator({ clean: true }),

  run({ language, content, expirationDate, id }) {
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

      console.log('expirationDate', expirationDate);

      const updatedGlobalInfo = {
        language,
        content,
        expirationDate,
      };
      GlobalInfos.update({ _id: id }, { $set: updatedGlobalInfo });
      return GlobalInfos.findOne({ _id: id });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});
