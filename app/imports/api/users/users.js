import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Roles } from 'meteor/alanning:roles';
import logServer from '../logging';
import Structures from '../structures/structures';
import { getLabel } from '../utils';
import { getRandomNCloudURL } from '../nextcloud/methods';
import AsamExtensions from '../asamextensions/asamextensions';

const AppRoles = ['candidate', 'member', 'animator', 'admin', 'adminStructure'];

Meteor.users.schema = new SimpleSchema(
  {
    username: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.username'),
    },
    firstName: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.firstName'),
    },
    lastName: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.lastName'),
    },
    emails: {
      type: Array,
      optional: true,
      label: getLabel('api.users.labels.emails'),
    },
    'emails.$': {
      type: Object,
    },
    'emails.$.address': {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
      label: getLabel('api.users.labels.emailAddress'),
    },
    'emails.$.verified': {
      type: Boolean,
      label: getLabel('api.users.labels.emailVerified'),
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
      label: getLabel('api.users.labels.createdAt'),
    },
    lastLogin: {
      type: Date,
      label: getLabel('api.users.labels.lastLogin'),
      optional: true,
    },
    profile: {
      type: Object,
      optional: true,
      blackbox: true,
      label: getLabel('api.users.labels.profile'),
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
      type: Object,
      optional: true,
      blackbox: true,
      label: getLabel('api.users.labels.services'),
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
      type: Date,
      optional: true,
      label: getLabel('api.users.labels.heartbeat'),
    },
    isActive: { type: Boolean, defaultValue: false, label: getLabel('api.users.labels.isActive') },
    isRequest: { type: Boolean, defaultValue: true, label: getLabel('api.users.labels.isRequest') },
    favServices: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.users.labels.favServices'),
    },
    'favServices.$': {
      type: { type: String, regEx: SimpleSchema.RegEx.Id },
    },
    favGroups: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.users.labels.favGroups'),
    },
    'favGroups.$': {
      type: { type: String, regEx: SimpleSchema.RegEx.Id },
    },
    favUserBookmarks: {
      type: Array,
      defaultValue: [],
      label: getLabel('api.users.labels.favUserBookmarks'),
    },
    'favUserBookmarks.$': {
      type: { type: String, regEx: SimpleSchema.RegEx.Id },
    },
    structure: {
      type: SimpleSchema.RegEx.Id,
      optional: true,
      label: getLabel('api.users.labels.structure'),
    },
    awaitingStructure: {
      type: SimpleSchema.RegEx.Id,
      optional: true,
      index: 1,
      label: getLabel('api.users.labels.awaitingStructure'),
    },
    primaryEmail: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
      optional: true,
      label: getLabel('api.users.labels.primaryEmail'),
    },
    language: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.language'),
    },
    logoutType: {
      type: String,
      optional: true,
      allowedValues: ['ask', 'local', 'global'],
      label: getLabel('api.users.labels.logoutType'),
    },
    advancedPersonalPage: {
      type: Boolean,
      defaultValue: false,
      label: getLabel('api.users.labels.advancedPersonalPage'),
    },
    articlesCount: {
      type: SimpleSchema.Integer,
      defaultValue: 0,
    },
    lastArticle: {
      type: Date,
      optional: true,
    },
    avatar: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.avatar'),
    },
    groupCount: {
      type: SimpleSchema.Integer,
      optional: true,
      defaultValue: 0,
      label: getLabel('api.users.labels.groupCount'),
    },
    groupQuota: {
      type: SimpleSchema.Integer,
      optional: true,
      defaultValue: 10,
      label: getLabel('api.users.labels.groupQuota'),
    },
    mezigName: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.primaryEmail'),
    },
    nclocator: {
      type: String,
      autoValue() {
        if (this.isInsert) {
          return getRandomNCloudURL();
        }
        return this.value;
      },
      label: getLabel('api.users.labels.ncloud'),
    },
    nctoken: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.ncloudToken'),
    },
    articlesEnable: {
      type: Boolean,
      optional: true,
      defaultValue: false,
      label: getLabel('api.users.labels.articlesEnable'),
    },
    authToken: {
      type: String,
      index: true,
      unique: true,
      optional: true,
      autoValue() {
        if (this.isInsert) {
          return Random.secret(150);
        }
        return this.value;
      },
      label: getLabel('api.users.labels.authToken'),
    },
    status: {
      type: Object,
      optional: true,
    },
    'status.lastlogin': {
      type: Object,
      optional: true,
    },
    'status.lastlogin.date': {
      type: Date,
      optional: true,
    },
    'status.lastlogin.ipAddr': {
      type: String,
      optional: true,
    },
    'status.userAgent': {
      type: String,
      optional: true,
    },
    'status.idle': {
      type: Boolean,
      optional: true,
    },
    'status.lastActivity': {
      type: Date,
      optional: true,
    },
    'status.online': {
      type: Boolean,
      optional: true,
    },
  },
  { clean: { removeEmptyStrings: false }, tracker: Tracker },
);

