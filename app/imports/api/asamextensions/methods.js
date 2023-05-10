import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import SimpleSchema from 'simpl-schema';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import AsamExtensions from './asamextensions';
import { validateString } from '../utils';

import logServer, { levels, scopes } from '../logging';

const validateAsam = (extension, entiteNomCourt, entiteNomLong, familleNomCourt, familleNomLong) => {
  if (extension) validateString(extension, true);
  if (entiteNomCourt) validateString(entiteNomCourt, true);
  if (entiteNomLong) validateString(entiteNomLong, true);
  if (familleNomCourt) validateString(familleNomCourt, true);
  if (familleNomLong) validateString(familleNomLong, true);
};

export const assignStructureToAsam = new ValidatedMethod({
  name: 'asam.assignStructureToAsam',
  validate: new SimpleSchema({
    structureId: {
      type: SimpleSchema.RegEx.Id,
    },
    extensionId: {
      type: SimpleSchema.RegEx.Id,
    },
    extension: {
      type: String,
      optional: true,
    },
    entiteNomCourt: {
      type: String,
      optional: true,
    },
    entiteNomLong: {
      type: String,
      optional: true,
    },
    familleNomCourt: {
      type: String,
      optional: true,
    },
    familleNomLong: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ extensionId, extension, entiteNomCourt, entiteNomLong, familleNomCourt, familleNomLong, structureId = null }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    if (!isAdmin) {
      logServer(
        `ASAM - METHOD - METEOR ERROR - assignStructureToAsam - ${i18n.__('api.users.adminNeeded')}`,
        levels.VERBOSE,
        scopes.ADMIN,
      );
      throw new Meteor.Error('api.asam.assignStructureToAsam.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    validateAsam(extension, entiteNomCourt, entiteNomLong, familleNomCourt, familleNomLong);
    logServer(
      `ASAM - METHOD - UPDATE - assignStructureToAsam - extensionID: ${extensionId} / data: ${
        (structureId, extension, entiteNomCourt, entiteNomLong, familleNomCourt, familleNomLong)
      }`,
      levels.VERBOSE,
      scopes.ADMIN,
    );
    return AsamExtensions.update(
      { _id: extensionId },
      { $set: { structureId, extension, entiteNomCourt, entiteNomLong, familleNomCourt, familleNomLong } },
    );
  },
});

export const unassignStructureToAsam = new ValidatedMethod({
  name: 'asam.unassignStructureToAsam',
  validate: new SimpleSchema({ extensionId: { type: SimpleSchema.RegEx.Id } }).validator(),
  run({ extensionId }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    if (!isAdmin) {
      logServer(
        `ASAM - METHOD - METEOR ERROR - unassignStructureToAsam - ${i18n.__('api.users.adminNeeded')}`,
        levels.VERBOSE,
        scopes.ADMIN,
      );
      throw new Meteor.Error('api.asam.assignStructureToAsam.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    logServer(
      `ASAM - METHOD - UPDATE - unassignStructureToAsam - extensionID: ${extensionId}`,
      levels.VERBOSE,
      scopes.ADMIN,
    );
    return AsamExtensions.update({ _id: extensionId }, { $set: { structureId: null } });
  },
});

export const deleteAsam = new ValidatedMethod({
  name: 'asam.deleteAsam',
  validate: new SimpleSchema({ extensionId: { type: SimpleSchema.RegEx.Id } }).validator(),
  run({ extensionId }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    if (!isAdmin) {
      logServer(
        `ASAM - METHOD - METEOR ERROR - deleteAsam - ${i18n.__('api.users.adminNeeded')}`,
        levels.VERBOSE,
        scopes.ADMIN,
      );
      throw new Meteor.Error('api.asam.assignStructureToAsam.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    logServer(`ASAM - METHOD - REMOVE - deleteAsam - extensionID: ${extensionId}`, levels.VERBOSE, scopes.ADMIN);
    return AsamExtensions.remove({ _id: extensionId });
  },
});

export const addNewAsam = new ValidatedMethod({
  name: 'asam.addNewAsam',
  validate: new SimpleSchema({
    extension: {
      type: String,
      optional: true,
    },
    entiteNomCourt: {
      type: String,
      optional: true,
    },
    entiteNomLong: {
      type: String,
      optional: true,
    },
    familleNomCourt: {
      type: String,
      optional: true,
    },
    familleNomLong: {
      type: String,
      optional: true,
    },
    structureId: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ extension, entiteNomCourt, entiteNomLong, familleNomCourt, familleNomLong, structureId }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    if (!isAdmin) {
      logServer(
        `ASAM - METHOD - METEOR ERROR - deleteAsam - ${i18n.__('api.users.adminNeeded')}}`,
        levels.VERBOSE,
        scopes.ADMIN,
      );
      throw new Meteor.Error('api.asamextensions.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    validateAsam(extension, entiteNomCourt, entiteNomLong, familleNomCourt, familleNomLong);
    logServer(
      `ASAM - METHOD - REMOVE - deleteAsam - data: ${
        (extension, entiteNomCourt, entiteNomLong, familleNomCourt, familleNomLong, structureId)
      }`,
      levels.VERBOSE,
      scopes.ADMIN,
    );
    return AsamExtensions.insert({
      extension,
      entiteNomCourt,
      entiteNomLong,
      familleNomCourt,
      familleNomLong,
      structureId,
    });
  },
});

const LISTS_METHODS = _.pluck([assignStructureToAsam, unassignStructureToAsam, addNewAsam], 'name');

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
