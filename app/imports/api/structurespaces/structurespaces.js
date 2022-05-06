import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

const StructureSpaces = new Mongo.Collection('structurespaces');

// Deny all client-side updates since we will be using methods to manage this collection
StructureSpaces.deny({
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

StructureSpaces.schema = new SimpleSchema(
  {
    structureId: {
      type: String,
      index: true,
      unique: true,
      min: 1,
    },
    sorted: {
      type: Array,
      defaultValue: [],
    },
    'sorted.$': {
      type: Object,
    },
    'sorted.$.zone_id': {
      type: String,
    },
    'sorted.$.name': {
      type: String,
    },
    'sorted.$.elements': {
      type: Array,
      defaultValue: [],
    },
    'sorted.$.elements.$': {
      type: Object,
    },
    'sorted.$.elements.$.type': {
      type: String,
    },
    'sorted.$.elements.$.element_id': {
      type: String,
    },
    'sorted.$.elements.$.title': {
      type: String,
      optional: true,
    },
    'sorted.$.elements.$.url': {
      type: String,
      optional: true,
    },
  },
  { tracker: Tracker },
);

StructureSpaces.publicFields = {
  userId: 1,
  sorted: 1,
};

StructureSpaces.attachSchema(StructureSpaces.schema);

export default StructureSpaces;
