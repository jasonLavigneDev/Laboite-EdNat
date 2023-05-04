import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';
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

AnalyticsEvents.targets = {
  SERVICE: 'SERVICE',
  WIDGEt: 'WIDGET',
};

AnalyticsEvents.schema = new SimpleSchema(
  {
    target: {
      type: String,
      allowedValues: Object.keys(AnalyticsEvents.targets),
      label: getLabel('api.analytics.labels.target'),
      index: true,
    },
    content: {
      type: String,
      optional: true,
      label: getLabel('api.analytics.labels.content'),
      index: true,
    },
    count: {
      type: Number,
      label: getLabel('api.analytics.labels.count'),
      defaultValue: 0,
    },
    structureId: {
      type: SimpleSchema.RegEx.Id,
      label: getLabel('api.analytics.labels.structure'),
      optional: true,
      index: true,
    },
    createdAt: {
      type: Date,
      label: getLabel('api.analytics.labels.createdAt'),
      index: true,
      autoValue() {
        if (this.isUpsert) {
          return new Date(moment().startOf('hour').format());
        }
        return this.value;
      },
    },
  },
  { tracker: Tracker },
);

if (Meteor.isServer) {
  AnalyticsEvents.createIndex({
    structureId: 1,
    content: 1,
    target: 1,
    createdAt: 1,
  });
}

AnalyticsEvents.publicFields = {
  count: 1,
  structureId: 1,
  content: 1,
  target: 1,
  createdAt: 1,
};

AnalyticsEvents.attachSchema(AnalyticsEvents.schema);

export default AnalyticsEvents;
