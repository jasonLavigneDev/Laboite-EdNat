import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import faker from 'faker';

const Services = new Mongo.Collection('services');

// Deny all client-side updates since we will be using methods to manage this collection
Services.deny({
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

Services.schema = new SimpleSchema(
  {
    title: {
      type: String,
      index: true,
      unique: true,
      min: 1,
    },
    description: String,
    url: String,
    logo: String,
    categories: { type: Array, defaultValue: [] },
    'categories.$': { type: String, regEx: SimpleSchema.RegEx.Id },
  },
  { tracker: Tracker },
);

Services.publicFields = {
  title: 1,
  description: 1,
  url: 1,
  logo: 1,
  categories: 1,
};

Factory.define('service', Services, {
  title: () => Random.id(),
  description: faker.lorem.sentence(),
  url: faker.internet.url(),
  logo: faker.internet.url(),
  categories: [],
});

Services.attachSchema(Services.schema);

export default Services;
