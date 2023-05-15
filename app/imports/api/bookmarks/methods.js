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

function _updateBookmarkURL(id, url, name, tag) {
  logServer(
    `BOOKMARKS - METHOD - UPDATE - _updateBookmarkURL - id: ${id} / data: ${(url, name, tag)}`,
    levels.VERBOSE,
    scopes.SYSTEM,
  );
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
    logServer(
      `BOOKMARKS - METHOD - INSERT - _createBookmarkUrl - data: ${(url, name, tag, groupId, author)}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    Bookmarks.insert({ url, name, tag, groupId, author });
  } catch (error) {
    if (error.code === 11000) {
      logServer(
        `BOOKMARKS - METHOD - METEOR ERROR - _createBookmarkUrl - ${i18n.__(
          'api.bookmarks.createBookmark.URLAlreadyExists',
        )}`,
        levels.VERBOSE,
        scopes.SYSTEM,
      );
      throw new Meteor.Error(
        'api.bookmarks.createBookmark.URLAlreadyExists',
        i18n.__('api.bookmarks.createBookmark.URLAlreadyExists'),
      );
    } else {
      logServer(`BOOKMARKS - METHOD - ERROR - _createBookmarkUrl`, levels.INFO, scopes.SYSTEM, { error });
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
        levels.VERBOSE,
        scopes.SYSTEM,
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
        levels.VERBOSE,
        scopes.SYSTEM,
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
        levels.VERBOSE,
        scopes.SYSTEM,
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
        levels.VERBOSE,
        scopes.SYSTEM,
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
        levels.VERBOSE,
        scopes.SYSTEM,
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
        levels.VERBOSE,
        scopes.SYSTEM,
      );
      throw new Meteor.Error('api.bookmarks.notPermitted', i18n.__('api.bookmarks.adminRankNeeded'));
    }
    logServer(`BOOKMARKS - METHOD - REMOVE - removeBookmark - url: ${url}`, levels.VERBOSE, scopes.SYSTEM);
    Bookmarks.remove({ url });

    return null;
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
