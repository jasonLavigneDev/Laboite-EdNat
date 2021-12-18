import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import Structures from '../../../api/structures/structures';
import fakeData from './fakeData.json';
import logServer from '../../../api/logging';

function createStructure(structure) {
  logServer(`  Creating structure  `);
  logServer(structure);
  Structures.insert(structure);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Structures.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer('Creating the default structures');
    if (fakeData.defaultStructures !== undefined) {
      fakeData.defaultStructures.forEach((structure) => {
        createStructure(structure);
        Roles.createRole(structure._id);
      });
    }
  } else {
    logServer('No default structures to create !  Please invoke meteor with a settings file.');
  }
}
