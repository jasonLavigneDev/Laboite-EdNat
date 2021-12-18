import { Factory } from 'meteor/dburles:factory';
import faker from 'faker';
import Structures from '../structures';

Factory.define('structure', Structures, {
  name: faker.company.companyName(),
  childrenIds: [],
});
