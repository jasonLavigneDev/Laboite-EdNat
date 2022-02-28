import { Meteor } from 'meteor/meteor';
import { isActive } from '../../utils';
import Helps from '../helps';

// publish all categories
Meteor.publish('helps.all', function helpsAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Helps.find({}, { fields: Helps.publicFields, sort: { title: 1 }, limit: 10000 });
});
