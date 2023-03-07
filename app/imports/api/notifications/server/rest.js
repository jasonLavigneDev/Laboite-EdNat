import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import Notifications from '../notifications';
import Groups from '../../groups/groups';
import { addExpiration } from '../methods';
import logServer, { levels, scopes } from '../../logging';
import { createGroupNotification, createMultiGroupsNotification } from './notifsutils';

// export async function getNotifications(req, content) {
//   let query = {};
//   if (req.parameters.userid) query = { userId: req.parameters.userid };
//   return Notifications.find(query).fetch();
// }

export default async function addNotification(req, content) {
  // sample use:
  // curl -X  POST -H "X-API-KEY: 849b7648-14b8-4154-9ef2-8d1dc4c2b7e9" \
  //      -H "Content-Type: application/json" \
  //      -d '{"userId":"eZRRKbaTDty4Xk4kX", "title":"test", "content":"test notif par API", "type":"info"}' \
  //      http://localhost:3000/api/notifications
  // userId key can be replaced by email or username key
  // sample use for single group:
  // curl -X  POST -H "X-API-KEY: 849b7648-14b8-4154-9ef2-8d1dc4c2b7e9" \
  //      -H "Content-Type: application/json" \
  //      -d '{"groupId":"smbjvtgABqvRtFg4S", "title":"test", "content":"test single group notif par API"}' \
  //      http://localhost:3000/api/notifications
  // sample use for multi groups:
  // curl -X  POST -H "X-API-KEY: 849b7648-14b8-4154-9ef2-8d1dc4c2b7e9" \
  //      -H "Content-Type: application/json" \
  //      -d '{"groupsId":["smbjvtgABqvRtFg4S","eZRRKbaTDty4Xk4kX"], "title":"test", "content":"test multi groups notif par API"}' \
  //      http://localhost:3000/api/notifications
  if ('userId' in content) {
    // Single user notification
    // find user by _id, username or email
    const userData = addExpiration(content);
    let user;
    if (content.email) {
      user = Accounts.findUserByEmail(content.email);
      delete userData.email;
      if (user) userData.userId = user._id;
    } else if (content.username) {
      user = Accounts.findUserByUsername(content.username);
      delete userData.username;
      if (user) userData.userId = user._id;
    } else if (content.userId) {
      user = Meteor.users.findOne(userData.userId);
    }
    // check that user exists
    if (user === undefined) {
      throw new Meteor.Error('restapi.notifications.addNotifications.unknownUser', i18n.__('api.users.unknownUser'));
    }

    logServer(
      `NOTIFICATION REST - METHOD - INSERT - addNotification - user data: ${JSON.stringify(userData)}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    return Notifications.insert(userData);
  }
  if ('groupId' in content) {
    // Group notification
    const group = Groups.findOne({ _id: content.groupId }, { fields: Groups.adminFields });
    if (!group) {
      throw new Meteor.Error('restapi.notifications.addNotifications.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    createGroupNotification({}, content.groupId, content.title, content.content, content.link || '');
    return `Group Notification for ${group.name} sent by API`;
  }
  if ('groupsId' in content) {
    createMultiGroupsNotification({}, content.groupsId, content.title, content.content, content.link || '');
    return `Multi Group Notification sent by API`;
  }
  throw new Meteor.Error(
    'restapi.notifications.addNotifications.dataWithoutuserIdNorGroupId',
    'Notification sent by API with neither userId nor groupId',
  );
}
