import { Meteor } from 'meteor/meteor';
import Helps from '../helps';

// publish all categories
Meteor.publish('helps.all', function helpsAll() {
  return Helps.find({}, { fields: Helps.publicFields, sort: { title: 1 }, limit: 10000 });
});
