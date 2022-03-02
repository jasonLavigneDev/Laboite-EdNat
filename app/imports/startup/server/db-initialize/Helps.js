import { Meteor } from 'meteor/meteor';
import Helps from '../../../api/helps/helps';
import fakeData from './fakeData.json';
import logServer from '../../../api/logging';

function createService(help) {
  const { title } = help;
  logServer(`  Creating helps ${title}.`);
  Helps.insert({ ...help, type: 5 });
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Helps.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer('Creating the default helps items');
    fakeData.defaultHelps.map(createService);
  } else {
    logServer('No default helps items to create !  Please invoke meteor with a settings file.');
  }
}
