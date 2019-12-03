import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

// required: loads accounts customization before initial users creation
import AppRoles from '../../api/users/users';

/* eslint-disable no-console */

function createUser(email, password, role, structure, firstName, lastName) {
  console.log(`  Creating user ${email}.`);
  const userID = Accounts.createUser({
    username: email,
    email,
    password,
    structure,
    firstName,
    lastName,
  });
  // global admin
  if (role === 'admin') {
    Roles.addUsersToRoles(userID, 'admin', null);
  }
}

Accounts.onCreateUser((options, user) => {
  // pass the structure name in the options
  const newUser = {
    ...user,
    firstName: options.firstName,
    lastName: options.lastName,
    structure: options.structure,
    profile: options.profile,
  };
  return newUser;
});

/* ensure all roles exist */
const existingRoles = Roles.getAllRoles()
  .fetch()
  .map((role) => role._id);
AppRoles.forEach((role) => {
  if (existingRoles.indexOf(role) === -1) Roles.createRole(role);
});

/** When running app for first time, pass a settings file to set up a default user account. */
if (Meteor.users.find().count() === 0) {
  if (Meteor.settings.defaultAccounts) {
    console.log('Creating the default user(s)');
    Meteor.settings.defaultAccounts.map(({
      email, password, role, structure, firstName, lastName,
    }) => createUser(email, password, role, structure, firstName, lastName));
  } else {
    console.log('No default users to create !  Please invoke meteor with a settings file.');
  }
}
