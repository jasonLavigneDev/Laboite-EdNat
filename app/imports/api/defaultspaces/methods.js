import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';

import DefaultSpaces from './defaultspaces';
import { generateDefaultPersonalSpace } from '../personalspaces/methods';
import { hasAdminRightOnStructure } from '../structures/utils';
import PersonalSpaces from '../personalspaces/personalspaces';

export const updateStructureSpace = new ValidatedMethod({
  name: 'defaultspaces.updateStructureSpace',
  validate: new SimpleSchema({
    data: DefaultSpaces.schema,
  }).validator({ clean: true }),

  run({ data }) {
    // check if active and logged in
    const isAdminOfStructure = hasAdminRightOnStructure({ userId: this.userId, structureId: data.structureId });
    if (!isAdminOfStructure) {
      throw new Meteor.Error('api.defaultspaces.updateStructureSpace.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // console.log(data);
    const currentStructureSpace = DefaultSpaces.findOne({ structureId: data.structureId });
    if (currentStructureSpace === undefined) {
      // create DefaultSpaces if not existing
      DefaultSpaces.insert({ ...data });
    } else {
      DefaultSpaces.update({ _id: currentStructureSpace._id }, { $set: data });

      // take in account of this modification for user's personal space
      if (data.sorted?.length > 0) {
        data.sorted.forEach((defaultSpace) => {
          const usersPS = PersonalSpaces.find({ sorted: { $elemMatch: { zone_id: defaultSpace.zone_id } } }).fetch();
          if (usersPS && usersPS.length > 0) {
            usersPS.forEach((ps) => {
              if (defaultSpace.elements?.length === 0) {
                PersonalSpaces.update({ _id: ps._id }, { $pull: { sorted: { zone_id: defaultSpace.zone_id } } });
              } else if (defaultSpace.elements?.length > 0) {
                PersonalSpaces.update(
                  { _id: ps._id, 'sorted.zone_id': defaultSpace.zone_id },
                  { $set: { 'sorted.$.elements': defaultSpace.elements } },
                  { upsert: false },
                );
              }
            });
          }
        });
      }
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
