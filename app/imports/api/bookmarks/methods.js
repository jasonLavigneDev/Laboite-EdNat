import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel, validateString } from '../utils';
import Bookmarks from './bookmarks';
import logServer, { levels, scopes } from '../logging';
import { addUserBookmark, removeElement } from '../personalspaces/methods';

function _updateBookmarkURL(id, url, name, tag) {
  logServer(`BOOKMARKS - METHOD - UPDATE - _updateBookmarkURL`, levels.VERBOSE, scopes.SYSTEM, { id, url, name, tag });
  Bookmarks.update({ _id: id }, { $set: { url, name, tag } });
}

function _formatURL(name) {
  let finalName = name;

  if (!name.includes('://')) {
    finalName = `https://${name}`;
  }
  return finalName;
}

function _createBookmarkUrl(url, name, tag, groupId, author) {
  try {
    logServer(`BOOKMARKS - METHOD - INSERT - _createBookmarkUrl`, levels.VERBOSE, scopes.SYSTEM, {
      url,
      name,
      tag,
      groupId,
      author,
    });
    Bookmarks.insert({ url, name, tag, groupId, author });
  } catch (error) {
    if (error.code === 11000) {
      logServer(
        `BOOKMARKS - METHOD - METEOR ERROR - _createBookmarkUrl - ${i18n.__(
          'api.bookmarks.createBookmark.URLAlreadyExists',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
        { url, name, tag, groupId, author },
      );
      throw new Meteor.Error(
        'api.bookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.bookmarks.createBookmark.URLAlreadyExists'),
      );
    } else {
      logServer(`BOOKMARKS - METHOD - ERROR - _createBookmarkUrl`, levels.ERROR, scopes.SYSTEM, { error });
      throw error;
    }
  }
}

export const createBookmark = new ValidatedMethod({
  name: 'bookmark.create',
  validate: Bookmarks.schema.omit('author', 'icon').validator({ clean: true }),

  run({ url, name, groupId, tag }) {
    const isAllowed =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, ['member', 'animator', 'admin'], groupId) ||
        Roles.userIsInRole(this.userId, 'admin'));
    if (!isAllowed) {
      logServer(
        `BOOKMARKS - METHOD - METEOR ERROR - createBookmark - ${i18n.__('api.bookmarks.groupRankNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { url, name, groupId, tag },
      );
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.groupRankNeeded'));
    }

    const finalUrl = _formatURL(url);

    const bk = Bookmarks.findOne({ url: finalUrl, groupId });
    if (bk !== undefined) {
      logServer(
        `BOOKMARKS - METHOD - METEOR ERROR - createBookmark - ${i18n.__(
          'api.bookmarks.createBookmark.URLAlreadyExists',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
        { url, name, groupId, tag },
      );
      throw new Meteor.Error(
        'api.bookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.bookmarks.createBookmark.URLAlreadyExists'),
      );
    }
    validateString(finalUrl);
    validateString(name);
    validateString(tag);
    _createBookmarkUrl(finalUrl, name, tag, groupId, this.userId);
    return finalUrl;
  },
});

export const updateBookmark = new ValidatedMethod({
  name: 'bookmark.updateURL',
  validate: new SimpleSchema({
    id: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    name: { type: String, label: getLabel('api.bookmarks.labels.name') },
    tag: { type: String, label: getLabel('api.bookmarks.labels.tag'), defaultValue: '' },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator({ clean: true }),

  run({ id, url, name, groupId, tag }) {
    const bk = Bookmarks.findOne({ _id: id });
    if (bk === undefined) {
      logServer(
        `BOOKMARKS - METHOD - METEOR ERROR - updateBookmark - ${i18n.__('api.bookmarks.UnknownURL')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { id, url, name, groupId, tag },
      );
      throw new Meteor.Error('api.bookmarks.UnknownURL', i18n.__('api.bookmarks.UnknownURL'));
    }

    const isAllowed =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin', groupId) ||
        Roles.userIsInRole(this.userId, 'admin') ||
        bk.author === this.userId);
    if (!isAllowed) {
      logServer(
        `BOOKMARKS - METHOD - METEOR ERROR - updateBookmark - ${i18n.__('api.bookmarks.adminRankNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { id, url, name, groupId, tag },
      );
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.adminRankNeeded'));
    }

    const finalUrl = _formatURL(url);

    validateString(finalUrl);
    validateString(name);
    validateString(tag);
    _updateBookmarkURL(id, finalUrl, name, tag);
    return finalUrl;
  },
});

export const removeBookmark = new ValidatedMethod({
  name: 'bookmark.removeURL',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url, label: getLabel('api.bookmarks.labels.url') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ url, groupId }) {
    // check group existence
    const bk = Bookmarks.findOne({ url });
    if (bk === undefined) {
      logServer(
        `BOOKMARKS - METHOD - METEOR ERROR - removeBookmark - ${i18n.__('api.bookmarks.UnknownURL')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { url, groupId },
      );
      throw new Meteor.Error('api.bookmarks.UnknownURL', i18n.__('api.bookmarks.UnknownURL'));
    }

    const isAllowed =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin', groupId) ||
        Roles.userIsInRole(this.userId, 'admin') ||
        bk.author === this.userId);

    if (!isAllowed) {
      logServer(
        `BOOKMARKS - METHOD - METEOR ERROR - removeBookmark - ${i18n.__('api.bookmarks.adminRankNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { url, groupId },
      );
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.adminRankNeeded'));
    }
    logServer(`BOOKMARKS - METHOD - REMOVE - removeBookmark - url: ${url}`, levels.VERBOSE, scopes.SYSTEM, {
      groupId,
    });
    Bookmarks.remove({ url });

    return null;
  },
});

export const favGroupBookmark = new ValidatedMethod({
  name: 'bookmarks.favGroupBookmark',
  validate: new SimpleSchema({
    bookmarkId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
  }).validator(),

  run({ bookmarkId }) {
    if (!this.userId) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - favUserBookmark - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.VERBOSE,
        scopes.SYSTEM,
      );
      throw new Meteor.Error('api.userBookmarks.favUserBookmark.mustBeLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check bookmark existence
    const bookmark = Bookmarks.findOne({ _id: bookmarkId });
    if (bookmark === undefined) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - favUserBookmark - ${i18n.__('api.bookmarks.unknownBookmark')}`,
        levels.VERBOSE,
        scopes.SYSTEM,
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
    addUserBookmark._execute({ userId: this.userId }, { bookmarkId, type: 'groupLink' });
  },
});

export const unfavGroupBookmark = new ValidatedMethod({
  name: 'bookmarks.unfavGroupBookmark',
  validate: new SimpleSchema({
    bookmarkId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.bookmarks.labels.id') },
  }).validator(),

  run({ bookmarkId }) {
    if (!this.userId) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - unfavUserBookmark - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.VERBOSE,
        scopes.SYSTEM,
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
      `USERBOOKMARKS - METHODS - METEOR ERROR - unfavUserBookmark - user id: ${this.userId} 
      / bookmarkId: ${bookmarkId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    // update user personalSpace
    removeElement._execute({ userId: this.userId }, { type: 'link', elementId: bookmarkId });
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck([createBookmark, updateBookmark, removeBookmark], 'name');
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
