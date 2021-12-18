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
      /** No need to keep this to true since we use `_id` now */
      // unique: true,
    },
    /** Sous structures */
    childrenIds: {
      type: Array,
      optional: true,
      label: getLabel('api.structures.children'),
    },
    'childrenIds.$': {
      type: SimpleSchema.RegEx.Id,
      label: getLabel('api.structures.name'),
    },
  },
  {
    tracker: Tracker,
  },
);

Structures.publicFields = {
  _id: 1,
  name: 1,
  childrenIds: 1,
};

Structures.attachSchema(Structures.schema);

export default Structures;
