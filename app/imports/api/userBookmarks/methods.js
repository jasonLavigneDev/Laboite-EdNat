import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel, validateString } from '../utils';
import UserBookmarks from './userBookmarks';
import { addUserBookmark, removeElement } from '../personalspaces/methods';
import logServer, { levels, scopes } from '../logging';

function _formatURL(name) {
  let finalName = name;

  if (!name.includes('://')) {
    finalName = `https://${name}`;
  }
  return finalName;
}

export const createUserBookmark = new ValidatedMethod({
  name: 'userBookmark.create',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    name: { type: String, label: getLabel('api.bookmarks.labels.name') },
    tag: { type: String, label: getLabel('api.bookmarks.labels.tag'), defaultValue: '' },
    favUserBookmarkDirectry: {
      type: Boolean,
      label: getLabel('api.users.labels.favUserBookmarks'),
      defaultValue: false,
    },
  }).validator({ clean: true }),
  run({ url, name, tag, favUserBookmarkDirectry = false }) {
    const isAllowed = isActive(this.userId);

    if (!isAllowed) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - createUserBookmark - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { url, name, tag },
      );
      throw new Meteor.Error('api.userBookmarks.createUserBookmark.notPermitted', i18n.__('api.users.notPermitted'));
    }
    validateString(url);
    validateString(name);
    validateString(tag);

    const finalUrl = _formatURL(url);

    // check that this URL does not already exist in this user bookmarks
    const bk = UserBookmarks.findOne({ url: finalUrl, userId: this.userId });
    if (bk !== undefined) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - createUserBookmark - ${i18n.__(
          'api.bookmarks.createBookmark.URLAlreadyExists',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
        { url, name, tag },
      );
      throw new Meteor.Error(
        'api.userBookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.bookmarks.createBookmark.URLAlreadyExists'),
      );
    }

    logServer(
      `USERBOOKMARKS - METHODS - INSERT - createUserBookmark - user id: ${this.userId} / url: ${finalUrl}
      / name: ${name} / tag: ${tag}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );

    const bookmarkId = UserBookmarks.insert({ url: finalUrl, name, tag, userId: this.userId });

    if (favUserBookmarkDirectry) {
      if (bookmarkId && bookmarkId !== undefined) {
        Meteor.users.update(this.userId, {
          $push: { favUserBookmarks: bookmarkId },
        });

        // update user personalSpace
        addUserBookmark._execute({ userId: this.userId }, { bookmarkId, type: 'link' });
      }
    }
    return finalUrl;
  },
});

export const updateUserBookmark = new ValidatedMethod({
  name: 'userBookmark.updateURL',
  validate: new SimpleSchema({
    id: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    name: { type: String, label: getLabel('api.bookmarks.labels.name') },
    tag: { type: String, label: getLabel('api.bookmarks.labels.tag'), defaultValue: '' },
  }).validator({ clean: true }),

  run({ id, url, name, tag }) {
    const bk = UserBookmarks.findOne({ _id: id });
    if (bk === undefined) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - updateUserBookmark - ${i18n.__('api.bookmarks.unknownBookmark')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { id, url, name, tag },
      );
      throw new Meteor.Error(
        'api.UserBookmarks.updateUserBookmark.unknownBookmark',
        i18n.__('api.bookmarks.unknownBookmark'),
      );
    }

    const isAllowed = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || bk.userId === this.userId);
    if (!isAllowed) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - updateUserBookmark - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { id, url, name, tag },
      );
      throw new Meteor.Error('api.userBookmarks.updateUserBookmark.notPermitted', i18n.__('api.users.notPermitted'));
    }

    const finalUrl = _formatURL(url);
    validateString(url);
    validateString(name);
    validateString(tag);
    logServer(
      `USERBOOKMARKS - METHODS - UPDATE - updateUserBookmark - id: ${id} / url: ${finalUrl}
      / name: ${name} / tag: ${tag}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    UserBookmarks.update({ _id: id }, { $set: { url: finalUrl, name, tag } });
    return finalUrl;
  },
});

