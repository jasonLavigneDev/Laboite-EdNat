import { Meteor } from 'meteor/meteor';
import { isActive } from '../../utils';
import BusinessReGrouping from '../businessReGrouping';

// publish all businessReGrouping
Meteor.publish('businessReGrouping.all', function businessReGroupingAll() {
  if (!Meteor.settings.public.offlinePage && !isActive(this.userId)) {
    return this.ready();
  }
  return BusinessReGrouping.find({}, { fields: BusinessReGrouping.publicFields, sort: { _id: 1 }, limit: 1000 });
});
