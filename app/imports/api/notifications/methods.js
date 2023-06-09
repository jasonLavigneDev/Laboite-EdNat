import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel, validateString } from '../utils';
import Notifications from './notifications';
import logServer, { levels, scopes } from '../logging';

export function addExpiration(data) {
  const finalData = { ...data };
  function addDays(date, days) {
    const result = new Date(Number(date));
    // for tests : add minutes instead of days
    // result.setTime(date.getTime() + days * 60 * 1000);
    result.setDate(date.getDate() + days);
    return result;
  }
  // check if an expiration delay has been configured
  if (Meteor.settings.public.NotificationsExpireDays) {
    const dataType =
      typeof Meteor.settings.public.NotificationsExpireDays[data.type] !== 'number' ? 'default' : data.type;
    const numDays = Meteor.settings.public.NotificationsExpireDays[dataType];
    if (numDays || numDays === 0) {
      if (typeof numDays !== 'number') {
        logServer(
          `NOTIFICATIONS - METHODS - METEOR ERROR - addExpiration - ${i18n.__(
            'api.notifications.expirationNotNumber',
          )}`,
          levels.ERROR,
          scopes.SYSTEM,
          { data },
        );
        throw new Meteor.Error('api.notifications.badConfig', i18n.__('api.notifications.expirationNotNumber'));
      } else if (numDays > 0) {
        // if delay is set to 0 or negative number,
        // no expiration is set (allows to ignore default delay)
        const expireAt = addDays(new Date(), numDays);
        finalData.expireAt = expireAt;
      }
    }
  }
  return finalData;
}

