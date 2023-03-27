import { Meteor } from 'meteor/meteor';
import Categories from '../../../api/categories/categories';
import fakeData from './fakeData.json';
import logServer from '../../../api/logging';
import { NOTIFICATIONS_TYPES, SCOPE_TYPES } from '../../../api/notifications/enums';

function createCategorie(categorie) {
  // logServer(`  Creating categorie ${categorie.name}.`);
  logServer(
    `STARTUP - CATEGORIE - create categorie - Creating categorie ${categorie.name}.`,
    NOTIFICATIONS_TYPES.INFO,
    SCOPE_TYPES.SYSTEM,
    { categorie },
  );
  Categories.insert(categorie);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Categories.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    // logServer('Creating the default categories');
    logServer(
      `STARTUP - CATEGORIE - create categorie - Creating the default categories.`,
      NOTIFICATIONS_TYPES.INFO,
      SCOPE_TYPES.SYSTEM,
      {},
    );
    fakeData.defaultCategories.map((categorie) => createCategorie(categorie));
  } else {
    // logServer('No default categories to create !  Please invoke meteor with a settings file.');
    logServer(
      `STARTUP - CATEGORIE - create categorie -
       No default categories to create !  Please invoke meteor with a settings file.`,
      NOTIFICATIONS_TYPES.ERROR,
      SCOPE_TYPES.SYSTEM,
      {},
    );
  }
}
