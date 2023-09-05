import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const Settings = new Mongo.Collection('settings');

// Deny all client-side updates since we will be using methods to manage this collection
Settings.deny({
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

Settings.schema = new SimpleSchema(
  {
    name: {
      type: String,
      defaultValue: 'settings',
      label: getLabel('api.settings.labels.name'),
    },
    sondageURL: {
      type: String,
      defaultValue: '',
      label: getLabel('api.settings.labels.sondageUrl'),
    },
  },
  { clean: { removeEmptyStrings: false }, tracker: Tracker },
);

Settings.publicFields = {
  name: 1,
  sondageurL: 1,
};

Settings.attachSchema(Settings.schema);

export default Settings;