export const createNotification = new ValidatedMethod({
  name: 'notifications.createNotification',
  validate: new SimpleSchema({
    data: Notifications.schema.omit('createdAt'),
  }).validator({ clean: true }),

  run({ data }) {
    const authorized = true; // TODO isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');

    if (!authorized) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - createNotification - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { data },
      );
      throw new Meteor.Error('api.notifications.createNotification.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    if (data.title) validateString(data.title);
    if (data.content) validateString(data.content);
    if (data.link) validateString(data.link);
    logServer(
      `NOTIFICATIONS - METHODS - INSERT - createNotification - data: ${JSON.stringify(addExpiration(data))}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    Notifications.insert(addExpiration(data));
  },
});

export const removeNotification = new ValidatedMethod({
  name: 'notifications.removeNotification',
  validate: new SimpleSchema({
    notificationId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.notifications.labels.id') },
  }).validator(),

  run({ notificationId }) {
    if (!isActive(this.userId)) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - removeNotification - ${i18n.__('api.notifications.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
        { notificationId },
      );
      throw new Meteor.Error(
        'api.notifications.removeNotification.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    const notification = Notifications.findOne({ _id: notificationId });
    const authorized = this.userId === notification.userId;
    if (!authorized) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - removeNotification - ${i18n.__(
          'api.notifications.adminArticleNeeded',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { notificationId },
      );
      throw new Meteor.Error(
        'api.notifications.removeNotification.notPermitted',
        i18n.__('api.notifications.adminArticleNeeded'),
      );
    }
    logServer(
      `NOTIFICATIONS - METHODS - REMOVE - removeNotification - id: ${notificationId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Notifications.remove(notificationId);
  },
});

export const removeAllNotification = new ValidatedMethod({
  name: 'notifications.removeAllNotification',
  validate: null,

  run() {
    if (!isActive(this.userId)) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - removeAllNotification - ${i18n.__(
          'api.notifications.mustBeLoggedIn',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
      );
      throw new Meteor.Error(
        'api.notifications.removeAllNotification.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    logServer(
      `NOTIFICATIONS - METHODS - REMOVE - removeAllNotification - user id: ${this.userId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Notifications.remove({ userId: this.userId });
  },
});

export const removeAllNotificationRead = new ValidatedMethod({
  name: 'notifications.removeAllNotificationRead',
  validate: null,

  run() {
    if (!isActive(this.userId)) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - removeAllNotificationRead - ${i18n.__(
          'api.notifications.mustBeLoggedIn',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
      );
      throw new Meteor.Error(
        'api.notifications.removeAllNotificationRead.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    logServer(
      `NOTIFICATIONS - METHODS - REMOVE - removeAllNotificationRead - user id: ${this.userId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Notifications.remove({ userId: this.userId, read: true });
  },
});

export const markNotificationAsRead = new ValidatedMethod({
  name: 'notifications.markNotificationAsRead',
  validate: new SimpleSchema({
    notificationId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.notifications.labels.id') },
  }).validator(),

  run({ notificationId }) {
    if (!isActive(this.userId)) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - markNotificationAsRead - ${i18n.__(
          'api.notifications.mustBeLoggedIn',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
        { notificationId },
      );
      throw new Meteor.Error(
        'api.notifications.markNotificationAsRead.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    const notification = Notifications.findOne({ _id: notificationId });
    const authorized = this.userId === notification.userId;
    if (!authorized) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - markNotificationAsRead - ${i18n.__(
          'api.notifications.adminArticleNeeded',
        )}`,
        levels.ERROR,
        scopes.SYSTEM,
        { notificationId },
      );
      throw new Meteor.Error(
        'api.notifications.markNotificationAsRead.notPermitted',
        i18n.__('api.notifications.adminArticleNeeded'),
      );
    }
    logServer(
      `NOTIFICATIONS - METHODS - UPDATE - markNotificationAsRead - id: ${notificationId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Notifications.update({ _id: notificationId }, { $set: { read: true } });
  },
});

export const markAllNotificationAsRead = new ValidatedMethod({
  name: 'notifications.markAllNotificationAsRead',
  validate: null,

  run() {
    if (!isActive(this.userId)) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - markAllNotificationAsRead - ${i18n.__(
          'api.notifications.mustBeLoggedIn',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
      );
      throw new Meteor.Error(
        'api.notifications.markAllNotificationAsRead.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    logServer(
      `NOTIFICATIONS - METHODS - UPDATE - markAllNotificationAsRead - user id: ${this.userId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Notifications.update({ userId: this.userId }, { $set: { read: true } }, { multi: true });
  },
});

export const markAllTypeNotificationAsRead = new ValidatedMethod({
  name: 'notifications.markAllTypeNotificationAsRead',
  validate: new SimpleSchema({
    type: Array,
    'type.$': String,
  }).validator(),
  run({ type }) {
    if (!isActive(this.userId)) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - markAllTypeNotificationAsRead - ${i18n.__(
          'api.notifications.mustBeLoggedIn',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
        { type },
      );
      throw new Meteor.Error(
        'api.notifications.markAllNotificationAsRead.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    logServer(
      `NOTIFICATIONS - METHODS - UPDATE - markAllTypeNotificationAsRead - user id: ${this.userId} / type: ${type}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Notifications.update(
      { userId: this.userId, type: { $in: type } },
      { $set: { read: true } },
      { multi: true },
    );
  },
});

export const removeAllTypeNotification = new ValidatedMethod({
  name: 'notifications.removeAllTypeNotification',
  validate: new SimpleSchema({
    type: Array,
    'type.$': String,
  }).validator(),

  run({ type }) {
    if (!isActive(this.userId)) {
      logServer(
        `NOTIFICATIONS - METHODS - METEOR ERROR - removeAllTypeNotification - ${i18n.__(
          'api.notifications.mustBeLoggedIn',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
        { type },
      );
      throw new Meteor.Error(
        'api.notifications.removeAllTypeNotification.notLoggedIn',
        i18n.__('api.notifications.mustBeLoggedIn'),
      );
    }
    logServer(
      `NOTIFICATIONS - METHODS - REMOVE - removeAllTypeNotification - user id: ${this.userId} / type: ${type}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Notifications.remove({ userId: this.userId, type: { $in: type } });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    createNotification,
    removeAllNotificationRead,
    removeNotification,
    markNotificationAsRead,
    markAllNotificationAsRead,
    markAllTypeNotificationAsRead,
    removeAllNotification,
    removeAllTypeNotification,
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
