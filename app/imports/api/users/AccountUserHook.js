import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import checkDomain from '../domains';
import logServer from '../logging';
import PersonalSpaces from '../personalspaces/personalspaces';
import Structures from '../structures/structures';
import Groups from '../groups/groups';
import { setMemberOf } from './server/methods';
import { generateDefaultPersonalSpace } from '../personalspaces/methods';
import { NOTIFICATIONS_TYPES, SCOPE_TYPES } from '../notifications/enums';

if (Meteor.isServer) {
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
          // logServer(`${i18n.__('api.users.adminGiven')} : ${details.user.services.keycloak.email}`);
          logServer(
            `USERS - ACCOUNTSUSERHOOK - ${i18n.__('api.users.adminGiven')} : ${details.user.services.keycloak.email}`,
            NOTIFICATIONS_TYPES.ERROR,
            SCOPE_TYPES.SYSTEM,
            {},
          );
        }
      }
      // signal updates to plugins
      Meteor.call('users.userUpdated', { userId: details.user._id, data: updateInfos }, (err) => {
        if (err) {
          // logServer(`error : ${err}`)
          logServer(`USERS - ACCOUNTSUSERHOOK - error: `, NOTIFICATIONS_TYPES.ERROR, SCOPE_TYPES.SYSTEM, { err });
        }
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
            // logServer(`error : ${err}`);
            logServer(`USERS - ACCOUNTSUSERHOOK - error: `, NOTIFICATIONS_TYPES.ERROR, SCOPE_TYPES.SYSTEM, { err });
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
                  // logServer(`error : ${err}`);
                  logServer(`USERS - ACCOUNTSUSERHOOK - error: `, NOTIFICATIONS_TYPES.ERROR, SCOPE_TYPES.SYSTEM, {
                    err,
                  });
                }
              }
            }
          });
        }
      } else if (userGroupOfStructure === null) {
        // logServer(`There is no group attached to structure !!!`);
        logServer(
          `USERS - ACCOUNTSUSERHOOK - There is no group attached to structure !!!: `,
          NOTIFICATIONS_TYPES.ERROR,
          SCOPE_TYPES.SYSTEM,
          {},
        );
      }
    } else {
      Meteor.users.update({ _id: details.user._id }, { $set: { lastLogin: loginDate } });
    }
  });
}
