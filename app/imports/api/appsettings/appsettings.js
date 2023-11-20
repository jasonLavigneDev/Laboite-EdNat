import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { getLabel } from '../utils';

const AppSettings = new Mongo.Collection('appsettings');

// Deny all client-side updates since we will be using methods to manage this collection
AppSettings.deny({
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

const SettingsType = (type) =>
  new SimpleSchema({
    external: {
      type: Boolean,
      label: getLabel(`api.appsettings.labels.external_${type}`),
      optional: true,
    },
    link: {
      type: String,
      label: getLabel(`api.appsettings.labels.link_${type}`),
      optional: true,
    },
    content: {
      type: String,
      label: getLabel(`api.appsettings.labels.content_${type}`),
      optional: true,
    },
  });

const IntroductionI18n = new SimpleSchema({
  language: {
    type: String,
    label: getLabel('api.appsettings.labels.language'),
    optional: true,
  },
  content: {
    type: String,
    label: getLabel('api.appsettings.labels.content_introduction'),
    optional: true,
  },
});

const GlobalInfoI18n = new SimpleSchema({
  language: {
    type: String,
    label: getLabel('api.appsettings.labels.language'),
    optional: true,
  },
  content: {
    type: String,
    label: getLabel('api.appsettings.labels.content_globalInfo'),
    optional: true,
  },
});

AppSettings.schema = new SimpleSchema(
  {
    introduction: {
      type: Array,
      label: getLabel('api.appsettings.labels.introduction'),
    },
    'introduction.$': {
      type: IntroductionI18n,
    },
    globalInfo: {
      type: Array,
      label: getLabel('api.appsettings.labels.globalInfo'),
    },
    'globalInfo.$': {
      type: GlobalInfoI18n,
    },
    legal: {
      type: SettingsType('legal'),
      label: getLabel('api.appsettings.labels.legal'),
    },
    accessibility: {
      type: SettingsType('accessibility'),
      label: getLabel('api.appsettings.labels.accessibility'),
    },
    gcu: {
      type: SettingsType('gcu'),
      label: getLabel('api.appsettings.labels.gcu'),
    },
    personalData: {
      type: SettingsType('personal_data'),
      label: getLabel('api.appsettings.labels.personal_data'),
    },
    personalSpace: {
      type: SettingsType('personal_space'),
      label: getLabel('api.appsettings.labels.personalSpace'),
    },
    helpUrl: {
      type: SettingsType('help'),
      label: getLabel('api.appsettings.labels.helpUrl'),
    },
    maintenance: {
      type: Boolean,
      defaultValue: false,
      label: getLabel('api.appsettings.labels.maintenance'),
    },
    textMaintenance: {
      type: String,
      defaultValue: ' ',
      label: getLabel('api.appsettings.labels.textMaintenance'),
    },
    userStructureValidationMandatory: {
      type: Boolean,
      label: getLabel('api.appsettings.label.userStructureValidationMandatory'),
    },
  },
  { clean: { removeEmptyStrings: false }, tracker: Tracker },
);

AppSettings.publicFields = {
  introduction: 1,
  legal: 1,
  globalInfo: 1,
  accessibility: 1,
  gcu: 1,
  personalData: 1,
  maintenance: 1,
  textMaintenance: 1,
  userStructureValidationMandatory: 1,
  personalSpace: 1,
  helpUrl: 1,
};

AppSettings.introduction = {
  'introduction.content': 1,
  'introduction.language': 1,
};
AppSettings.globalInfo = {
  'globalInfo.content': 1,
  'globalInfo.language': 1,
};
AppSettings.links = {
  'legal.link': 1,
  'legal.external': 1,
  'accessibility.link': 1,
  'accessibility.external': 1,
  'gcu.link': 1,
  'gcu.external': 1,
  'personalData.link': 1,
  'personalData.external': 1,
  'personalSpace.link': 1,
  'personalSpace.external': 1,
  'helpUrl.link': 1,
  'helpUrl.external': 1,
};

AppSettings.legal = {
  'legal.link': 1,
  'legal.external': 1,
  'legal.content': 1,
};
AppSettings.accessibility = {
  'accessibility.link': 1,
  'accessibility.external': 1,
  'accessibility.content': 1,
};
AppSettings.gcu = {
  'gcu.link': 1,
  'gcu.external': 1,
  'gcu.content': 1,
};
AppSettings.personalData = {
  'personalData.link': 1,
  'personalData.external': 1,
  'personalData.content': 1,
};
AppSettings.personalSpace = {
  'personalSpace.link': 1,
  'personalSpace.external': 1,
  'personalSpace.content': 1,
};
AppSettings.helpUrl = {
  'helpUrl.link': 1,
  'helpUrl.external': 1,
};

AppSettings.attachSchema(AppSettings.schema);

export default AppSettings;
