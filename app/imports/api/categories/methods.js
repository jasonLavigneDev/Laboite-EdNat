import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel, validateString } from '../utils';
import Categories from './categories';
import Services from '../services/services';
import logServer, { levels, scopes } from '../logging';

export const createCategorie = new ValidatedMethod({
  name: 'categories.createCategorie',
  validate: new SimpleSchema({
    name: { type: String, min: 1, label: getLabel('api.categories.labels.name') },
  }).validator(),

  run({ name }) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');

    const cat = Categories.findOne({ name });
    if (cat !== undefined) {
      logServer(
        `CATEGORIES - METHOD - METEOR ERROR - createCategorie - ${i18n.__(
          'api.categories.createCategorie.nameAlreadyUse',
        )}`,
        levels.WARN,
        scopes.SYSTEM,
        { name },
      );
      throw new Meteor.Error(
        'api.categories.createCategorie.alreadyExists',
        i18n.__('api.categories.createCategorie.nameAlreadyUse'),
      );
    }
    if (!authorized) {
      logServer(
        `CATEGORIES - METHOD - METEOR ERROR - createCategorie - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { name },
      );
      throw new Meteor.Error('api.categories.createCategorie.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    validateString(name);
    logServer(`CATEGORIES - METHOD - INSERT - createCategorie - category name: ${name}`, levels.VERBOSE, scopes.ADMIN);
    Categories.insert({
      name,
    });
  },
});

export const removeCategorie = new ValidatedMethod({
  name: 'categories.removeCategorie',
  validate: new SimpleSchema({
    categoryId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.categories.labels.id') },
  }).validator(),

  run({ categoryId }) {
    // check categorie existence
    const categorie = Categories.findOne(categoryId);
    if (categorie === undefined) {
      logServer(
        `CATEGORIES - METHOD - METEOR ERROR - removeCategorie - ${i18n.__('api.categories.unknownCategorie')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { categoryId },
      );
      throw new Meteor.Error(
        'api.categories.removeCategorie.unknownCategorie',
        i18n.__('api.categories.unknownCategorie'),
      );
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      logServer(
        `CATEGORIES - METHOD - METEOR ERROR - removeCategorie - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { categoryId },
      );
      throw new Meteor.Error('api.categories.removeCategorie.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // remove categorie from services
    Services.update({}, { $pull: { categories: categoryId } }, { multi: true });
    logServer(
      `CATEGORIES - METHOD - REMOVE - removeCategorie - category ID: ${categoryId}`,
      levels.VERBOSE,
      scopes.ADMIN,
    );
    Categories.remove(categoryId);
  },
});

export const updateCategorie = new ValidatedMethod({
  name: 'categories.updateCategorie',
  validate: new SimpleSchema({
    categoryId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.categories.labels.id') },
    data: Object,
    'data.name': { type: String, min: 1, label: getLabel('api.categories.labels.name') },
  }).validator(),

  run({ categoryId, data }) {
    // check categorie existence
    const categorie = Categories.findOne({ _id: categoryId });
    if (categorie === undefined) {
      logServer(
        `CATEGORIES - METHOD - METEOR ERROR - updateCategorie - ${i18n.__('api.categories.unknownCategorie')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { categoryId, data },
      );
      throw new Meteor.Error(
        'api.categories.updateCategorie.unknownCategory',
        i18n.__('api.categories.unknownCategorie'),
      );
    }
    // check if current user has admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      logServer(
        `CATEGORIES - METHOD - METEOR ERROR - updateCategorie - ${i18n.__('api.users.adminNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { categoryId, data },
      );
      throw new Meteor.Error('api.categories.updateCategorie.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    validateString(data.name);
    logServer(
      `CATEGORIES - METHOD - UPDATE - updateCategorie - category ID: ${categoryId} / data: ${data}`,
      levels.VERBOSE,
      scopes.ADMIN,
    );
    Categories.update({ _id: categoryId }, { $set: data });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([createCategorie, removeCategorie, updateCategorie], 'name');

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
