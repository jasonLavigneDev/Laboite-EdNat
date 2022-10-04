import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { isActive } from '../../utils';
import { createGroupNotification } from './notifsutils';

export const createNotificationForGroup = new ValidatedMethod({
  name: 'notifications.createNotificationForGroup',
  validate: new SimpleSchema({
    data: Object,
    'data.groupId': String,
    'data.title': String,
    'data.content': String,
  }).validator({ clean: true }),

  run({ data }) {
    const authorized =
      isActive(this.userId) &&
      (Roles.userIsInRole(this.userId, 'admin', data.groupId) ||
        Roles.userIsInRole(this.userId, 'animator', data.groupId));
    if (!authorized) {
      throw new Meteor.Error('api.notifications.createNotification.notPermitted', i18n.__('api.users.adminNeeded'));
    }

    createGroupNotification(this.userId, data.groupId, data.title, data.content);
  },
});
