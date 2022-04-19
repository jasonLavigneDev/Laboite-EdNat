import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const Structures = new Mongo.Collection('structures');

Structures.deny({
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

Structures.schema = new SimpleSchema(
  {
    name: {
      type: String,
      min: 1,
      label: getLabel('api.structures.name'),
    },
    parentId: {
      type: SimpleSchema.RegEx.Id,
      label: getLabel('api.structures.parentId'),
      optional: true,
      defaultValue: null,
    },
    childrenIds: {
      type: Array,
      label: getLabel('api.structures.childrenIds'),
      defaultValue: [],
    },
    'childrenIds.$': { type: String },
    ancestorsIds: {
      type: Array,
      label: getLabel('api.structures.ancestorsIds'),
      defaultValue: [],
    },
    'ancestorsIds.$': { type: String },
  },
  {
    tracker: Tracker,
  },
);

Structures.publicFields = {
  _id: 1,
  name: 1,
  parentId: 1,
  childrenIds: 1,
  ancestorsIds: 1,
};

Structures.attachSchema(Structures.schema);

export default Structures;
