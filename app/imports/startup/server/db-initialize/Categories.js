import { Meteor } from 'meteor/meteor';
import Categories from '../../../api/categories/categories';
import fakeData from './fakeData.json';
import logServer, { levels, scopes } from '../../../api/logging';

function createCategorie(categorie) {
  logServer(
    `STARTUP - CATEGORIE - INSERT - create categorie - Creating categorie ${categorie.name}.`,
    levels.INFO,
    scopes.SYSTEM,
    { categorie },
  );
  Categories.insert(categorie);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Categories.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer(
      `STARTUP - CATEGORIE - CREATE - create categorie - Creating the default categories.`,
      levels.INFO,
      scopes.SYSTEM,
      {},
    );
    fakeData.defaultCategories.map((categorie) => createCategorie(categorie));
  } else {
    logServer(
      `STARTUP - CATEGORIE - ERROR - create categorie -
       No default categories to create !  Please invoke meteor with a settings file.`,
      levels.ERROR,
      scopes.SYSTEM,
      {},
    );
  }
}
