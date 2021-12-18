import { Meteor } from 'meteor/meteor';
import { isActive } from '../../utils';
import Structures from '../structures';

// publish all structures
Meteor.publish('structures.all', function structuresAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Structures.find({}, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 });
});
