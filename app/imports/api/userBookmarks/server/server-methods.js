import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import getFavicon from '../../getFavicon';
import UserBookmarks from '../userBookmarks';
import logServer, { levels, scopes } from '../../logging';
import { isActive, getLabel, validateString, formatURL } from '../../utils';
import { addUserBookmark } from '../../personalspaces/methods';

const getWebSiteFaviconsForUserBookmark = new ValidatedMethod({
  name: 'userBookmark.getFavicon',
  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.url },
  }).validator(),
  async run({ url }) {
    try {
      const icon = await getFavicon(url);
      if (icon === undefined) {
        logServer(`USERBOOKMARKS - METHOD - UPDATE - updateStructureIconOrCoverImage`, levels.INFO, scopes.SYSTEM, {
          url,
        });
        UserBookmarks.update({ url }, { $set: { icon: '' } });
      } else {
        logServer(
          `USERBOOKMARKS - METHOD - UPDATE - updateStructureIconOrCoverImage - icon: ${icon}`,
          levels.INFO,
          scopes.SYSTEM,
          { url },
        );
        UserBookmarks.update({ url }, { $set: { icon } });
      }
    } catch (err) {
      //
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([getWebSiteFaviconsForUserBookmark], 'name');

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

export default getWebSiteFaviconsForUserBookmark;

export const createUserBookmarks = new ValidatedMethod({
  name: 'userBookmark.import',
  validate: new SimpleSchema({
    bookmarks: { type: Array, minCount: 1 },
    'bookmarks.$': {
      type: new SimpleSchema({
        url: { type: String, label: getLabel('api.bookmarks.labels.url') },
        name: { type: String, label: getLabel('api.bookmarks.labels.name'), optional: true },
        tag: { type: String, label: getLabel('api.bookmarks.labels.tag'), defaultValue: '' },
        addToPersonalSpace: { type: Boolean, label: getLabel('api.bookmarks.addToPersonalSpace') },
      }),
    },
  }).validator({ clean: true }),
  async run({ bookmarks }) {
    const isAllowed = isActive(this.userId);

    if (!isAllowed) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - createUserBookmarks - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
      );
      throw new Meteor.Error('api.userBookmarks.createUserBookmarks.notPermitted', i18n.__('api.users.notPermitted'));
    }

    // Extract URLs and filter out existing ones
    const urls = bookmarks.map((bookmark) => bookmark.url);
    const existingUrls = UserBookmarks.find({ url: { $in: urls }, userId: this.userId })
      .fetch()
      .map((bk) => bk.url);
    const { filteredBookmarks, droppedUrls } = bookmarks.reduce(
      (acc, bookmark) => {
        if (!existingUrls.includes(bookmark.url) && bookmark.name && bookmark.url.length <= 256) {
          acc.filteredBookmarks.push(bookmark);
        } else {
          acc.droppedUrls.push({ name: bookmark.name, url: bookmark.url });
        }

        return acc;
      },
      { filteredBookmarks: [], droppedUrls: [] },
    );

    const finalUrls = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const { url, name, tag, addToPersonalSpace } of filteredBookmarks) {
      try {
        validateString(url);
        validateString(name);
        validateString(tag);

        const finalUrl = formatURL(url);

        logServer(
          `USERBOOKMARKS - METHODS - INSERT - createUserBookmark - user id: ${this.userId} / url: ${finalUrl}
          / name: ${name} / tag: ${tag}`,
          levels.VERBOSE,
          scopes.SYSTEM,
        );

        const bookmarkId = UserBookmarks.insert({ url: finalUrl, name, tag, userId: this.userId });

        if (addToPersonalSpace) {
          Meteor.users.update(this.userId, {
            $push: { favUserBookmarks: bookmarkId },
          });
          addUserBookmark._execute({ userId: this.userId }, { bookmarkId, type: 'link' });
        }

        finalUrls.push(finalUrl);
      } catch (error) {
        // Log error and continue with the next bookmark
        logServer(
          `USERBOOKMARKS - METHODS - METEOR ERROR - createUserBookmark - ${error.message}`,
          levels.WARN,
          scopes.SYSTEM,
        );

        droppedUrls.push({ url, name });

        // eslint-disable-next-line no-continue
        continue;
      }
    }

    return { droppedUrls, finalUrlsCount: finalUrls.length };
  },
});

export const getUserBookmarks = new ValidatedMethod({
  name: 'userBookmark.export',
  validate: null, // No arguments
  run() {
    const isAllowed = isActive(this.userId);

    if (!isAllowed) {
      logServer(
        `USERBOOKMARKS - METHODS - METEOR ERROR - createUserBookmarks - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
      );
      throw new Meteor.Error('api.userBookmarks.createUserBookmarks.notPermitted', i18n.__('api.users.notPermitted'));
    }

    return UserBookmarks.find(
      { userId: this.userId },
      {
        fields: {
          name: 1,
          tag: 1,
          url: 1,
        },
      },
    ).fetch();
  },
});
