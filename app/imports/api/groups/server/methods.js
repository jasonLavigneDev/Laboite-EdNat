import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel } from '../../utils';
import Groups from '../groups';
import { favGroup } from '../methods';
import logServer, { levels, scopes } from '../../logging';

export const addGroupMembersToGroup = new ValidatedMethod({
  name: 'groups.addGroupMembersToGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
    otherGroupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ groupId, otherGroupId }) {
    // check group and user existence
    const group = Groups.findOne({ _id: groupId });
    const group2 = Groups.findOne({ _id: otherGroupId });
    if (group === undefined || group2 === undefined) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - addGroupMembersToGroup - ${i18n.__('api.groups.unknownGroup')}`,
        levels.ERROR,
        scopes.USER,
        { groupId, otherGroupId },
      );
      throw new Meteor.Error('api.groups.addGroupMemberToGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized =
      (isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId)) ||
      (this.userId === group.owner && this.userId === group2.owner);
    if (!authorized) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - addGroupMembersToGroup - ${i18n.__('api.groups.adminGroupNeeded')}`,
        levels.ERROR,
        scopes.USER,
        { groupId, otherGroupId },
      );
      throw new Meteor.Error('api.groups.addGroupMemberToGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }

    const usersGroup = group2.members;

    let nb = 0;
    usersGroup.forEach((user) => {
      // add role to user collection
      if (!Roles.userIsInRole(user, 'member', groupId)) {
        Roles.addUsersToRoles(user, 'member', groupId);
        // remove candidate Role if present
        if (Roles.userIsInRole(user, 'candidate', groupId)) {
          Roles.removeUsersFromRoles(user, 'candidate', groupId);
        }
        // store info in group collection
        if (group.members.indexOf(user) === -1) {
          Groups.update(groupId, {
            $push: { members: user },
            $pull: { candidates: user },
          });
        }
        // update user personalSpace
        favGroup._execute({ userId: usersGroup[nb] }, { groupId });
        nb += 1;
      }
    });
    logServer(
      `GROUPS - METHODS - ADD - addGroupMembersToGroup - User ${this.userId} add members to group ${groupId} `,
      levels.VERBOSE,
      scopes.USER,
    );

    return nb;
  },
});
