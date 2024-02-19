import { Factory } from 'meteor/dburles:factory';
import { faker } from '@faker-js/faker';
import Structures from '../structures';

Factory.define('structure', Structures, {
  name: faker.company.name(),
  parentId: null,
  ancestorsIds: [],
  childrenIds: [],
});
