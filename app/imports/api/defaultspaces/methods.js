import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';

import DefaultSpaces from './defaultspaces';
import { checkPersonalSpaceData, generateDefaultPersonalSpace } from '../personalspaces/methods';
import { hasAdminRightOnStructure } from '../structures/utils';
import logServer, { levels, scopes } from '../logging';

export const updateStructureSpace = new ValidatedMethod({
  name: 'defaultspaces.updateStructureSpace',
  validate: new SimpleSchema({
    data: DefaultSpaces.schema,
  }).validator({ clean: true }),

  run({ data }) {
    // check if active and logged in
    const isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId: data.structureId });
    if (!isAdminOfStructure) {
      logServer(
        `DEFAULTSPACE - METHOD - METEOR ERROR - updateStructureSpace - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { data },
      );
      throw new Meteor.Error('api.defaultspaces.updateStructureSpace.notPermitted', i18n.__('api.users.notPermitted'));
    }
    checkPersonalSpaceData(data);
    const currentStructureSpace = DefaultSpaces.findOne({ structureId: data.structureId });
    if (currentStructureSpace === undefined) {
      // create DefaultSpaces if not existing
      logServer(`DEFAULTSPACE - METHOD - INSERT - updateStructureSpace - data: ${data}`, levels.VERBOSE, scopes.SYSTEM);
      DefaultSpaces.insert({ ...data });
    } else {
      logServer(
        `DEFAULTSPACE - METHOD - UPDATE - updateStructureSpace - current space id: ${currentStructureSpace._id} 
        / data: ${data}`,
        levels.VERBOSE,
        scopes.SYSTEM,
      );
      DefaultSpaces.update({ _id: currentStructureSpace._id }, { $set: data });
    }
  },
});

export const applyDefaultSpaceToAllUsers = new ValidatedMethod({
  name: 'defaultspaces.applyDefaultSpaceToAllUsers',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator({ clean: true }),

  run({ structureId }) {
    // check if active and logged in
    const isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId });
    if (!isAdminOfStructure) {
      logServer(
        `DEFAULTSPACE - METHOD - METEOR ERROR - applyDefaultSpaceToAllUsers - ${i18n.__('api.users.notPermitted')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { structureId },
      );
      throw new Meteor.Error(
        'api.defaultspaces.applyDefaultSpaceToAllUsers.notPermitted',
        i18n.__('api.users.notPermitted'),
      );
    }
    const allUsers = Meteor.users.find({ structure: structureId });

    allUsers.forEach((user) => generateDefaultPersonalSpace.call({ userId: user._id }));
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([updateStructureSpace, applyDefaultSpaceToAllUsers], 'name');

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
