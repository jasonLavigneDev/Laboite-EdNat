import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import DefaultSpaces from '../defaultspaces';

Factory.define('defaultspace', DefaultSpaces, {
  structureId: () => Random.id(),
  sorted: [],
  updatedAt: new Date(),
});
