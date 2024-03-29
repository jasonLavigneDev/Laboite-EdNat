import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel, validateString } from '../utils';
import Nextcloud from './nextcloud';
import logServer, { levels, scopes } from '../logging';

function _updateNextcloudURL(url, active, count) {
  logServer(
    `NEXTCLOUD - METHOD - REMOVE - _updateNextcloudURL - url: ${url} / active: ${active} / count: ${count}`,
    levels.VERBOSE,
    scopes.SYSTEM,
  );
  Nextcloud.update({ url }, { $set: { active, count } });
}

function _createUrl(url, active) {
  try {
    logServer(
      `NEXTCLOUD - METHOD - INSERT - _createUrl - url: ${url} / active: ${active}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    Nextcloud.insert({ url, active });
  } catch (error) {
    if (error.code === 11000) {
      logServer(
        `NEXTCLOUD - METHOD - METEOR ERROR - _createUrl - ${i18n.__('api.nextcloud.urlAlreadyExists')}`,
        levels.WARN,
        scopes.SYSTEM,
        { error },
      );
      throw new Meteor.Error('api.nextcloud._createUrl.urlAlreadyExists', i18n.__('api.nextcloud.urlAlreadyExists'));
    } else {
      throw error;
    }
  }
}

export function getRandomNCloudURL() {
  const element = Nextcloud.findOne({ active: true }, { sort: { count: 1 } });

  if (element !== undefined) {
    element.count += 1;
    _updateNextcloudURL(element.url, element.active, element.count);
    return element.url;
  }
  return '';
}

export const updateNextcloudURL = new ValidatedMethod({
  name: 'nextcloud.updateURL',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.nextcloud.labels.url') },
    active: { type: Boolean, optional: true, label: getLabel('api.nextcloud.labels.active') },
  }).validator({ clean: true }),

  run({ url, active }) {
    const isAllowed = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!isAllowed) {
      logServer(
        `NEXTCLOUD - METHOD - METEOR ERROR - removeNextcloudURL - ${i18n.__('api.nextcloud.adminRankNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { url, active },
      );
      throw new Meteor.Error('api.nextcloud.updateNextcloudURL.notPermitted', i18n.__('api.nextcloud.adminRankNeeded'));
    }

    validateString(url);
    const ncloud = Nextcloud.findOne({ url });
    if (ncloud === undefined) {
      return _createUrl(url, active);
    }

    return _updateNextcloudURL(url, active, ncloud.count);
  },
});

export const removeNextcloudURL = new ValidatedMethod({
  name: 'nextcloud.removeURL',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.nextcloud.labels.url') },
  }).validator(),

  run({ url }) {
    // check group existence
    const ncloud = Nextcloud.findOne({ url });
    if (ncloud === undefined) {
      logServer(
        `NEXTCLOUD - METHOD - METEOR ERROR - removeNextcloudURL - ${i18n.__('api.nextcloud.unknownURL')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { url },
      );
      throw new Meteor.Error('api.nextcloud.removeNextcloudURL.unknownURL', i18n.__('api.nextcloud.unknownURL'));
    }
    // check if current user has admin rights
    if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
      logServer(
        `NEXTCLOUD - METHOD - METEOR ERROR - removeNextcloudURL - ${i18n.__('api.nextcloud.adminGroupNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { url },
      );
      throw new Meteor.Error(
        'api.nextcloud.removeNextcloudURL.notPermitted',
        i18n.__('api.nextcloud.adminGroupNeeded'),
      );
    }
    if (ncloud.count > 0) {
      logServer(
        `NEXTCLOUD - METHOD - METEOR ERROR - removeNextcloudURL - ${i18n.__('api.nextcloud.mustNotBeUsed')}`,
        levels.WARN,
        scopes.SYSTEM,
        { url },
      );
      throw new Meteor.Error('api.nextcloud.removeNextcloudURL.notPermitted', i18n.__('api.nextcloud.mustNotBeUsed'));
    }
    logServer(`NEXTCLOUD - METHOD - REMOVE - removeNextcloudURL - url: ${url}`, levels.VERBOSE, scopes.SYSTEM);
    Nextcloud.remove({ url });

    return null;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck([updateNextcloudURL, removeNextcloudURL], 'name');
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
