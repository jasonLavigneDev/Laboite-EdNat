import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import sanitizeHtml from 'sanitize-html';
import logServer from '../logging';

import { isActive, getLabel, validateString } from '../utils';
import AppSettings from './appsettings';

export function checkMigrationStatus() {
  if (Migrations._getControl().locked === true) {
    logServer('Migration lock detected !!!!', 'error');
    AppSettings.update({}, { $set: { maintenance: true, textMaintenance: 'api.appsettings.migrationLockedText' } });
  }
}

export const updateAppsettings = new ValidatedMethod({
  name: 'appSettings.updateAppsettings',
  validate: new SimpleSchema({
    external: {
      type: Boolean,
      label: getLabel('api.appsettings.labels.external'),
      optional: true,
    },
    link: {
      type: String,
      label: getLabel('api.appsettings.labels.link'),
      optional: true,
    },
    content: {
      type: String,
      label: getLabel('api.appsettings.labels.content'),
      optional: true,
    },
    key: {
      type: String,
    },
  }).validator({ clean: true }),

  run({ external, link, content, key }) {
    try {
      if (link) validateString(link);
      let sanitizedContent = '';
      if (content) {
        sanitizedContent = sanitizeHtml(content);
        validateString(sanitizedContent);
      }
      validateString(key, true);
      // check if current user is admin
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error('api.appsettings.updateAppsettings.notPermitted', i18n.__('api.users.adminNeeded'));
      }
      const args = { content: sanitizedContent, external, link };
      return AppSettings.update({ _id: 'settings' }, { $set: { [key]: args } });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const switchMaintenanceStatus = new ValidatedMethod({
  name: 'appSettings.switchMaintenanceStatus',
  validate: new SimpleSchema({
    unlockMigration: {
      type: Boolean,
      label: getLabel('api.appsettings.labels.unlockMigration'),
      optional: true,
      defaultValue: false,
    },
  }).validator({ clean: true }),

  run({ unlockMigration }) {
    try {
      // check if current user is admin
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error(
          'api.appsettings.switchMaintenanceStatus.notPermitted',
          i18n.__('api.users.adminNeeded'),
        );
      }
      const appsettings = AppSettings.findOne({ _id: 'settings' });
      const newValue = !(appsettings.maintenance || false);
      if (Meteor.isServer === true && unlockMigration === true) {
        Migrations.unlock();
        // force migration to latest after unlock
        Migrations.migrateTo('latest');
        checkMigrationStatus();
        return AppSettings.update({ _id: 'settings' }, { $set: { maintenance: newValue, textMaintenance: '' } });
      }
      return AppSettings.update({ _id: 'settings' }, { $set: { maintenance: newValue } });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const setUserStructureValidationMandatoryStatus = new ValidatedMethod({
  name: 'appSettings.setUserStructureValidationMandatoryStatus',
  validate: new SimpleSchema({ isValidationMandatory: { type: Boolean } }).validator(),
  run({ isValidationMandatory }) {
    try {
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error(
          'api.appsettings.setUserStructureValidationMandatoryStatus.notPermitted',
          i18n.__('api.users.admineeded'),
        );
      }
      return AppSettings.update(
        { _id: 'settings' },
        { $set: { userStructureValidationMandatory: isValidationMandatory } },
      );
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const updateTextMaintenance = new ValidatedMethod({
  name: 'appSettings.updateTextMaintenance',
  validate: new SimpleSchema({
    text: {
      type: String,
      label: getLabel('api.appsettings.labels.textMaintenance'),
      optional: true,
    },
  }).validator({ clean: true }),

  run({ text }) {
    if (text) validateString(text);
    try {
      // check if current user is admin
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error('api.appsettings.updateTextMaintenance.notPermitted', i18n.__('api.users.adminNeeded'));
      }
      return AppSettings.update({ _id: 'settings' }, { $set: { textMaintenance: text } });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const updateTextInfoLanguage = new ValidatedMethod({
  name: 'appSettings.updateTextInfoLanguage',
  validate: new SimpleSchema({
    language: {
      type: String,
      label: getLabel('api.appsettings.labels.external'),
      optional: true,
    },
    content: {
      type: String,
      label: getLabel('api.appsettings.labels.content'),
      optional: true,
    },
    tabkey: {
      type: String,
      label: getLabel('api.appsettings.labels.tabkey'),
      optional: true,
    },
  }).validator({ clean: true }),

  run({ language, content, tabkey }) {
    if (language) validateString(language, true);
    if (tabkey) validateString(tabkey, true);
    let sanitizedContent = '';
    if (content) {
      sanitizedContent = sanitizeHtml(content);
      validateString(sanitizedContent);
    }
    try {
      // check if current user is admin
      const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
      if (!authorized) {
        throw new Meteor.Error(
          'api.appsettings.updateIntroductionLanguage.notPermitted',
          i18n.__('api.users.adminNeeded'),
        );
      }
      const appsettings = AppSettings.findOne({});
      let newInfo;
      let langIndex;
      if (tabkey === 'globalInfo') {
        const { globalInfo } = appsettings;
        newInfo = [...globalInfo];
        langIndex = globalInfo.findIndex((entry) => entry.language === language);
      } else if (tabkey === 'introduction') {
        const { introduction } = appsettings;
        newInfo = [...introduction];
        langIndex = introduction.findIndex((entry) => entry.language === language);
      }

      if (langIndex > -1) {
        newInfo[langIndex].content = sanitizedContent;
      } else {
        newInfo.push({ language, content: sanitizedContent });
      }

      return AppSettings.update({ _id: 'settings' }, { $set: { [tabkey]: newInfo } });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

export const getAppSettingsLinks = new ValidatedMethod({
  name: 'appSettings.getAppSettingsLinks',
  validate: null,
  run() {
    try {
      return AppSettings.findOne({ _id: 'settings' }, { fields: AppSettings.links });
    } catch (error) {
      throw new Meteor.Error(error, error);
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    updateAppsettings,
    updateTextMaintenance,
    updateTextInfoLanguage,
    switchMaintenanceStatus,
    getAppSettingsLinks,
    setUserStructureValidationMandatoryStatus,
  ],
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
