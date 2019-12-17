import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Roles } from 'meteor/alanning:roles';

const AppRoles = ['candidate', 'member', 'admin'];

Meteor.users.schema = new SimpleSchema(
  {
    username: {
      type: String,
      optional: true,
    },
    firstName: {
      type: String,
      optional: true,
    },
    lastName: {
      type: String,
      optional: true,
    },
    emails: {
      type: Array,
      optional: true,
    },
    'emails.$': {
      type: Object,
    },
    'emails.$.address': {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
    },
    'emails.$.verified': {
      type: Boolean,
    },
    // Use this registered_emails field if you are using splendido:meteor-accounts-emails-field
    // splendido:meteor-accounts-meld
    // registered_emails: {
    //     type: Array,
    //     optional: true
    // },
    // 'registered_emails.$': {
    //     type: Object,
    //     blackbox: true
    // },
    createdAt: {
      type: Date,
    },
    profile: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
      type: Date,
      optional: true,
    },
    isActive: { type: Boolean, defaultValue: false },
    isRequest: { type: Boolean, defaultValue: true },
    favServices: {
      type: Array,
      defaultValue: [],
    },
    'favServices.$': {
      type: { type: String, regEx: SimpleSchema.RegEx.Id },
    },
    structure: {
      type: String,
      optional: true,
    },
  },
  { tracker: Tracker },
);

if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    // pass the structure name in the options
    console.log('CREATING USER ', options);
    const newUser = { ...user };
    if (options.firstName) newUser.firstName = options.firstName;
    if (options.lastName) newUser.lastName = options.lastName;
    if (options.structure) newUser.structure = options.structure;
    if (options.profile) newUser.profile = options.profile;
    return newUser;
  });
  // server side login hook
  Accounts.onLogin((details) => {
    if (details.type === 'keycloak') {
      console.log('ONLOGIN : ', details);
      // update user informations from keycloak service data
      if (details.user.username === undefined) {
        Meteor.users.update(
          { _id: details.user._id },
          {
            $set: {
              username: details.user.services.keycloak.email,
            },
          },
        );
      }
      Meteor.users.update(
        { _id: details.user._id },
        {
          $set: {
            firstName: details.user.services.keycloak.given_name,
            lastName: details.user.services.keycloak.name,
          },
        },
      );
      // rather use an additional top level field like user.primaryEmail ?
      Accounts.addEmail(details.user._id, details.user.services.keycloak.email);
    }
  });
}

Meteor.users.helpers({
  memberOf() {
    return Roles.getScopesForUser(this, 'member');
  },
  adminOf() {
    return Roles.getScopesForUser(this, 'admin');
  },
  candidateOf() {
    return Roles.getScopesForUser(this, 'candidate');
  },
});

Meteor.users.selfFields = {
  username: 1,
  firstName: 1,
  lastName: 1,
  emails: 1,
  createdAt: 1,
  isActive: 1,
  isRequest: 1,
  favServices: 1,
  structure: 1,
};

Meteor.users.publicFields = {
  username: 1,
  firstName: 1,
  lastName: 1,
  isActive: 1,
  isRequest: 1,
  structure: 1,
};

Meteor.users.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});

Meteor.users.attachSchema(Meteor.users.schema);

export default AppRoles;
