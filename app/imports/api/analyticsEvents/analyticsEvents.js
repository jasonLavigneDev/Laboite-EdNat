import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const AnalyticsEvents = new Mongo.Collection('analytics');

// Deny all client-side updates since we will be using methods to manage this collection
AnalyticsEvents.deny({
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

AnalyticsEvents.types = {
  CLICK: 'CLICK',
  VIEW: 'VIEW',
};

AnalyticsEvents.schema = new SimpleSchema(
  {
    type: {
      type: String,
      allowedValues: Object.keys(AnalyticsEvents.types),
      label: getLabel('api.analytics.labels.type'),
    },
    target: {
      type: String,
      label: getLabel('api.analytics.labels.target'),
    },
    sessionId: {
      type: String,
      label: getLabel('api.analytics.labels.sessionId'),
    },
    userId: {
      type: SimpleSchema.RegEx.Id,
      optional: true,
      label: getLabel('api.analytics.labels.userId'),
    },
    createdAt: {
      type: Date,
      label: getLabel('api.analytics.labels.createdAt'),
      autoValue() {
        if (this.isInsert) {
          return new Date();
        }
        return this.value;
      },
    },
  },
  { tracker: Tracker },
);

AnalyticsEvents.publicFields = {
  title: 1,
  description: 1,
  type: 1,
  content: 1,
  category: 1,
};

AnalyticsEvents.attachSchema(AnalyticsEvents.schema);

export default AnalyticsEvents;
