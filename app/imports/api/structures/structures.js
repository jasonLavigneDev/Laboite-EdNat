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
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.structures.labels.parentId'),
      optional: true,
      defaultValue: null,
    },
    childrenIds: {
      type: Array,
      label: getLabel('api.structures.labels.childrenIds'),
      defaultValue: [],
    },
    'childrenIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    ancestorsIds: {
      type: Array,
      label: getLabel('api.structures.labels.ancestorsIds'),
      defaultValue: [],
    },
    'ancestorsIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    introduction: {
      type: Array,
      label: getLabel('api.structures.labels.introduction.label'),
      defaultValue: defaultIntroduction,
    },
    'introduction.$': {
      type: IntroductionSchema,
    },
    contactEmail: {
      type: String,
      label: getLabel('api.structures.labels.contactEmail'),
      optional: true,
      defaultValue: null,
      regEx: SimpleSchema.RegEx.Email,
    },
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.structures.labels.groupId'),
      optional: true,
      defaultValue: null,
    },
    asamExtensionsIds: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.structures.labels.asamExtensionsIds'),
    },
    'asamExtensionsIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    userStructureValidationMandatory: {
      type: Boolean,
      optional: true,
      label: getLabel('api.appsettings.label.userStructureValidationMandatory'),
    },
    iconUrlImage: {
      type: String,
      label: getLabel('api.structures.labels.iconUrlImage'),
      optional: true,
    },
    coverUrlImage: {
      type: String,
      label: getLabel('api.structures.labels.coverUrlImage'),
      optional: true,
    },
    externalUrl: {
      type: String,
      label: getLabel('api.structures.labels.externalUrl'),
      optional: true,
      defaultValue: null,
    },
    sendMailToParent: {
      type: Boolean,
      optional: true,
      defaultValue: false,
      label: getLabel('api.appsettings.label.sendMailToParent'),
    },
    sendMailToStructureAdmin: {
      type: Boolean,
      optional: true,
      defaultValue: false,
      label: getLabel('api.appsettings.label.sendMailToStructureAdmin'),
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
  contactEmail: 1,
  asamExtensionsIds: 1,
  userStructureValidationMandatory: 1,
  iconUrlImage: 1,
  coverUrlImage: 1,
  externalUrl: 1,
  sendMailToParent: 1,
  sendMailToStructureAdmin: 1,
};

Structures.attachSchema(Structures.schema);

export const propTypes = PropTypes.shape({
  _id: PropTypes.string,
  name: PropTypes.string,
  /** Can be `null` if top level structure */
  parentId: PropTypes.string,
  ancestorsIds: PropTypes.arrayOf(PropTypes.string),
  childrenIds: PropTypes.arrayOf(PropTypes.string),
  asamExtensionsIds: PropTypes.arrayOf(PropTypes.string),
  userStructureValidationMandatory: PropTypes.bool,
});

export default Structures;
