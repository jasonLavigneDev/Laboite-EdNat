import { Meteor } from 'meteor/meteor';
import AppSettings from '../appsettings';

// publish all settings
Meteor.publish('appsettings.all', () => {
  const { publicFields } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: publicFields, sort: { _id: 1 }, limit: 1 });
});

// publish links settings
Meteor.publish('appsettings.introduction', () => {
  const { introduction } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: introduction, sort: { _id: 1 }, limit: 1 });
});

Meteor.publish('appsettings.globalInfo', () => {
  const { globalInfo } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: globalInfo, sort: { _id: 1 }, limit: 1 });
});

// publish GCU settings
Meteor.publish('appsettings.gcu', () => {
  const { gcu } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: gcu, sort: { _id: 1 }, limit: 1 });
});

// publish legal settings
Meteor.publish('appsettings.legal', () => {
  const { legal } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: legal, sort: { _id: 1 }, limit: 1 });
});

// publish accessibility settings
Meteor.publish('appsettings.accessibility', () => {
  const { accessibility } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: accessibility, sort: { _id: 1 }, limit: 1 });
});

// publish personal_data settings
Meteor.publish('appsettings.personalData', () => {
  const { personalData } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: personalData, sort: { _id: 1 }, limit: 1 });
});

// publish personal space intro settings
Meteor.publish('appsettings.personalSpace', () => {
  const { personalSpace } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: personalSpace, sort: { _id: 1 }, limit: 1 });
});

// publish maintenance settings
Meteor.publish('appsettings.maintenance', () => {
  const { maintenance } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: maintenance, sort: { _id: 1 }, limit: 1 });
});

// publish textMaintenance settings
Meteor.publish('appsettings.textMaintenance', () => {
  const { textMaintenance } = AppSettings;
  return AppSettings.find({ _id: 'settings' }, { fields: textMaintenance, sort: { _id: 1 }, limit: 1 });
});

// publish userStructureValidationMandatory settings
Meteor.publish('appsettings.userStructureValidationMandatory', () => {
  const { userStructureValidationMandatory } = AppSettings;
  return AppSettings.find(
    { _id: 'settings' },
    { fields: userStructureValidationMandatory, sort: { _id: 1 }, limit: 1 },
  );
});
