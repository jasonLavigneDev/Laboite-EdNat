import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import { getLabel } from '../utils';
import checkDomain from '../domains';
import logServer from '../logging';
import { getRandomNCloudURL } from '../nextcloud/methods';
import { generateDefaultPersonalSpace } from '../personalspaces/methods';
import PersonalSpaces from '../personalspaces/personalspaces';
import AsamExtensions from '../asamextensions/asamextensions';
import Structures from '../structures/structures';
import Groups from '../groups/groups';
// eslint-disable-next-line import/no-cycle
import { setMemberOf } from './server/methods';

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
  // server side login hook
  Accounts.onLogin((details) => {
    const loginDate = new Date();
    if (details.type === 'keycloak') {
      // update user informations from existing data and keycloak service data
      const updateInfos = {
        ...details.user,
        lastLogin: loginDate,
        primaryEmail: details.user.services.keycloak.email,
      };
      delete updateInfos.services;
      delete updateInfos.profile;
      if (details.user.services.keycloak.given_name) {
        updateInfos.firstName = details.user.services.keycloak.given_name;
      }
      if (details.user.services.keycloak.family_name) {
        updateInfos.lastName = details.user.services.keycloak.family_name;
      }
      if (
        details.user.services.keycloak.preferred_username &&
        details.user.services.keycloak.preferred_username !== details.user.username
      ) {
        // use preferred_username as username if defined
        // (should be set as mandatory in keycloak)
        updateInfos.username = details.user.services.keycloak.preferred_username;
      }
      if (details.user.isActive === false) {
        // auto activate user based on email address
        if (
          checkDomain(details.user.services.keycloak.email) ||
          Meteor.settings.keycloak.adminEmails.indexOf(details.user.services.keycloak.email) !== -1
        ) {
          updateInfos.isActive = true;
          updateInfos.isRequest = false;
        } else {
          // user email not whitelisted, request activation by admin
          updateInfos.isRequest = true;
        }
      }
      // make sure that default values are set for this user
      const cleanedInfo = Meteor.users.simpleSchema().clean(updateInfos);
      Meteor.users.update({ _id: details.user._id }, { $set: cleanedInfo });
      // Manage primary email change
      if (details.user.primaryEmail !== details.user.services.keycloak.email) {
        updateInfos.email = details.user.services.keycloak.email;
        Accounts.addEmail(details.user._id, details.user.services.keycloak.email, true);
        if (details.user.primaryEmail !== undefined) {
          Accounts.removeEmail(details.user._id, details.user.primaryEmail);
        }
      }
      // check if user is defined as admin in settings
      if (Meteor.settings.keycloak.adminEmails.indexOf(details.user.services.keycloak.email) !== -1) {
        if (!Roles.userIsInRole(details.user._id, 'admin')) {
          Roles.addUsersToRoles(details.user._id, 'admin');
          updateInfos.admin = true;
          logServer(`${i18n.__('api.users.adminGiven')} : ${details.user.services.keycloak.email}`);
        }
      }
      // signal updates to plugins
      Meteor.call('users.userUpdated', { userId: details.user._id, data: updateInfos }, (err) => {
        if (err) logServer(`error : ${err}`);
      });

      // check if user has a personnal space generated from structure
      const pSpace = PersonalSpaces.findOne({ userId: details.user._id });
      if (details.user.structure && !pSpace) {
        generateDefaultPersonalSpace.call({ userId: details.user._id });
      }

      // add user to group of structure if he / she is not a member of his structure's group
      const userStructure = Structures.findOne({ _id: details.user.structure });
      const userGroupOfStructure =
        userStructure && userStructure?.groupId ? Groups.findOne({ _id: userStructure?.groupId }) : null;

      if (userGroupOfStructure !== null && !userGroupOfStructure.members?.includes(details.user._id)) {
        if (userStructure.groupId) {
          try {
            setMemberOf._execute(
              { userId: details.user._id },
              { userId: details.user._id, groupId: userStructure.groupId },
            );
          } catch (err) {
            logServer(`error : ${err}`);
          }
        }
        const structureAncestors = Structures.find({ _id: { $in: userStructure.ancestorsIds } }).fetch();
        if (structureAncestors) {
          structureAncestors.forEach((struct) => {
            if (struct.groupId) {
              const group = Groups.findOne({ _id: struct.groupId });
              if (group) {
                try {
                  setMemberOf._execute(
                    { userId: details.user._id },
                    { userId: details.user._id, groupId: group.groupId },
                  );
                } catch (err) {
                  logServer(`error : ${err}`);
                }
              }
            }
          });
        }
      } else if (userGroupOfStructure === null) {
        logServer(`There is no group attached to structure !!!`);
      }
    } else {
      Meteor.users.update({ _id: details.user._id }, { $set: { lastLogin: loginDate } });
    }
  });

  Meteor.users.after.update(
    function afterUpdateUser(userId, userDocument) {
      const previousStructure = this.previous.structure;
      const isAdvancedPersonalPage = this.previous.advancedPersonalPage;
      if (
        previousStructure !== userDocument.structure ||
        (isAdvancedPersonalPage && !userDocument.advancedPersonalPage)
      ) {
        generateDefaultPersonalSpace.call({ userId: userDocument._id });
      }
    },
    { fetchPrevious: true },
  );
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
