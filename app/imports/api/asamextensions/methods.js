import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import SimpleSchema from 'simpl-schema';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import AsamExtensions from './asamextensions';

export const assignStructureToAsam = new ValidatedMethod({
  name: 'asam.assignStructureToAsam',
  validate: new SimpleSchema({
    structureId: {
      type: SimpleSchema.RegEx.Id,
    },
    extensionId: {
      type: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ extensionId, structureId = null }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    if (!isAdmin) {
      throw new Meteor.Error('api.asam.assignStructureToAsam.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    return AsamExtensions.update({ _id: extensionId }, { $set: { structureId } });
  },
});

export const unassignStructureToAsam = new ValidatedMethod({
  name: 'asam.unassignStructureToAsam',
  validate: new SimpleSchema({ extensionId: { type: SimpleSchema.RegEx.Id } }).validator(),
  run({ extensionId }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    if (!isAdmin) {
      throw new Meteor.Error('api.asam.assignStructureToAsam.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    return AsamExtensions.update({ _id: extensionId }, { $set: { structureId: null } });
  },
});

const LISTS_METHODS = _.pluck([assignStructureToAsam, unassignStructureToAsam], 'name');

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
