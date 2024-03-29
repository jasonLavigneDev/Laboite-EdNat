import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';
import { NOTIFICATIONS_TYPES } from './enums';

const Notifications = new Mongo.Collection('notifications');

// Deny all client-side updates since we will be using methods to manage this collection
Notifications.deny({
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

Notifications.schema = new SimpleSchema(
  {
    userId: {
      type: String,
      index: true,
      label: getLabel('api.notifications.labels.userId'),
    },
    title: { type: String, optional: true, label: getLabel('api.notifications.labels.title') },
    content: { type: String, optional: true, label: getLabel('api.notifications.labels.content') },
    type: {
      type: String,
      label: getLabel('api.notifications.labels.type'),
      allowedValues: Object.values(NOTIFICATIONS_TYPES),
    },
    link: { type: String, optional: true, label: getLabel('api.notifications.labels.link') },
    createdAt: {
      type: Date,
      label: getLabel('api.notifications.labels.createdAt'),
      autoValue() {
        if (this.isInsert) {
          return new Date();
        }
        return this.value;
      },
    },
    expireAt: {
      type: Date,
      label: getLabel('api.notifications.labels.createdAt'),
      optional: true,
    },
    read: { type: Boolean, defaultValue: false, label: getLabel('api.notifications.labels.read') },
  },
  { tracker: Tracker },
);

Notifications.publicFields = {
  userId: 1,
  title: 1,
  content: 1,
  link: 1,
  type: 1,
  createdAt: 1,
  read: 1,
};

Notifications.attachSchema(Notifications.schema);

if (Meteor.isServer) {
  Notifications.rawCollection().createIndex(
    { expireAt: 1 },
    { expireAfterSeconds: 0, partialFilterExpression: { expireAt: { $exists: true } } },
  );
}

export default Notifications;
