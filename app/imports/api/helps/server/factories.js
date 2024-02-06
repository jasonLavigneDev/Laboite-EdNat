import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import { faker } from '@faker-js/faker';

import Helps from '../helps';

Factory.define('help', Helps, {
  title: () => Random.id(),
  description: faker.lorem.sentence().substring(0, 80),
  type: 0,
  content: faker.lorem.sentence(),
  category: faker.lorem.word,
});
