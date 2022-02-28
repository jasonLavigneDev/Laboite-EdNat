import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const Helps = new Mongo.Collection('helps');

// Deny all client-side updates since we will be using methods to manage this collection
Helps.deny({
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

Helps.schema = new SimpleSchema(
  {
    title: {
      type: String,
      index: true,
      unique: true,
      min: 1,
      label: getLabel('api.helps.labels.title'),
    },
    description: {
      type: String,
      optional: true,
      label: getLabel('api.helps.labels.description'),
    },
    type: {
      type: SimpleSchema.Integer,
      allowedValues: [0, 5], // 0 external, 5 iframed
      label: getLabel('api.helps.labels.type'),
    },
    content: {
      type: String,
      label: getLabel('api.helps.labels.content'),
    },
  },
  { tracker: Tracker },
);

Helps.publicFields = {
  title: 1,
  description: 1,
  type: 1,
  content: 1,
};

Helps.typeLabels = {
  0: 'api.helps.types.external',
  5: 'api.helps.types.iframed',
};

Helps.attachSchema(Helps.schema);

export default Helps;
