import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const BusinessReGrouping = new Mongo.Collection('BusinessReGrouping');

// Deny all client-side updates since we will be using methods to manage this collection
BusinessReGrouping.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});

BusinessReGrouping.schema = new SimpleSchema(
  {
    name: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      label: getLabel('api.businessReGrouping.labels.name'),
    },
  },
  { tracker: Tracker },
);

BusinessReGrouping.publicFields = {
  name: 1,
};

BusinessReGrouping.attachSchema(BusinessReGrouping.schema);

export default BusinessReGrouping;
