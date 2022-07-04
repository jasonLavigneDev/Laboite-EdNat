import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { isActive } from '../../utils';
import { notificationsTabType } from '../enums';
import Notifications from '../notifications';

Meteor.publish('notifications.self', function notificationsForConnectedUser() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Notifications.find(
    { userId: this.userId },
    { fields: Notifications.publicFields, sort: { createdAt: 1 }, limit: 1000 },
  );
});

Meteor.publish('notifications.self.tabbed', function notificationsTabbedForConnectedUser({ types }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  Counts.publish(
    this,
    'notifications.self.tabbed.infos',
    Notifications.find({ userId: this.userId, read: false, type: { $in: notificationsTabType[1] } }),
  );
  Counts.publish(
    this,
    'notifications.self.tabbed.messages',
    Notifications.find({ userId: this.userId, read: false, type: { $in: notificationsTabType[0] } }),
  );
  return Notifications.find(
    { userId: this.userId, type: { $in: types } },
    { fields: Notifications.publicFields, sort: { createdAt: 1 }, limit: 1000 },
  );
});

Meteor.publish('notifications.self.counter', function notificationsCounterForConnectedUser() {
  Counts.publish(
    this,
    'notifications.self.counter',
    Notifications.find({ userId: this.userId, read: false }, { sort: { createdAt: 1 }, limit: 1000 }),
  );
});
