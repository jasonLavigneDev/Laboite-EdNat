import { Meteor } from 'meteor/meteor';
import Services from '../../../api/services/services';
import fakeData from './fakeData.json';
import logServer from '../../../api/logging';
import { NOTIFICATIONS_TYPES, SCOPE_TYPES } from '../../../api/notifications/enums';

function createService(service) {
  const { title } = service;
  // logServer(`  Creating service ${title}.`);
  logServer(
    `STARTUP - SERVICES - createService -  Creating service ${title}.`,
    NOTIFICATIONS_TYPES.INFO,
    SCOPE_TYPES.SYSTEM,
    { service },
  );

  Services.insert({ ...service, structure: '' });
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Services.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    // logServer('Creating the default services');
    logServer(`STARTUP - SERVICES - Creating the default services`, NOTIFICATIONS_TYPES.INFO, SCOPE_TYPES.SYSTEM, {});
    fakeData.defaultServices.map(createService);
  } else {
    // logServer('No default services to create !  Please invoke meteor with a settings file.');
    logServer(
      `STARTUP - SERVICES - No default services to create !  Please invoke meteor with a settings file.`,
      NOTIFICATIONS_TYPES.INFO,
      SCOPE_TYPES.SYSTEM,
      {},
    );
  }
}
