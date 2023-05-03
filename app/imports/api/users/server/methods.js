import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import i18n from 'meteor/universe:i18n';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import { isActive, getLabel, validateString } from '../../utils';
import Groups from '../../groups/groups';
// initialize Meteor.users customizations
import AppRoles from '../users';

import { favGroup, unfavGroup } from '../../groups/methods';
import PersonalSpaces from '../../personalspaces/personalspaces';
import { createRoleNotification, createRequestNotification } from '../../notifications/server/notifsutils';
import logServer, { levels, scopes } from '../../logging';

import { getRandomNCloudURL } from '../../nextcloud/methods';
import Structures from '../../structures/structures';
import Nextcloud from '../../nextcloud/nextcloud';
import EventsAgenda from '../../eventsAgenda/eventsAgenda';
import {
  hasAdminRightOnStructure,
  hasRightToAcceptAwaitingStructure,
  hasRightToSetStructureDirectly,
} from '../../structures/utils';

if (Meteor.settings.private) {
  const { whiteDomains } = Meteor.settings.private;
  if (!!whiteDomains && whiteDomains.length > 0) {
    // logServer(i18n.__('api.users.logWhiteDomains', { domains: JSON.stringify(whiteDomains) }));
    logServer(
      `USERS - METHODS - ${i18n.__('api.users.logWhiteDomains', { domains: JSON.stringify(whiteDomains) })}`,
      levels.INFO,
      scopes.SYSTEM,
      {},
    );
  }
}

const validateSchema = {
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.users.labels.id') },
  groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  username: { type: String, min: 1, label: getLabel('api.users.labels.username') },
};
// users.findUsers: Returns users using pagination
//   filter: string to search for in username/firstname/lastname/emails (case insensitive search)
//   page: number of the page requested
//   pageSize: number of entries per page
//   sortColumn/sortOrder: sort entries on a specific field with given order (1/-1)
//   exclude: specify a groupId and role (users in this role for this group will be excluded)
export const findUsers = new ValidatedMethod({
  name: 'users.findUsers',
  validate: new SimpleSchema({
    page: {
      type: SimpleSchema.Integer,
      min: 1,
      defaultValue: 1,
      optional: true,
      label: getLabel('api.methods.labels.page'),
    },
    pageSize: {
      type: SimpleSchema.Integer,
      min: 1,
      defaultValue: 10,
      optional: true,
      label: getLabel('api.methods.labels.pageSize'),
    },
    filter: {
      type: String,
      defaultValue: '',
      optional: true,
      label: getLabel('api.methods.labels.filter'),
    },
    sortColumn: {
      type: String,
      allowedValues: ['_id', ...Meteor.users.schema.objectKeys()],
      defaultValue: 'username',
      optional: true,
      label: getLabel('api.methods.labels.sortColumn'),
    },
    sortOrder: {
      type: SimpleSchema.Integer,
      allowedValues: [1, -1],
      defaultValue: 1,
      optional: true,
      label: getLabel('api.methods.labels.sortOrder'),
    },
    exclude: {
      type: Object,
      optional: true,
    },
    'exclude.groupId': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.methods.labels.excludeGroupId'),
    },
    'exclude.role': {
      type: String,
      allowedValues: AppRoles,
      label: getLabel('api.methods.labels.excludeRole'),
    },
  }).validator({ clean: true }),
  run({ page, pageSize, filter, sortColumn, sortOrder, exclude }) {
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    // calculate number of entries to skip
    const skip = (page - 1) * pageSize;
    let query = {};
    if (filter && filter.length > 0) {
      const emails = {
        $elemMatch: {
          address: { $regex: `.*${filter}.*`, $options: 'i' },
        },
      };
      query.$or = [
        { emails },
        {
          username: { $regex: `.*${filter}.*`, $options: 'i' },
        },
        {
          lastName: { $regex: `.*${filter}.*`, $options: 'i' },
        },
        {
          firstName: { $regex: `.*${filter}.*`, $options: 'i' },
        },
      ];
    }
    if (exclude) {
      const usersField = `${exclude.role}s`;
      const group = Groups.findOne(exclude.groupId);
      if (group && group[usersField].length > 0) {
        if (Object.keys(query).length > 0) {
          query = { $and: [{ _id: { $nin: group[usersField] } }, query] };
        } else {
          query = { _id: { $nin: group[usersField] } };
        }
      }
    }
    const sort = {};
    sort[sortColumn] = sortOrder;
    let data;
    let totalCount;
    try {
      totalCount = Meteor.users.find(query).count();
      data = Meteor.users
        .find(query, {
          fields: isAdmin ? Meteor.users.adminFields : Meteor.users.publicFields,
          limit: pageSize,
          skip,
          sort,
        })
        .fetch();
    } catch {
      totalCount = 0;
      data = [];
    }
    return { data, page, totalCount };
  },
});

