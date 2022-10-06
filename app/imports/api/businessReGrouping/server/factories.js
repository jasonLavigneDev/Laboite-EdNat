import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import BusinessReGrouping from '../businessReGrouping';

Factory.define('businessReGrouping', BusinessReGrouping, {
  name: () => Random.id(),
  structure: () => Random.id(),
});