if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    // pass the structure name in the options
    const newUser = { ...user };
    if (user.services && user.services.keycloak) {
      /* eslint no-console:off */
      logServer('Creating new user after Keycloak authentication :');
      logServer(`  Keycloak id: ${user.services.keycloak.id}`);
      logServer(`  email: ${user.services.keycloak.email}`);

      // split the email in two parts
      const splittedEmail = user.services.keycloak.email.split('@');
      // remove first part to keep extension
      splittedEmail.shift();
      const emailExtension = AsamExtensions.findOne({ extension: splittedEmail.join('') });
      if (typeof emailExtension !== 'undefined' && typeof emailExtension.structureId === 'string') {
        const structure = Structures.findOne({ _id: emailExtension.structureId });
        // If we have a structure, assign it to user and make them directly active
        if (typeof structure !== 'undefined') {
          newUser.structure = structure._id;
          newUser.isActive = true;
        }
      }

      newUser.emails = [{ address: user.services.keycloak.email, verified: true }];
    }
    if (options.firstName) newUser.firstName = options.firstName;
    if (options.lastName) newUser.lastName = options.lastName;
    if (options.structure) newUser.structure = options.structure;
    if (options.profile) newUser.profile = options.profile;

    return newUser;
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

Meteor.users.logoutTypeLabels = {
  ask: 'api.users.logoutTypes.ask',
  local: 'api.users.logoutTypes.local',
  global: 'api.users.logoutTypes.global',
};

Meteor.users.selfFields = {
  username: 1,
  firstName: 1,
  lastName: 1,
  emails: 1,
  createdAt: 1,
  isActive: 1,
  isRequest: 1,
  favServices: 1,
  favGroups: 1,
  favUserBookmarks: 1,
  structure: 1,
  awaitingStructure: 1,
  primaryEmail: 1,
  language: 1,
  logoutType: 1,
  lastLogin: 1,
  avatar: 1,
  groupCount: 1,
  groupQuota: 1,
  nclocator: 1,
  advancedPersonalPage: 1,
  articlesEnable: 1,
};

Meteor.users.adminFields = {
  username: 1,
  firstName: 1,
  lastName: 1,
  emails: 1,
  createdAt: 1,
  isActive: 1,
  isRequest: 1,
  structure: 1,
  awaitingStructure: 1,
  lastLogin: 1,
  avatar: 1,
  groupCount: 1,
  groupQuota: 1,
  nclocator: 1,
  articlesEnable: 1,
};

Meteor.users.publicFields = {
  username: 1,
  firstName: 1,
  lastName: 1,
  isActive: 1,
  isRequest: 1,
  structure: 1,
  awaitingStructure: 1,
  emails: 1,
  articlesCount: 1,
  lastArticle: 1,
  avatar: 1,
  groupCount: 1,
  groupQuota: 1,
  mezigName: 1,
  nclocator: 1,
  articlesEnable: 1,
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