export const removeUser = new ValidatedMethod({
  name: 'users.removeUser',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),

  run({ userId }) {
    // check if current user has global admin rights or self removal
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || userId === this.userId);
    if (!authorized) {
      throw new Meteor.Error('api.users.removeUser.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.removeUser.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // delete role assignements and remove from groups
    const groups = Roles.getScopesForUser(userId);
    groups.forEach((groupId) => {
      logServer(
        `USERS - METHODS - UPDATE - removeUser (group update) - groupId: ${groupId} / userID: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(
        { _id: groupId },
        {
          $pull: {
            admins: userId,
            members: userId,
            animators: userId,
            candidates: userId,
          },
        },
      );
    });
    logServer(`USERS - METHODS - REMOVE - removeUser (meteor role) - userId: ${userId}`, levels.INFO, scopes.SYSTEM);
    Meteor.roleAssignment.remove({ 'user._id': userId });
    logServer(`USERS - METHODS - REMOVE - removeUser (personal space) - userId: ${userId}`, levels.INFO, scopes.SYSTEM);
    PersonalSpaces.remove({ userId });

    const element = Nextcloud.findOne({ url: user.nclocator });

    if (element !== undefined) {
      element.count -= 1;
      Nextcloud.update({ url: user.nclocator }, { $set: { count: element.count } });
    }
    logServer(`USERS - METHODS - REMOVE - removeUser (meteor) - userId: ${userId}`, levels.INFO, scopes.SYSTEM);
    Meteor.users.remove({ _id: userId });
  },
});

export const unsetMemberOf = new ValidatedMethod({
  name: 'users.unsetMemberOf',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    groupId: validateSchema.groupId,
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has sufficient rights on group (or self remove)
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetMemberOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetMemberOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    if (group.members.indexOf(userId) === -1) {
      throw new Meteor.Error('api.users.unsetMemberOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.removeUsersFromRoles(userId, 'member', groupId);
    // update info in group collection
    if (group.members.indexOf(userId) !== -1) {
      logServer(
        `USERS - METHODS - UPDATE - unsetMemberOf - groupId: ${groupId} members: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(groupId, {
        $pull: { members: userId },
      });
    }
    // if user has no longer roles, remove group from personalspace
    if (!Roles.userIsInRole(userId, ['animator', 'admin', 'candidate'], groupId)) {
      unfavGroup._execute({ userId }, { groupId });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'member', false);
  },
});

export const unsetAdminOf = new ValidatedMethod({
  name: 'users.unsetAdminOf',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    groupId: validateSchema.groupId,
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdminOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetAdminOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    if (group.admins.indexOf(userId) === -1) {
      throw new Meteor.Error('api.users.unsetAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'admin', groupId);
    // update info in group collection
    if (group.admins.indexOf(userId) !== -1) {
      logServer(
        `USERS - METHODS - UPDATE - unsetMemberOf - groupId: ${groupId} admins: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(groupId, { $pull: { admins: userId } });
    }
    // if user has no longer roles, remove group from personalspace
    if (!Roles.userIsInRole(userId, ['animator', 'member', 'candidate'], groupId)) {
      unfavGroup._execute({ userId }, { groupId });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'admin', false);
  },
});

export function RemoveAllRolesFromGroup(user, group) {
  const roles = ['admin', 'animator', 'member', 'candidate'];
  const rolesOfUser = roles.filter((role) => group[`${role}s`].includes(user._id));

  Roles.removeUsersFromRoles(user._id, roles, group._id);

  if (rolesOfUser.length > 0) {
    logServer(`USERS - METHODS - UPDATE - RemoveAllRolesFromGroup - groupId: ${group._id}`, levels.INFO, scopes.SYSTEM);
    Groups.update(group._id, {
      $pull: rolesOfUser.reduce((mod, role) => ({ ...mod, [`${role}s`]: user._id }), {}),
    });
  }
}

export function RemoveUserFromGroupsOfOldStructure(user) {
  if (user.structure) {
    const oldStructure = Structures.findOne({ _id: user.structure });
    if (oldStructure) {
      const ancestors = Structures.find({ _id: { $in: oldStructure.ancestorsIds } }).fetch();
      if (oldStructure.groupId) {
        const group = Groups.findOne({ _id: oldStructure.groupId });
        if (group) {
          RemoveAllRolesFromGroup(user, group);
          unfavGroup._execute({ userId: user._id }, { groupId: oldStructure.groupId });
        }
      }
      if (ancestors) {
        ancestors.forEach((st) => {
          if (st.groupId) {
            const gr = Groups.findOne({ _id: st.groupId });
            if (gr) {
              RemoveAllRolesFromGroup(user, gr);
              unfavGroup._execute({ userId: user._id }, { groupId: st.groupId });
            }
          }
        });
      }
    }
  }
}

export const removeUserFromStructure = new ValidatedMethod({
  name: 'users.removeUserFromStructure',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),

  run({ userId }) {
    const user = Meteor.users.findOne({ _id: userId });
    // check if current user has structure admin rights or self removal
    const authorized =
      isActive(this.userId) &&
      (hasAdminRightOnStructure({ userId: this.userId, structureId: user.structure }) || userId === this.userId);
    if (!authorized) {
      throw new Meteor.Error('api.users.removeUserFromStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // check user existence
    if (user === undefined) {
      throw new Meteor.Error('api.users.removeUserFromStructure.unknownUser', i18n.__('api.users.unknownUser'));
    }
    if (Roles.userIsInRole(userId, 'adminStructure', user.structure)) {
      Roles.removeUsersFromRoles(userId, 'adminStructure', user.structure);
    }
    RemoveUserFromGroupsOfOldStructure(user);
    logServer(
      `USERS - METHODS - UPDATE - removeUserFromStructure (meteor) - userId: ${userId}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    Meteor.users.update({ _id: userId }, { $set: { structure: null } });
  },
});

export const checkUsername = new ValidatedMethod({
  name: 'users.checkUsername',
  validate: new SimpleSchema({
    username: validateSchema.username,
  }).validator(),

  run({ username }) {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.checkUsername.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    // return false if another user as an email or username matching username
    let user = Accounts.findUserByUsername(username, { fields: { _id: 1 } });
    if (user && user._id !== this.userId) return false;
    user = Accounts.findUserByEmail(username, { fields: { _id: 1 } });
    if (user && user._id !== this.userId) return false;
    return true;
  },
});

export const setAdminOf = new ValidatedMethod({
  name: 'users.setAdminOf',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    groupId: validateSchema.groupId,
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdminOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdminOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin', groupId);
    // store info in group collection
    if (group.admins.indexOf(userId) === -1) {
      logServer(
        `USERS - METHODS - UPDATE - setAdminOf (groups) - groupId: ${groupId} / admins: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(groupId, { $push: { admins: userId } });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'admin', true);
  },
});

export const setAnimatorOf = new ValidatedMethod({
  name: 'users.setAnimatorOf',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    groupId: validateSchema.groupId,
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has admin rights on group (or global admin)
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!authorized) {
      throw new Meteor.Error('api.users.setAnimatorOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setAnimatorOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAnimatorOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'animator', groupId);
    // store info in group collection
    if (group.animators.indexOf(userId) === -1) {
      logServer(
        `USERS - METHODS - UPDATE - setAnimatorOf (groups) - groupId: ${groupId} / animators: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(groupId, { $push: { animators: userId } });
    }
    // update user personalSpace
    favGroup._execute({ userId }, { groupId });
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'animator', true);
  },
});

export const unsetAnimatorOf = new ValidatedMethod({
  name: 'users.unsetAnimatorOf',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    groupId: validateSchema.groupId,
  }).validator(),

  run({ userId, groupId }) {
    // check if current user has admin rights on group (or global admin) or self removal
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, 'admin', groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    if (group.animators.indexOf(userId) === -1) {
      throw new Meteor.Error('api.users.unsetAnimatorOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'animator', groupId);
    // update info in group collection
    if (group.animators.indexOf(userId) !== -1) {
      logServer(
        `USERS - METHODS - UPDATE - unsetAnimatorOf (groups) - groupId: ${groupId} / animators: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(groupId, { $pull: { animators: userId } });
    }
    // if user has no longer roles, remove group from personalspace
    if (!Roles.userIsInRole(userId, ['member', 'admin', 'candidate'], groupId)) {
      unfavGroup._execute({ userId }, { groupId });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'animator', false);
  },
});

export const setMemberOf = new ValidatedMethod({
  name: 'users.setMemberOf',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    groupId: validateSchema.groupId,
  }).validator(),

  run({ userId, groupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setMemberOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setMemberOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has sufficient rights on group
    let authorized = false;
    if (group.type === 0 || group.type === 15) {
      // open group, users cand set themselve as member
      authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    } else {
      authorized = Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    }
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.setMemberOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'member', groupId);
    // remove candidate Role if present
    if (Roles.userIsInRole(userId, 'candidate', groupId)) {
      Roles.removeUsersFromRoles(userId, 'candidate', groupId);
    }
    // store info in group collection
    if (group.members.indexOf(userId) === -1) {
      logServer(
        `USERS - METHODS - UPDATE - setMemberOf (groups) - groupId: ${groupId} / members: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(groupId, {
        $push: { members: userId },
        $pull: { candidates: userId },
      });
    }
    // update user personalSpace
    favGroup._execute({ userId }, { groupId });

    const insertUser = { email: user.emails[0].address, _id: userId, groupId, status: 1 };

    logServer(
      `USERS - METHODS - UPDATE MANY - setMemberOf (event) - groupId: ${groupId} / participants: ${JSON.stringify(
        insertUser,
      )}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    // update Events
    EventsAgenda.rawCollection().updateMany(
      { groups: { $elemMatch: { _id: groupId } } },
      { $push: { participants: insertUser } },
    );

    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'member', true);
  },
});

export const setCandidateOf = new ValidatedMethod({
  name: 'users.setCandidateOf',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    groupId: validateSchema.groupId,
  }).validator(),

  run({ userId, groupId }) {
    // allow to set candidate for self or as admin/animator
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.setCandidateOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.setCandidateOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // only manage candidates on moderated groups
    if (group.type !== 5) {
      throw new Meteor.Error('api.users.setCandidateOf.moderatedGroupOnly', i18n.__('api.groups.moderatedGroupOnly'));
    }
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setCandidateOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'candidate', groupId);
    // store info in group collection
    if (group.candidates.indexOf(userId) === -1) {
      logServer(
        `USERS - METHODS - UPDATE - setCandidateOf (groups) - groupId: ${groupId} candidats: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(groupId, {
        $push: { candidates: userId },
      });
    }
    // update user personalSpace
    favGroup._execute({ userId }, { groupId });
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'candidate', true);
    // Notify admins
    if (this.userId !== userId) createRequestNotification(this.userId, userId, groupId);
  },
});

export const unsetCandidateOf = new ValidatedMethod({
  name: 'users.unsetCandidateOf',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    groupId: validateSchema.groupId,
  }).validator(),

  run({ userId, groupId }) {
    // allow to unset candidate for self or as admin/animator
    const authorized = userId === this.userId || Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    if (!isActive(this.userId) || !authorized) {
      throw new Meteor.Error('api.users.unsetCandidateOf.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      throw new Meteor.Error('api.users.unsetCandidateOf.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    if (group.candidates.indexOf(userId) === -1) {
      throw new Meteor.Error('api.users.unsetCandidateOf.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'candidate', groupId);
    // remove info from group collection
    if (group.candidates.indexOf(userId) !== -1) {
      logServer(
        `USERS - METHODS - UPDATE - unsetCandidateOf (groups) - groupId: ${groupId} candidats: ${userId}`,
        levels.INFO,
        scopes.SYSTEM,
      );
      Groups.update(groupId, {
        $pull: { candidates: userId },
      });
    }
    // if user has no longer roles, remove group from personalspace
    if (!Roles.userIsInRole(userId, ['animator', 'member', 'admin'], groupId)) {
      unfavGroup._execute({ userId }, { groupId });
    }
    // Notify user
    if (this.userId !== userId) createRoleNotification(this.userId, userId, groupId, 'candidate', false);
  },
});

export function AddUserToGroupOfStructure(currentUserId, user, structure) {
  if (structure.groupId) {
    setMemberOf._execute({ userId: currentUserId }, { userId: user._id, groupId: structure.groupId });
  }

  const ancestors = Structures.find({ _id: { $in: structure.ancestorsIds } }).fetch();
  if (ancestors) {
    ancestors.forEach((st) => {
      if (st.groupId) {
        const gr = Groups.findOne({ _id: st.groupId });
        if (gr) {
          setMemberOf._execute({ userId: currentUserId }, { userId: user._id, groupId: gr._id });
        }
      }
    });
  }
}

export const acceptAwaitingStructure = new ValidatedMethod({
  name: 'users.acceptAwaitingStructure',
  validate: new SimpleSchema({
    targetUserId: validateSchema.userId,
  }).validator(),
  run({ targetUserId }) {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.acceptAwaitingStructure.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }

    const targetUser = Meteor.users.findOne({ _id: targetUserId });
    const { awaitingStructure } = targetUser;
    const structure = Structures.findOne({ _id: awaitingStructure });

    if (structure === undefined) {
      throw new Meteor.Error(
        'api.users.acceptAwaitingStructure.unknownStructure',
        i18n.__('api.structures.unknownStructure'),
      );
    }
    // only direct admin of structure can validate awaiting structure application
    const authorized = hasRightToAcceptAwaitingStructure({
      userId: this.userId,
      awaitingStructureId: awaitingStructure,
    });

    if (!authorized) {
      throw new Meteor.Error('api.users.acceptAwaitingStructure.notPermitted', i18n.__('api.users.notPermitted'));
    }

    RemoveUserFromGroupsOfOldStructure(targetUser);
    logServer(
      `USERS - METHODS - UPDATE - acceptAwaitingStructure (user meteor) - userId: ${targetUserId} 
      / awaitingStructure: ${awaitingStructure}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    Meteor.users.update(
      { _id: targetUserId },
      {
        $set: {
          structure: awaitingStructure,
          awaitingStructure: null,
        },
      },
    );

    AddUserToGroupOfStructure(this.userId, targetUser, structure);
  },
});

export const setStructure = new ValidatedMethod({
  name: 'users.setStructure',
  validate: new SimpleSchema({
    structure: {
      type: SimpleSchema.RegEx.Id,
      /**
       * @deprecated
       * Since we're now using dynamic structures, we do not need to check if it's allowed in the schema
       */
      // allowedValues: getStructureIds,
      label: getLabel('api.users.labels.structure'),
    },
  }).validator(),

  run({ structure }) {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setStructure.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }

    // check if structure exists
    const structureToFind = Structures.findOne({ _id: structure });
    if (!structureToFind) {
      throw new Meteor.Error(`${structure} is not an allowed value`, i18n.__('SimpleSchema.notAllowed', structure));
    }

    const user = Meteor.users.findOne({ _id: this.userId });
    const isAuthorizedToSetStructureDirectly = hasRightToSetStructureDirectly(user._id, structure);
    const isAppAdmin = Roles.userIsInRole(user._id, 'admin');

    // check if user has structure admin role and remove it only if new structure and old structure are different
    if (user.structure !== structure) {
      if (Roles.userIsInRole(this.userId, 'adminStructure', user.structure)) {
        Roles.removeUsersFromRoles(this.userId, 'adminStructure', user.structure);
      }

      if (isAuthorizedToSetStructureDirectly || isAppAdmin) {
        // check group and user existence for old structure
        const oldStruct = Structures.findOne({ _id: user.structure });
        if (oldStruct) {
          if (oldStruct.groupId) {
            const group = Groups.findOne({ _id: oldStruct.groupId });
            if (group !== undefined && group.members.indexOf(user._id) !== -1) {
              RemoveUserFromGroupsOfOldStructure(user);
            }
          }
        }
      }
    } // will throw error if username already taken

    logServer(
      `USERS - METHODS - UPDATE - setStructure (user meteor) - userId: ${this.userId} 
      / awaitingStructure: ${structure} / useer struc: ${user.structure}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    Meteor.users.update(
      { _id: this.userId },
      {
        $set: {
          structure: isAuthorizedToSetStructureDirectly || isAppAdmin ? structure : user.structure,
          awaitingStructure: isAuthorizedToSetStructureDirectly || isAppAdmin ? null : structure,
        },
      },
    );

    if (isAuthorizedToSetStructureDirectly || isAppAdmin) AddUserToGroupOfStructure(this.userId, user, structureToFind);
  },
});

export const setNcloudUrlAll = new ValidatedMethod({
  name: 'users.setNCloudAll',
  validate: new SimpleSchema().validator(),

  run() {
    // check that user is logged in
    if (!this.userId) {
      throw new Meteor.Error('api.users.setNcloudUrlAll.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }

    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setNcloudUrlAll.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    const users = Meteor.users.find({ $or: [{ nclocator: { $exists: false } }, { nclocator: '' }] }).fetch();

    let cpt = 0;

    for (let i = 0; i < users.length; i += 1) {
      users[i].nclocator = getRandomNCloudURL();
      Meteor.users.update({ _id: users[i]._id }, { $set: { nclocator: users[i].nclocator } });
      cpt += 1;
    }

    return cpt;
  },
});

export const setAdmin = new ValidatedMethod({
  name: 'users.setAdmin',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),

  run({ userId }) {
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdmin.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'admin');
  },
});

export const setAdminStructure = new ValidatedMethod({
  name: 'users.setAdminStructure',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdminStructure.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global or structure-scoped admin rights
    const authorized =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin') ||
        hasAdminRightOnStructure({ userId: this.userId, structureId: user.structure }));
    if (!authorized) {
      throw new Meteor.Error('api.users.setAdminStructure.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // add role to user collection
    Roles.addUsersToRoles(userId, 'adminStructure', user.structure);

    // Add admin role of structure group
    const structure = Structures.findOne({ _id: user.structure });
    if (structure) {
      if (structure.groupId) {
        const group = Groups.findOne({ _id: structure.groupId });
        if (group) {
          setAdminOf._execute({ userId: this.userId }, { userId, groupId: group._id });
        }
      }
    }
  },
});

export const setActive = new ValidatedMethod({
  name: 'users.setActive',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),

  run({ userId }) {
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setActive.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setActive.unknownUser', i18n.__('api.users.unknownUser'));
    }
    logServer(`USERS - METHODS - UPDATE - setActive (user meteor) - userId: ${userId}`, levels.INFO, scopes.SYSTEM);
    Meteor.users.update(userId, { $set: { isActive: true, isRequest: false } });
  },
});

export const setArticlesEnable = new ValidatedMethod({
  name: 'users.setArticlesEnable',
  validate: null,

  run() {
    if (!this.userId) {
      throw new Meteor.Error('api.users.toggleAdvancedPersonalPage.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.toggleAdvancedPersonalPage.unknownUser', i18n.__('api.users.unknownUser'));
    }
    const newValue = !(user.articlesEnable || false);
    logServer(
      `USERS - METHODS - UPDATE - setArticlesEnable (user meteor) - userId: ${this.userId} 
      / articlesEnable: ${newValue}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    Meteor.users.update(this.userId, { $set: { articlesEnable: newValue } });
  },
});

export const unsetActive = new ValidatedMethod({
  name: 'users.unsetActive',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),

  run({ userId }) {
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetActive.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetActive.unknownUser', i18n.__('api.users.unknownUser'));
    }
    logServer(`USERS - METHODS - UPDATE - unsetActive (user meteor) - userId: ${userId}`, levels.INFO, scopes.SYSTEM);
    Meteor.users.update(userId, { $set: { isActive: false } });
  },
});

export const unsetAdmin = new ValidatedMethod({
  name: 'users.unsetAdmin',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),

  run({ userId }) {
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdmin.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // check that user is not the only existing admin
    const admins = Roles.getUsersInRole('admin').fetch();
    if (admins.length === 1) {
      throw new Meteor.Error('api.users.unsetAdmin.lastAdmin', i18n.__('api.users.lastAdminError'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.setAdmin.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'admin');
  },
});

export const unsetAdminStructure = new ValidatedMethod({
  name: 'users.unsetAdminStructure',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),

  run({ userId }) {
    // check user existence
    const user = Meteor.users.findOne({ _id: userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.unsetAdminStructure.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // check if current user has global admin rights
    const isStructureAdmin =
      user.structure && hasAdminRightOnStructure({ userId: this.userId, structureId: user.structure });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isStructureAdmin);
    if (!authorized) {
      throw new Meteor.Error('api.users.unsetAdminStructure.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    // remove role from user collection
    Roles.removeUsersFromRoles(userId, 'adminStructure', user.structure);

    // remove admin role of structure group
    const structure = Structures.findOne({ _id: user.structure });
    if (structure) {
      if (structure.groupId) {
        const group = Groups.findOne({ _id: structure.groupId });
        if (group) {
          if (Roles.userIsInRole(this.userId, 'admin', group._id)) {
            unsetAdminOf._execute({ userId: this.userId }, { userId, groupId: group._id });
          }
        }
      }
    }
  },
});

export const setLanguage = new ValidatedMethod({
  name: 'users.setLanguage',
  validate: new SimpleSchema({
    language: { type: String, label: getLabel('api.users.labels.language') },
  }).validator(),

  run({ language }) {
    if (!this.userId) {
      throw new Meteor.Error('api.users.setLanguage.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    validateString(language, true);
    logServer(
      `USERS - METHODS - UPDATE - setLanguage (user meteor) - userId: ${this.userId} / language: ${language}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    Meteor.users.update(this.userId, {
      $set: { language },
    });
  },
});

export const setLogoutType = new ValidatedMethod({
  name: 'users.setLogoutType',
  validate: new SimpleSchema({
    logoutType: { type: String, label: getLabel('api.users.labels.logoutType') },
  }).validator(),

  run({ logoutType }) {
    if (!this.userId) {
      throw new Meteor.Error('api.users.setLogoutType.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    validateString(logoutType, true);
    logServer(
      `USERS - METHODS - UPDATE - setLogoutType (user meteor) - userId: ${this.userId} / logoutType: ${logoutType}`,
      levels.INFO,
      scopes.SYSTEM,
    );
    Meteor.users.update(this.userId, {
      $set: { logoutType },
    });
  },
});

export const setAvatar = new ValidatedMethod({
  name: 'users.setAvatar',
  validate: new SimpleSchema({
    avatar: {
      type: String,
      label: getLabel('api.users.labels.avatar'),
    },
  }).validator(),

  run({ avatar }) {
    if (!this.userId) {
      throw new Meteor.Error('api.users.setAvatar.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    validateString(avatar);
    logServer(
      `USERS - METHODS - UPDATE - setAvatar (user meteor) - userId: ${this.userId} / avatar: ${avatar}`,
      levels.INFO,
      scopes.USER,
    );
    Meteor.users.update(this.userId, {
      $set: { avatar },
    });
  },
});

// method to associate existing account with a Keycloak Id
export const setKeycloakId = new ValidatedMethod({
  name: 'users.setKeycloakId',
  validate: new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
      label: getLabel('api.users.labels.emailAddress'),
    },
    keycloakId: { type: String, label: getLabel('api.methods.labels.keycloakId') },
  }).validator(),

  run({ email, keycloakId }) {
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.setKeycloakId.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    const user = Accounts.findUserByEmail(email);
    if (user) {
      logServer(
        `USERS - METHODS - UPDATE - setKeycloakId (user meteor) - userId: ${user._id} / keycloakId: ${keycloakId}`,
        levels.INFO,
        scopes.USER,
      );
      Meteor.users.update({ _id: user._id }, { $set: { services: { keycloak: { id: keycloakId } } } });
      return user._id;
    }
    throw new Meteor.Error('api.users.setKeycloakId.unknownUser', i18n.__('api.users.unknownUser'));
  },
});

export const findUser = new ValidatedMethod({
  name: 'users.findUser',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
  }).validator(),
  run({ userId }) {
    return Meteor.users.findOne({ _id: userId }, { fields: { firstName: 1, lastName: 1, _id: 1 } });
  },
});

export const userUpdated = new ValidatedMethod({
  name: 'users.userUpdated',
  validate: new SimpleSchema({
    userId: validateSchema.userId,
    data: {
      type: Object,
      optional: true,
      blackbox: true,
    },
  }).validator(),

  run({ userId, data }) {
    // this function is used to provide hooks when user data is updated
    // (currently when logging in with keycloak)
    if (!Meteor.isServer) {
      // this should be run by server side code only
      throw new Meteor.Error('api.users.userUpdated.notPermitted', i18n.__('api.users.notPermitted'));
    }
    return [userId, data];
  },
});

export const setQuota = new ValidatedMethod({
  name: 'users.setQuota',
  validate: new SimpleSchema({
    quota: { type: Number },
    userId: validateSchema.userId,
  }).validator(),

  run({ quota, userId }) {
    // this function is used to provide hooks when user data is updated
    // (currently when logging in with keycloak)
    if (!Meteor.isServer) {
      // this should be run by server side code only
      throw new Meteor.Error('api.users.userUpdated.notPermitted', i18n.__('api.users.notPermitted'));
    }
    logServer(
      `USERS - METHODS - UPDATE - setQuota (user meteor) - userId: ${userId} / groupQuota: ${quota}`,
      levels.INFO,
      scopes.ADMIN,
    );
    Meteor.users.update(
      { _id: userId },
      {
        $set: {
          groupQuota: quota,
        },
      },
    );
  },
});

export const toggleAdvancedPersonalPage = new ValidatedMethod({
  name: 'users.toggleAdvancedPersonalPage',
  validate: null,

  run() {
    if (!this.userId) {
      throw new Meteor.Error('api.users.toggleAdvancedPersonalPage.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.toggleAdvancedPersonalPage.unknownUser', i18n.__('api.users.unknownUser'));
    }
    const newValue = !(user.advancedPersonalPage || false);
    logServer(
      `USERS - METHODS - UPDATE - toggleAdvancedPersonalPage (user meteor) - userId: ${this.userId} 
      / advancedPersonalPage: ${newValue}`,
      levels.INFO,
      scopes.USER,
    );
    Meteor.users.update(this.userId, { $set: { advancedPersonalPage: newValue } });
  },
});

export const getAuthToken = new ValidatedMethod({
  name: 'users.getAuthToken',
  validate: null,
  run() {
    if (!this.userId) {
      throw new Meteor.Error('api.users.getAuthToken.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.getAuthToken.unknownUser', i18n.__('api.users.unknownUser'));
    }
    return user.authToken;
  },
});

export const resetAuthToken = new ValidatedMethod({
  name: 'users.resetAuthToken',
  validate: null,
  run() {
    if (!this.userId) {
      throw new Meteor.Error('api.users.resetAuthToken.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check user existence
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user === undefined) {
      throw new Meteor.Error('api.users.resetAuthToken.unknownUser', i18n.__('api.users.unknownUser'));
    }
    const newToken = Random.secret(150);
    logServer(
      `USERS - METHODS - UPDATE - resetAuthToken (user meteor) - userId: ${user._id} 
      / authToken: ${newToken}`,
      levels.INFO,
      scopes.USER,
    );
    Meteor.users.update({ _id: user._id }, { $set: { authToken: newToken } });
    return newToken;
  },
});

export const hasUserOnRequest = new ValidatedMethod({
  name: 'users.hasUserOnRequest',
  validate: null,
  run() {
    return !!Meteor.users.findOne({ isActive: { $ne: true } });
  },
});

export const hasUserOnAwaitingStructure = new ValidatedMethod({
  name: 'users.hasUserOnAwaitingStructure',
  validate: new SimpleSchema({
    structureId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator({ clean: true }),

  run({ structureId }) {
    return !!Meteor.users.findOne({ awaitingStructure: structureId });
  },
});

// This is a temporary method used to fix badly created users in database
// intended to be called by an admin user from a browser dev console :
//  Meteor.call('users.fixUsers', (err,res) => console.log(res))
//
export const fixUsers = new ValidatedMethod({
  name: 'users.fixUsers',
  validate: null,
  run() {
    if (!this.userId) {
      throw new Meteor.Error('api.users.fixUsers.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check if current user has global admin rights
    const authorized = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin');
    if (!authorized) {
      throw new Meteor.Error('api.users.fixUsers.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    const badUsers = Meteor.users.find({ username: null }).fetch();
    let fixedCount = 0;
    badUsers.forEach((user) => {
      // try to get missing fields from keycloak data
      if (user.services.keycloak) {
        const updateInfos = {
          primaryEmail: user.services.keycloak.email,
        };
        Accounts.addEmail(user._id, user.services.keycloak.email, true);
        if (user.services.keycloak.given_name) {
          updateInfos.firstName = user.services.keycloak.given_name;
        }
        if (user.services.keycloak.family_name) {
          updateInfos.lastName = user.services.keycloak.family_name;
        }
        if (user.services.keycloak.preferred_username) {
          // use preferred_username as username if defined
          // (should be set as mandatory in keycloak)
          updateInfos.username = user.services.keycloak.preferred_username;
        }
        if (!user.nclocator) updateInfos.nclocator = getRandomNCloudURL();
        logServer(
          `USERS - METHODS - UPDATE - fixUsers (user meteor) - userId: ${user._id} 
      / updateInfos: ${updateInfos}`,
          levels.INFO,
          scopes.USER,
        );
        Meteor.users.update({ _id: user._id }, { $set: updateInfos });
        // logServer(`- fixed user ${updateInfos.username} (email:${updateInfos.primaryEmail})`);
        logServer(
          `USERS - METHODS - fixed user ${updateInfos.username} (email:${updateInfos.primaryEmail})`,
          levels.ERROR,
          scopes.SYSTEM,
        );
        fixedCount += 1;
      } else {
        // logServer(`- could not fix user '${user._id}', no keycloak data available`);
        logServer(
          `USERS - METHODS - could not fix user '${user._id}', no keycloak data available`,
          levels.ERROR,
          scopes.SYSTEM,
        );
      }
    });
    return fixedCount;
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    setStructure,
    acceptAwaitingStructure,
    setArticlesEnable,
    setActive,
    removeUser,
    removeUserFromStructure,
    setAdminOf,
    unsetAdminOf,
    setAdminStructure,
    unsetAdminStructure,
    setAnimatorOf,
    unsetAnimatorOf,
    setMemberOf,
    unsetMemberOf,
    setCandidateOf,
    unsetCandidateOf,
    findUsers,
    findUser,
    setLanguage,
    setLogoutType,
    setKeycloakId,
    setAvatar,
    userUpdated,
    toggleAdvancedPersonalPage,
    getAuthToken,
    fixUsers,
    hasUserOnRequest,
    hasUserOnAwaitingStructure,
  ],
  'name',
);

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000,
  );
}
