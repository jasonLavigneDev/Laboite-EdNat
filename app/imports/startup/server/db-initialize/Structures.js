import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import Structures from '../../../api/structures/structures';
import fakeData from './fakeData.json';
import logServer, { levels, scopes } from '../../../api/logging';

function createStructure(structure) {
  // logServer(`  Creating structure  `);
  // logServer(structure);
  logServer(`STARTUP - STRUCTURES - createStructure  Creating structure ${structure}`, levels.INFO, scopes.SYSTEM, {
    structure,
  });
  return Structures.insert(structure);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Structures.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    // logServer('Creating the default structures');
    logServer(`STARTUP - STRUCTURES - createStructure Creating the default structures`, levels.INFO, scopes.SYSTEM, {});
    if (fakeData.defaultStructures !== undefined) {
      fakeData.defaultStructures.forEach((structure) => {
        const structureId = createStructure(structure);
        Roles.createRole(structureId);
      });
    }
  } else {
    // logServer('No default structures to create !  Please invoke meteor with a settings file.');
    logServer(
      `STARTUP - STRUCTURES - No default structures to create !  Please invoke meteor with a settings file.`,
      levels.ERROR,
      scopes.SYSTEM,
      {},
    );
  }
}