export const favUserBookmark = new ValidatedMethod({
  name: 'userBookmarks.favUserBookmark',
  validate: new SimpleSchema({
    bookmarkId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
  }).validator(),

  run({ bookmarkId }) {
    if (!this.userId) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - favUserBookmark - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
        { bookmarkId },
      );
      throw new Meteor.Error('api.userBookmarks.favUserBookmark.mustBeLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check bookmark existence
    const bookmark = UserBookmarks.findOne({ _id: bookmarkId, userId: this.userId });
    if (!bookmark) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - favUserBookmark - ${i18n.__('api.bookmarks.unknownBookmark')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { bookmarkId },
      );
      throw new Meteor.Error(
        'api.userBookmarks.favUserBookmark.unknownBookmark',
        i18n.__('api.bookmarks.unknownBookmark'),
      );
    }
    Meteor.users.update(this.userId, {
      $push: { favUserBookmarks: bookmarkId },
    });
    logServer(
      `USERBOOKMARKS - METHODS - EXECUTE - favUserBookmark - user id: ${this.userId} / bookmarkId: ${bookmarkId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    // update user personalSpace
    addUserBookmark._execute({ userId: this.userId }, { bookmarkId, type: 'link' });
  },
});

export const unfavUserBookmark = new ValidatedMethod({
  name: 'userBookmarks.unfavUserBookmark',
  validate: new SimpleSchema({
    bookmarkId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
  }).validator(),

  run({ bookmarkId }) {
    if (!this.userId) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - unfavUserBookmark - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
        { bookmarkId },
      );
      throw new Meteor.Error('api.userBookmarks.unfavUserBookmark.mustBeLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // remove bookmark from user favorite bookmarks
    if (user.favUserBookmarks.indexOf(bookmarkId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { favUserBookmarks: bookmarkId },
      });
    }
    logServer(
      `USERBOOKMARKS - METHODS - REMOVE - unfavUserBookmark - user id: ${this.userId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
      { bookmarkId },
    );
    // update user personalSpace
    removeElement._execute({ userId: this.userId }, { type: 'link', elementId: bookmarkId });
  },
});

export const removeUserBookmark = new ValidatedMethod({
  name: 'userBookmark.removeURL',
  validate: new SimpleSchema({
    id: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
  }).validator(),

  run({ id }) {
    // check bookmark existence
    const bk = UserBookmarks.findOne(id);
    if (bk === undefined) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - removeUserBookmark - ${i18n.__('api.bookmarks.UnknownBookmark')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { id },
      );
      throw new Meteor.Error(
        'api.userBookmarks.removeUserBookmark.UnknownBookmark',
        i18n.__('api.bookmarks.UnknownBookmark'),
      );
    }

    const isAllowed = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || bk.userId === this.userId);

    if (!isAllowed) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - removeUserBookmark - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { id },
      );
      throw new Meteor.Error('api.userBookmarks.removeUserBookmark.notPermitted', i18n.__('api.users.notPermitted'));
    }
    logServer(`USERBOOKMARKS - METHODS - UPDATE - removeUserBookmark`, levels.VERBOSE, scopes.SYSTEM, { id });
    // remove bookmark from users favorites
    Meteor.users.update({ favUserBookmarks: { $all: [id] } }, { $pull: { favUserBookmarks: id } }, { multi: true });

    unfavUserBookmark._execute({ userId: this.userId }, { bookmarkId: id });

    logServer(`USERBOOKMARKS - METHODS - REMOVE - removeUserBookmark`, levels.INFO, scopes.SYSTEM, { id });
    UserBookmarks.remove(id);

    return null;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck(
    [createUserBookmark, updateUserBookmark, removeUserBookmark, favUserBookmark, unfavUserBookmark],
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
