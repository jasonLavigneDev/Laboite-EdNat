import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';
import sanitizeHtml from 'sanitize-html';
import logServer, { levels, scopes } from '../logging';

import { isActive, getLabel, validateString, sanitizeParameters } from '../utils';
import Articles from './articles';

const validateData = (data) => {
  // check for unauthorized content in article data
  validateString(data.title);
  validateString(data.description);
  validateString(data.licence);
  if (data.markdown) validateString(data.content);
  data.tags.forEach((tag) => validateString(tag));
  data.groups.forEach((group) => validateString(group.name));
};

export const createArticle = new ValidatedMethod({
  name: 'articles.createArticle',
  validate: new SimpleSchema({
    data: Articles.schema.omit('createdAt', 'updatedAt', 'userId', 'slug', 'structure'),
  }).validator({ clean: true }),

  run({ data }) {
    if (!isActive(this.userId)) {
      logServer(
        `ARTICLES - METHODS - METEOR ERROR - createArticle - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
        { data },
      );
      throw new Meteor.Error('api.articles.createArticle.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    validateData(data);
    const sanitizedContent = data.markdown ? data.content : sanitizeHtml(data.content, sanitizeParameters);
    validateString(sanitizedContent);
    logServer(
      `ARTICLES - METHODS - METEOR UPDATE - createArticle - id: ${this.userId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
      { data },
    );
    Meteor.users.update({ _id: this.userId }, { $inc: { articlesCount: 1 }, $set: { lastArticle: new Date() } });
    const structure = Meteor.users.findOne(this.userId, { fields: { structure: 1 } }).structure || '';
    logServer(
      `ARTICLES - METHODS - INSERT - createArticle - data: ${JSON.stringify(data)} / content: ${sanitizedContent} 
      / userId: ${this.userId} / structure: ${structure}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );

    return Articles.insert({ ...data, content: sanitizedContent, userId: this.userId, structure });
  },
});

export const removeArticle = new ValidatedMethod({
  name: 'articles.removeArticle',
  validate: new SimpleSchema({
    articleId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.articles.labels.id') },
  }).validator(),

  run({ articleId }) {
    if (!isActive(this.userId)) {
      logServer(
        `ARTICLES - METHODS - METEOR ERROR - removeArticle - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
        { articleId },
      );
      throw new Meteor.Error('api.articles.removeArticle.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    const article = Articles.findOne({ _id: articleId });
    const authorized = this.userId === article.userId;
    if (!authorized) {
      logServer(
        `ARTICLES - METHODS - METEOR ERROR - removeArticle - ${i18n.__('api.articles.adminArticleNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { articleId },
      );
      throw new Meteor.Error('api.articles.removeArticle.notPermitted', i18n.__('api.articles.adminArticleNeeded'));
    }
    logServer(
      `ARTICLES - METHODS - UPDATE - removeArticle - Article remove for userID: ${this.userId}`,
      levels.INFO,
      scopes.SYSTEM,
      { articleId },
    );
    Meteor.users.update({ _id: this.userId }, { $inc: { articlesCount: -1 } });

    logServer(`ARTICLES - METHODS - REMOVE - removeArticle - Article remove: ${articleId}`, levels.INFO, scopes.SYSTEM);
    return Articles.remove(articleId);
  },
});

export const updateArticle = new ValidatedMethod({
  name: 'articles.updateArticle',
  validate: new SimpleSchema({
    articleId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.articles.labels.id') },
    data: Articles.schema.omit('createdAt', 'updatedAt', 'userId', 'slug', 'structure'),
    updateStructure: { type: Boolean, defaultValue: false },
  }).validator({ clean: true }),

  run({ data, articleId, updateStructure }) {
    // check article existence
    const article = Articles.findOne({ _id: articleId });
    if (article === undefined) {
      logServer(
        `ARTICLES - METHODS - METEOR ERROR - updateArticle - ${i18n.__('api.articles.unknownArticle')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { data, articleId, updateStructure },
      );
      throw new Meteor.Error('api.articles.updateArticle.unknownArticle', i18n.__('api.articles.unknownArticle'));
    }
    // check if current user has admin rights on article
    const authorized = isActive(this.userId) || this.userId === article.userId;
    if (!authorized) {
      logServer(
        `ARTICLES - METHODS - METEOR ERROR - updateArticle - ${i18n.__('api.articles.adminArticleNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { data, articleId, updateStructure },
      );
      throw new Meteor.Error('api.articles.updateArticle.notPermitted', i18n.__('api.articles.adminArticleNeeded'));
    }
    validateData(data);
    const sanitizedContent = data.markdown ? data.content : sanitizeHtml(data.content, sanitizeParameters);
    validateString(sanitizedContent);
    const userStructure = Meteor.users.findOne(this.userId, { fields: { structure: 1 } }).structure || '';
    logServer(
      `ARTICLES - METHODS - METEOR USER UPDATE - updateArticle - user id: ${this.userId}`,
      levels.VERBOSE,
      scopes.SYSTEM,
      { data, articleId, updateStructure },
    );
    Meteor.users.update({ _id: this.userId }, { $set: { lastArticle: new Date() } });
    const updateData = { ...data, content: sanitizedContent, userId: this.userId };
    if (updateStructure) updateData.structure = userStructure;
    logServer(
      `ARTICLES - METHODS - UPDATE - updateArticle - Article update: ${articleId} / data update: ${JSON.stringify(
        updateData,
      )}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Articles.update({ _id: articleId }, { $set: updateData });
  },
});

export const visitArticle = new ValidatedMethod({
  name: 'articles.visitArticle',
  validate: new SimpleSchema({
    articleId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.articles.labels.id') },
  }).validator(),

  run({ articleId }) {
    // check article existence
    const article = Articles.findOne({ _id: articleId });
    if (article === undefined) {
      logServer(
        `ARTICLES - METHODS - METEOR ERROR - visitArticle - ${i18n.__('api.articles.unknownArticle')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { articleId },
      );
      throw new Meteor.Error('api.articles.visitArticle.unknownArticle', i18n.__('api.articles.unknownArticle'));
    }
    logServer(
      `ARTICLES - METHODS - UPDATE - visitArticle - add visite on article: ${articleId}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    return Articles.update({ _id: articleId }, { $inc: { visits: 1 } });
  },
});

export const downloadBackupPublications = new ValidatedMethod({
  name: 'articles.downloadBackupPublications',
  validate: null,
  run() {
    const authorized = isActive(this.userId);
    if (!authorized) {
      logServer(
        `ARTICLES - METHODS - METEOR ERROR - downloadBackupPublications - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
      );
      throw new Meteor.Error(
        'api.articles.downloadBackupPublications.notLoggedIn',
        i18n.__('api.users.mustBeLoggedIn'),
      );
    }
    return Articles.find(
      { userId: this.userId },
      { fields: { userId: 0, visits: 0, _id: 0, createdAt: 0, updatedAt: 0, slug: 0 } },
    ).fetch();
  },
});

export const uploadBackupPublications = new ValidatedMethod({
  name: 'articles.uploadBackupPublications',
  validate: new SimpleSchema({
    articles: { type: Array },
    'articles.$': Articles.schema.omit('userId', 'visits', '_id', 'createdAt', 'updatedAt', 'slug'),
    // if updateStructure is true, all articles will be attached to user's current structure
    updateStructure: { type: Boolean, defaultValue: false },
  }).validator({ clean: true }),

  run({ articles, updateStructure }) {
    try {
      const authorized = isActive(this.userId);
      if (!authorized) {
        logServer(
          `ARTICLES - METHODS - METEOR ERROR - uploadBackupPublications - ${i18n.__('api.users.mustBeLoggedIn')}`,
          levels.WARN,
          scopes.SYSTEM,
          { articles, updateStructure },
        );
        throw new Meteor.Error(
          'api.articles.uploadBackupPublications.notLoggedIn',
          i18n.__('api.users.mustBeLoggedIn'),
        );
      }
      articles.forEach((data) => validateData(data));
      const userStructure = Meteor.users.findOne(this.userId, { fields: { structure: 1 } }).structure || '';
      return articles.map((article) => {
        const sanitizedContent = article.markdown ? article.content : sanitizeHtml(article.content, sanitizeParameters);
        validateString(sanitizedContent);
        logServer(
          `ARTICLES - METHODS - INSERT - uploadBackupPublications - article: ${JSON.stringify(
            article,
          )} / content: ${sanitizedContent} 
          / user: ${this.userId} / update structure: ${updateStructure}`,
          levels.VERBOSE,
          scopes.SYSTEM,
        );
        const ret = Articles.insert({
          ...article,
          content: sanitizedContent,
          userId: this.userId,
          structure: updateStructure ? userStructure : article.structure,
        });
        // increment user articles count
        Meteor.users.update({ _id: this.userId }, { $inc: { articlesCount: 1 }, $set: { lastArticle: new Date() } });
        return ret;
      });
    } catch (error) {
      logServer(`ARTICLES - METHODS - METEOR ERROR - uploadBackupPublications`, levels.ERROR, scopes.SYSTEM, { error });
      throw new Meteor.Error(error, error);
    }
  },
});

export const checkSelectedInPublications = new ValidatedMethod({
  name: 'articles.checkSelectedInPublications',
  validate: new SimpleSchema({
    path: { type: String },
  }).validator({ clean: true }),

  run({ path }) {
    const regex = { $regex: new RegExp(path, 'i') };
    return Articles.findOne({ userId: this.userId, content: regex });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    createArticle,
    removeArticle,
    updateArticle,
    visitArticle,
    uploadBackupPublications,
    downloadBackupPublications,
    checkSelectedInPublications,
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
