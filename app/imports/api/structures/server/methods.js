import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';
import Structures from '../structures';
import { unauthorized } from '../../lib/errors';

export const getStructures = new ValidatedMethod({
  name: 'structures.getStructures',
  validate: null,
  run() {
    return Structures.find().fetch();
  },
});

export const getStructureAndAllChilds = new ValidatedMethod({
  name: 'structures.getStructureAndAllChilds',
  validate: new SimpleSchema({
    allStructures: {
      type: Boolean,
      optional: true,
    },
  }).validator(),
  run({ allStructures }) {
    const user = Meteor.user({ structure: 1 });
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');

    if (allStructures && !isAdmin) {
      throw unauthorized();
    }

    if (!(isAdmin || Roles.userIsInRole(this.userId, 'adminStructure', user.structure))) {
      throw unauthorized();
    }

    const $match = {};

    if (allStructures) {
      $match.parentId = null;
    } else {
      $match._id = user.structure;
    }

    const structureTree = Structures.aggregate([
      { $match },
      {
        $graphLookup: {
          from: 'structures',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'subStructures',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          subStructures: 1,
        },
      },
    ]);

    return structureTree;

    // return Structures.find(query, {
    //   fields: Structures.publicFields,
    //   sort: { name: 1 },
    //   limit: 10000,
    // }).fetch();
  },
});

// Get list of all method names on Structures
const LISTS_METHODS = _.pluck([getStructures], 'name');

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
