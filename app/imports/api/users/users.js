import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Roles } from 'meteor/alanning:roles';
import logServer, { levels, scopes } from '../logging';

import Structures from '../structures/structures';
import { getLabel } from '../utils';
import { getRandomNCloudURL } from '../nextcloud/methods';
import { warnAdministrators } from './userWarning';
import AsamExtensions from '../asamextensions/asamextensions';

const AppRoles = ['candidate', 'member', 'animator', 'admin', 'adminStructure'];

Meteor.users.schema = new SimpleSchema(
  {
    lastGlobalInfoReadDate: {
      type: Date,
      defaultValue: null,
      optional: true,
    },
    username: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.username'),
    },
    firstName: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.firstName'),
      index: true,
    },
    lastName: {
      type: String,
      optional: true,
      label: getLabel('api.users.labels.lastName'),
      index: true,
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
      index: true,
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
    betaServices: {
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

export const findStructureByEmail = (email) => {
  // split the email in two parts
  const splittedEmail = email ? email.split('@') : null;
  // remove first part to keep extension
  if (Array.isArray(splittedEmail)) {
    splittedEmail.shift();
  }
  const emailExtension =
    splittedEmail && Array.isArray(splittedEmail)
      ? AsamExtensions.findOne({ extension: splittedEmail.join('') })
      : null;
  if (emailExtension && typeof emailExtension !== 'undefined' && typeof emailExtension.structureId === 'string') {
    return Structures.findOne({ _id: emailExtension.structureId });
  }
  return undefined;
};

export const findStructureAllowed = (structureObject, apiKey, tabApiKeys, tabApiKeysByStructure) => {
  let isAllowed = false;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in tabApiKeysByStructure) {
    const structuresInTab = tabApiKeysByStructure[key];
    // eslint-disable-next-line no-restricted-syntax, no-plusplus
    for (let i = 0; i < tabApiKeys.length; i++) {
      // allow create user if there is no structure in structureInTab and apiKey is in tabApiKeys and tabApiKeysByStructure
      if (key === tabApiKeys[i] && structuresInTab.length === 0) {
        isAllowed = true;
      }
      // check if the structure gave in curl request is in apiKey tab inside tabApiKeysByStructure
      if (key === tabApiKeys[i] && key === apiKey) {
        // eslint-disable-next-line no-loop-func
        structuresInTab.forEach((element) => {
          if (element === structureObject._id) {
            isAllowed = true;
          }
        });
      }
    }
  }
  return isAllowed;
};

export const isMatchingStructureWithParent = (structure, apiKey, tabApiKeys, tabApiKeysByStructure) => {
  const structureParent = Structures.findOne({ _id: structure });

  let isMatchingWithParent = false;

  if (structureParent.parentId) {
    isMatchingWithParent = isMatchingStructureWithParent(
      structureParent.parentId,
      apiKey,
      tabApiKeys,
      tabApiKeysByStructure,
    );
  } else {
    isMatchingWithParent = findStructureAllowed(structureParent, apiKey, tabApiKeys, tabApiKeysByStructure);
  }
  return isMatchingWithParent;
};

export const searchMatchingStructure = (structureObject, apiKey, tabApiKeys, tabApiKeysByStructure) => {
  let isMatchingWithParent = false;

  let result = findStructureAllowed(structureObject, apiKey, tabApiKeys, tabApiKeysByStructure);

  if (!result) {
    if (structureObject.parentId) {
      isMatchingWithParent = isMatchingStructureWithParent(
        structureObject.parentId,
        apiKey,
        tabApiKeys,
        tabApiKeysByStructure,
      );
    }
    if (isMatchingWithParent) {
      result = true;
    }
  }
  return result;
};

export const searchRootStructure = (pathGiven) => {
  let structureToReturn;
  const structureParentWithName = Structures.find({
    name: pathGiven[0],
    $or: [{ parentId: { $eq: null } }, { parentId: { $eq: '' } }],
  }).fetch();

  if (structureParentWithName) {
    if (structureParentWithName.length) {
      structureToReturn = structureParentWithName;
    } else {
      throw new Meteor.Error(
        `${pathGiven[0]} isn't the root structure of ${pathGiven[pathGiven.length - 1]}`,
        `Error encountered while creating user whith structure << ${pathGiven[pathGiven.length - 1]} >>`,
      );
    }
  }
  return structureToReturn;
};

export const checkPathOnChildren = (structureParent, pathGiven) => {
  let structureToReturn = structureParent;

  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < pathGiven.length; i++) {
    const structureChild = Structures.find({ name: pathGiven[i], parentId: structureToReturn._id }).fetch();
    const structureChildToTest = structureChild.pop();

    if (structureChildToTest) {
      structureToReturn = structureChildToTest;
    } else {
      break;
    }
  }
  return structureToReturn;
};

if (Meteor.isServer) {
  Accounts.onCreateUser((options, user) => {
    // pass the structure name in the options
    const newUser = { ...user };
    let email = user.emails && user.emails.length > 0 ? user.emails[0].address : null;

    if (user.services && user.services.keycloak) {
      logServer(
        `USERS - API - CREATE - Creating new user after Keycloak authentication :
         Keycloak id: ${user.services.keycloak.id}, email: ${user.services.keycloak.email} `,
        levels.VERBOSE,
        scopes.SYSTEM,
      );

      email = user.services.keycloak.email;
      // Check if user has enough informations for account creation in keycloak data
      const kcData = user.services.keycloak;
      const mandatoryFields = ['preferred_username', 'email', 'family_name', 'given_name'];
      if (mandatoryFields.some((userField) => !kcData[userField])) {
        logServer(
          'USERS - API - METEOR ERROR - onCreateUser - Missing informations in keycloak data',
          levels.ERROR,
          scopes.SYSTEM,
          { data: kcData },
        );
        warnAdministrators(kcData);
        throw new Meteor.Error('api.users.onCreateUser.missingData', 'Missing Keycloak Data');
      }
    }

    const structure = findStructureByEmail(email);

    if (structure) {
      // If we have a structure, assign it to user and make them directly active
      newUser.structure = structure._id;
      newUser.isActive = true;
    }

    newUser.emails = [{ address: email, verified: true }];

    if (options.firstName) newUser.firstName = options.firstName;
    if (options.lastName) newUser.lastName = options.lastName;
    if (options.structure) newUser.structure = options.structure;
    if (options.profile) newUser.profile = options.profile;
    if (options.primaryEmail) newUser.primaryEmail = options.primaryEmail;

    return newUser;
  });

  Accounts.setAdditionalFindUserOnExternalLogin(({ serviceName, serviceData }) => {
    if (serviceName === 'keycloak') {
      const user = Accounts.findUserByUsername(serviceData.preferred_username);
      if (user) return user;
    }
    return undefined;
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
  lastGlobalInfoReadDate: 1,
  betaServices: 1,
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
