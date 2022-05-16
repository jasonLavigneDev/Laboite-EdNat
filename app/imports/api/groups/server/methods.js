import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import { isActive, getLabel } from '../../utils';
import Groups from '../groups';
import { favGroup } from '../methods';

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
      throw new Meteor.Error('api.groups.addGroupMemberToGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // check if current user has admin rights on group (or global admin)
    const authorized =
      (isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId)) ||
      (this.userId === group.owner && this.userId === group2.owner);
    if (!authorized) {
      throw new Meteor.Error('api.groups.addGroupMemberToGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }

    const usersGroup = group2.members;

    let nb = 0;
    let i;
    for (i = 0; i < usersGroup.length; i += 1) {
      // add role to user collection
      if (!Roles.userIsInRole(usersGroup[i], 'member', groupId)) {
        Roles.addUsersToRoles(usersGroup[i], 'member', groupId);
        // remove candidate Role if present
        if (Roles.userIsInRole(usersGroup[i], 'candidate', groupId)) {
          Roles.removeUsersFromRoles(usersGroup[i], 'candidate', groupId);
        }
        // store info in group collection
        if (group.members.indexOf(usersGroup[i]) === -1) {
          Groups.update(groupId, {
            $push: { members: usersGroup[i] },
            $pull: { candidates: usersGroup[i] },
          });
        }
        // update user personalSpace
        favGroup._execute({ userId: usersGroup[nb] }, { groupId });
        nb += 1;
      }
    }
    return nb;
  },
});
