import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import Articles from '../articles';

Factory.define('article', Articles, {
  title: () => Random.id(),
  content: faker.lorem.sentence(),
  description: faker.lorem.sentence().substring(0, 399),
  userId: () => Random.id(),
  structure: () => faker.company.companyName(),
});
