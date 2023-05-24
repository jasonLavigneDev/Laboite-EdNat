import { Meteor } from 'meteor/meteor';
import Services from '../../../api/services/services';
import fakeData from './fakeData.json';
import logServer, { levels, scopes } from '../../../api/logging';

function createService(service) {
  const { title } = service;
  logServer(`STARTUP - SERVICES - INSERT - createService -  Creating service ${title}.`, levels.INFO, scopes.SYSTEM, {
    service,
  });

  Services.insert({ ...service, structure: '' });
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Services.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer(`STARTUP - SERVICES - CREATE - Creating the default services`, levels.INFO, scopes.SYSTEM, {});
    fakeData.defaultServices.map(createService);
  } else {
    logServer(
      `STARTUP - SERVICES - ERROR - No default services to create !  Please invoke meteor with a settings file.`,
      levels.ERROR,
      scopes.SYSTEM,
      {},
    );
  }
}
