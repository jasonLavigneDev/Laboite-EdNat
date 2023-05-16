import i18n from 'meteor/universe:i18n';
// import AppRoles from '../users/users';
import Groups from '../../groups/groups';
import { createNotification } from '../methods';
import { NOTIFICATIONS_TYPES } from '../enums';
import { getGroupName } from '../../../ui/utils/utilsFuncs';

/**
 * Send a notification for role change of user in a group
 * @param currentUser {string} User ID who ask to send notification
 * @param userId {string} User ID to send notification
 * @param groupId {string} Group ID concerned by the role change
 * @param role {string} role type // TODO: check if role in AppRoles ?
 * @param setRole {bool} true = set new role for the group, false = unset role
 */
export function createRoleNotification(currentUser, userId, groupId, role, setRole = true) {
  // TODO: check role in AppRoles ?
  const group = Groups.findOne({ _id: groupId });
  if (group !== undefined) {
    const type = setRole ? NOTIFICATIONS_TYPES.SET_ROLE : NOTIFICATIONS_TYPES.UNSET_ROLE;
    const roleLabel = i18n.__(`api.notifications.labels.roles.${role}`);
    const newNotif = {
      userId,
      title: i18n.__(`api.notifications.${type}NotifTitle`),
      content: i18n.__(`api.notifications.${type}NotifContent`, {
        role: roleLabel,
        group: getGroupName(group),
      }),
      link: `/groups/${group.slug}`,
      type,
    };
    createNotification._execute({ userId: currentUser }, { data: newNotif });
  }
}

/**
 * Send a request notification to admin or animator about a group
 * @param currentUser {string} User ID who ask to send notification
 * @param userId {string} User ID which is candidate for the group
 * @param groupId {string} Group ID concerned
 */
export function createRequestNotification(currentUser, userId, groupId) {
  const user = Meteor.users.findOne(userId);
  const group = Groups.findOne({ _id: groupId }, { fields: Groups.adminFields });
  const usersToSend = [...new Set([...group.admins, ...group.animators])]; // Concats arrays and removes duplicate user ids
  usersToSend.forEach((uid) => {
    const newNotif = {
      userId: uid,
      title: i18n.__('api.notifications.requestNotifTitle'),
      content: i18n.__('api.notifications.requestNotifContent', {
        name: user.username,
        group: getGroupName(group),
      }),
      link: `/admingroups/${groupId}`,
      type: NOTIFICATIONS_TYPES.REQUEST,
    };
    if (currentUser !== uid) {
      createNotification._execute({ userId: currentUser }, { data: newNotif });
    }
  });
}

/**
 * Send a notification to all members/animators/admins of a group
 * @param currentUser {string} User ID who ask to send notification
 * @param groupId {string} Group ID concerned
 * @param title {string} Notification title to be send
 * @param content {string} Notification content to be send
 * @param link {string optionnal} Destination link of notification, default link to group page
 */
export function createGroupNotification(currentUser, groupId, title, content, link = '') {
  const group = Groups.findOne({ _id: groupId }, { fields: Groups.adminFields });
  const usersToSend = [...new Set([...group.admins, ...group.animators, ...group.members])]; // Concats arrays and removes duplicate user ids
  const notifLink = link === '' ? `/groups/${group.slug}` : link;
  usersToSend.forEach((uid) => {
    if (currentUser !== uid) {
      const newNotif = { userId: uid, title, content, link: notifLink, type: NOTIFICATIONS_TYPES.GROUP };
      createNotification._execute({ userId: currentUser }, { data: newNotif });
    }
  });
}

/**
 * Send a notification to all members/animators/admins of an array groups with no duplication
 * @param currentUser {string} User ID who ask to send notification
 * @param groupsId {array} Groups ID concerned
 * @param title {string} Notification title to be send
 * @param content {string} Notification content to be send
 * @param link {string optionnal} Destination link of notification, default link to group page
 */
export function createMultiGroupsNotification(currentUser, groupsId, title, content, link = '') {
  let usersToSend = [];
  groupsId.forEach((gId) => {
    const group = Groups.findOne({ _id: gId }, { fields: Groups.adminFields });
    if (group) {
      usersToSend = [...new Set([...usersToSend, ...group.admins, ...group.animators, ...group.members])]; // Concats arrays and removes duplicate user ids
    }
  });
  const notifLink = link || '';
  usersToSend.forEach((uid) => {
    if (currentUser !== uid) {
      const newNotif = { userId: uid, title, content, link: notifLink, type: NOTIFICATIONS_TYPES.GROUP };
      createNotification._execute({ userId: currentUser }, { data: newNotif });
    }
  });
}

/**
 * Send a notification to a pull of users
 * @param currentUser {string} User ID who ask to send notification
 * @param users {array} Users ID to send notification
 * @param title {string} Notification title to be send
 * @param content {string} Notification content to be send
 * @param link {string} Destination link of notification
 */
export function createMultiUsersNotification(currentUser, users, title, content, link) {
  users.forEach((uid) => {
    const newNotif = { userId: uid, title, content, type: NOTIFICATIONS_TYPES.GROUP, link };
    createNotification._execute({ userId: currentUser }, { data: newNotif });
  });
}
