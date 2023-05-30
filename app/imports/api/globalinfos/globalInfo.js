import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
// import { getLabel } from '../utils';

const GlobalInfos = new Mongo.Collection('globalinfos');

// Deny all client-side updates since we will be using methods to manage this collection
GlobalInfos.deny({
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

GlobalInfos.schema = new SimpleSchema(
  {
    createdAt: {
      type: Date,
      defaultValue: new Date(),
    },
    updatedAt: {
      type: Date,
      autoValue() {
        return new Date();
      },
    },
    expirationDate: {
      type: Date || null,
    },
    content: {
      type: String,
    },
    language: {
      type: String,
    },
    structureId: {
      type: Array,
      defaultValue: [],
    },
    'structureId.$': { type: String },
  },
  { tracker: Tracker },
);

GlobalInfos.attachSchema(GlobalInfos.schema);

export default GlobalInfos;
