import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';

import StructureSpaces from '../structurespaces';

Factory.define('structurespace', StructureSpaces, {
  structureId: () => Random.id(),
  sorted: [],
});
