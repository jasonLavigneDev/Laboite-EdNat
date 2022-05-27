import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import PersonalSpaces from '../personalspaces/personalspaces';
import { getLabel } from '../utils';

const DefaultSpaces = new Mongo.Collection('defaultspaces');

// Deny all client-side updates since we will be using methods to manage this collection
DefaultSpaces.deny({
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

const simplifiedPersonalSpacesSchema = PersonalSpaces.schema.omit('unsorted', 'userId');

const extensionSchema = new SimpleSchema(
  {
    structureId: {
      type: String,
      index: true,
      unique: true,
      min: 1,
    },
    updatedAt: {
      type: Date,
      label: getLabel('api.defaultspaces.labels.updatedAt'),
      autoValue() {
        return new Date();
      },
    },
  },
  { tracker: Tracker },
);

DefaultSpaces.schema = extensionSchema.extend(simplifiedPersonalSpacesSchema);

DefaultSpaces.publicFields = {
  structureId: 1,
  unsorted: 1,
  sorted: 1,
};

DefaultSpaces.attachSchema(DefaultSpaces.schema);

export default DefaultSpaces;
