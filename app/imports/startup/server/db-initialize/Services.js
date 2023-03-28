import { Meteor } from 'meteor/meteor';
import Services from '../../../api/services/services';
import fakeData from './fakeData.json';
import logServer, { levels, scopes } from '../../../api/logging';

function createService(service) {
  const { title } = service;
  // logServer(`  Creating service ${title}.`);
  logServer(`STARTUP - SERVICES - createService -  Creating service ${title}.`, levels.INFO, scopes.SYSTEM, {
    service,
  });

  Services.insert({ ...service, structure: '' });
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Services.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    // logServer('Creating the default services');
    logServer(`STARTUP - SERVICES - Creating the default services`, levels.INFO, scopes.SYSTEM, {});
    fakeData.defaultServices.map(createService);
  } else {
    // logServer('No default services to create !  Please invoke meteor with a settings file.');
    logServer(
      `STARTUP - SERVICES - No default services to create !  Please invoke meteor with a settings file.`,
      levels.INFO,
      scopes.SYSTEM,
      {},
    );
  }
}
