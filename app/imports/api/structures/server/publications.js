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

// publish structures from a list ids
Meteor.publish('structures.ids', function structuresids({ ids }) {
  // if (!isActive(this.userId)) {
  //   return this.ready();
  // }
  return Structures.find({ _id: { $in: ids } }, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 });
});
