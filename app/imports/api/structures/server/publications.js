import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { isActive } from '../../utils';
import Structures from '../structures';

// publish all structures
Meteor.publish('structures.all', function structuresAll() {
  // if (!isActive(this.userId)) {
  //   return this.ready();
  // }
  return Structures.find({}, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 });
});

// publish user  structure
Meteor.publish('structures.one', function structuresOne() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const user = Meteor.users.findOne({ _id: this.userId });
  return Structures.find({ _id: user.structure }, { fields: Structures.publicFields, sort: { name: 1 }, limit: 1 });
});

// publish structures from a list ids
Meteor.publish('structures.ids', function structuresids({ ids } = { ids: [] }) {
  // if (!isActive(this.userId)) {
  //   return this.ready();
  // }
  return Structures.find({ _id: { $in: ids } }, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 });
});

// publish top level structure and possibly childs
Meteor.publish('structures.top.with.childs', function structuresTopWithChilds({ parentIds } = { parentIds: [] }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }

  return Structures.find(
    {
      $or: [{ parentId: null }, { parentId: { $in: parentIds } }],
    },
    {
      fields: Structures.publicFields,
      sort: { name: 1 },
      limit: 10000,
    },
  );
});

Meteor.publish('structures.with.childs', async function structuresWithChilds({ structureId }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }

  const structure = Structures.find({ _id: structureId });
  if (!structure) {
    throw new Meteor.Error(
      'api.structures.updateStructure.unknownStructure',
      i18n.__('api.structures.unknownStructure'),
    );
  }

  const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');

  if (!authorized) {
    throw new Meteor.Error('api.structures.updateStructure.notPermitted', i18n.__('api.users.notPermitted'));
  }

  const data = await Structures.rawCollection().aggregate([
    {
      $graphLookup: {
        from: 'collection',
        startWith: '$parentId',
        connectFromField: 'parentId',
        connectToField: '_id',
        as: 'children',
      },
    },
    { $match: { _id: 'EviKfwqdFZcjEWFdz' } },
    {
      $addFields: {
        children: {
          $reverseArray: {
            $map: {
              input: '$children',
              as: 't',
              in: { _id: '$$t._id' },
            },
          },
        },
      },
    },
  ]);

  return data;
});
