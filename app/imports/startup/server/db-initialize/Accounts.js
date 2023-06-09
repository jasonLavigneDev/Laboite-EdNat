import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { ServiceConfiguration } from 'meteor/service-configuration';

// required: loads accounts customization before initial users creation
import faker from 'faker';

import AppRoles from '../../../api/users/users';
import { getStructureIds } from '../../../api/users/structures';
import fakeData from './fakeData.json';
import { testMeteorSettingsUrl } from '../../../ui/utils/utilsFuncs';
import logServer, { levels, scopes } from '../../../api/logging';

const accountConfig = {
  loginExpirationInDays: Meteor.settings.private.loginExpirationInDays || 1,
};

if (Meteor.settings.keycloak) {
  accountConfig.forbidClientAccountCreation = true;
  ServiceConfiguration.configurations.upsert(
    { service: 'keycloak' },
    {
      $set: {
        loginStyle: 'redirect',
        serverUrl: testMeteorSettingsUrl(Meteor.settings.public.keycloakUrl),
        realm: Meteor.settings.public.keycloakRealm,
        clientId: Meteor.settings.keycloak.client,
        realmPublicKey: Meteor.settings.keycloak.pubkey,
        bearerOnly: false,
      },
    },
  );
} else {
  logServer(
    `STARTUP - SERVER - ACCOUNTS - ServiceConfiguration -
    No Keycloak configuration. Please invoke meteor with a settings file.`,
    levels.INFO,
    scopes.SYSTEM,
    {},
  );
}
Accounts.config({
  ...accountConfig,
});

/* eslint-disable no-console */

function createUser(email, password, role, structure, firstName, lastName) {
  const userID = Accounts.createUser({
    username: email,
    email,
    password,
    structure,
    firstName,
    lastName,
  });
  logServer(
    `STARTUP - SERVER - ACCOUNTS - CreateUser - userID: ${userID} Creating user ${email}.`,
    levels.INFO,
    scopes.SYSTEM,
    {
      email,
      role,
      structure,
      firstName,
      lastName,
    },
  );
  // global admin
  if (role === 'admin') {
    Roles.addUsersToRoles(userID, 'admin', null);
  }
  // default accounts are created as active
  Meteor.users.update(userID, { $set: { isActive: true } });
}

/* ensure all roles exist */
const existingRoles = Roles.getAllRoles()
  .fetch()
  .map((role) => role._id);
AppRoles.forEach((role) => {
  if (existingRoles.indexOf(role) === -1) Roles.createRole(role);
});

/** When running app for first time, pass a settings file to set up a default user account. */
const NUMBER_OF_FAKE_USERS = 300;
if (Meteor.users.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer(`STARTUP - SERVER - ACCOUNTS - Creating the default user(s)`, levels.INFO, scopes.SYSTEM, {});
    fakeData.defaultAccounts.map(({ email, password, role, structure, firstName, lastName }) =>
      createUser(email, password, role, structure, firstName, lastName),
    );
    if (Meteor.isDevelopment) {
      const array = new Array(NUMBER_OF_FAKE_USERS);
      array.fill(0);
      array.forEach(() => {
        let retries = 3;
        while (retries > 0) {
          try {
            createUser(
              faker.internet.email(),
              faker.internet.password(),
              null,
              faker.random.arrayElement(getStructureIds()),
              faker.name.firstName(),
              faker.name.lastName(),
            );
            retries = 0;
          } catch (error) {
            // error can occur if faker choses the same email several times
            // abort and display error in other cases
            if (error.reason && error.reason.indexOf('already exists') !== -1) {
              retries -= 1;
            } else {
              logServer(
                `STARTUP- SERVER - ACCOUNTS - CreateUser - Error creating user: ${
                  error.reason || error.message || error
                }`,
                levels.ERROR,
                scopes.SYSTEM,
                {},
              );
              retries = 0;
            }
          }
        }
      });
    }
  } else {
    logServer(
      `STARTUP - SERVER - ACCOUNTS - 
      CreateUser - No default users to create !  Please invoke meteor with a settings file.`,
      levels.ERROR,
      scopes.SYSTEM,
      {},
    );
  }
}
