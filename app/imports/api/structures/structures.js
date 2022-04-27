import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import PropTypes from 'prop-types';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const Structures = new Mongo.Collection('structures');

Structures.deny({
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

export const IntroductionStructure = {
  language: {
    type: String,
    label: getLabel('api.structures.labels.introduction.language'),
    optional: true,
  },
  title: {
    type: String,
    label: getLabel('api.structures.labels.introduction.title'),
    optional: true,
    defaultValue: null,
  },
  content: {
    type: String,
    label: getLabel('api.structures.labels.introduction.content'),
    optional: true,
    defaultValue: null,
  },
};

const IntroductionSchema = new SimpleSchema(IntroductionStructure);

export const defaultIntroduction = [
  {
    language: 'en',
    title: null,
    content: null,
  },
  {
    language: 'fr',
    title: null,
    content: null,
  },
];

Structures.schema = new SimpleSchema(
  {
    name: {
      type: String,
      min: 1,
      label: getLabel('api.structures.labels.name'),
    },
    parentId: {
      type: SimpleSchema.RegEx.Id,
      label: getLabel('api.structures.labels.parentId'),
      optional: true,
      defaultValue: null,
    },
    childrenIds: {
      type: Array,
      label: getLabel('api.structures.labels.childrenIds'),
      defaultValue: [],
    },
    'childrenIds.$': { type: String },
    ancestorsIds: {
      type: Array,
      label: getLabel('api.structures.labels.ancestorsIds'),
      defaultValue: [],
    },
    'ancestorsIds.$': { type: String },
    introduction: {
      type: Array,
      label: getLabel('api.structures.labels.introduction.label'),
      defaultValue: defaultIntroduction,
    },
    'introduction.$': {
      type: IntroductionSchema,
    },
  },
  {
    tracker: Tracker,
  },
);

Structures.publicFields = {
  _id: 1,
  name: 1,
  parentId: 1,
  childrenIds: 1,
  ancestorsIds: 1,
  introduction: 1,
};

Structures.attachSchema(Structures.schema);

export const propTypes = PropTypes.shape({
  _id: PropTypes.string,
  name: PropTypes.string,
  /** Can be `null` if top level structure */
  parentId: PropTypes.string,
  ancestorsIds: PropTypes.arrayOf(PropTypes.string),
  childrenIds: PropTypes.arrayOf(PropTypes.string),
});

export default Structures;
