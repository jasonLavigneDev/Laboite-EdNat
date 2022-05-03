import { Meteor } from 'meteor/meteor';
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
Meteor.publish('structures.one', function structuresOne({ _id }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const user = Meteor.users.findOne({ _id: this.userId });
  return Structures.find(
    { _id: _id || user.structure },
    { fields: Structures.publicFields, sort: { name: 1 }, limit: 1 },
  );
});

Meteor.publish('structures.publishers', function structuresAll() {
  // returns all structures whose users have at least 1 publication
  const structIds = Meteor.users
    .find({ articlesCount: { $gt: 0 } }, { fields: { structure: 1 } })
    .fetch()
    .map((user) => user.structure);
  return Structures.find(
    { _id: { $in: structIds } },
    { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 },
  );
});

// publish structures from a list ids
Meteor.publish('structures.ids', function structuresids({ ids }) {
  return Structures.find({ _id: { $in: ids } }, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 });
});
