import { Meteor } from 'meteor/meteor';
import Helps from '../../../api/helps/helps';
import fakeData from './fakeData.json';
import logServer, { levels, scopes } from '../../../api/logging';

function createService(help) {
  const { title } = help;
  logServer(`STARTUP - HELPS - INSERT - create Service -  Creating helps ${title}.`, levels.VERBOSE, scopes.SYSTEM, {
    help,
  });
  Helps.insert({ ...help, type: 5 });
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Helps.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer(`STARTUP - HELPS - CREATE - Creating the default helps items`, levels.VERBOSE, scopes.SYSTEM);
    fakeData.defaultHelps.map(createService);
  } else {
    logServer(
      `STARTUP - HELPS - ERROR - No default helps items to create !  Please invoke meteor with a settings file.`,
      levels.ERROR,
      scopes.SYSTEM,
    );
  }
}
