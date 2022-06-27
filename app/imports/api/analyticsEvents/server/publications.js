import { Meteor } from 'meteor/meteor';
import { UserStatus } from 'meteor/mizzao:user-status';
import { Counts } from 'meteor/tmeasday:publish-counts';
import Structures from '../../structures/structures';
// import AnalyticsEvents from '../analyticsEvents';

// publish all categories
Meteor.publish('analytics.connections.counts', function analyticsAll() {
  Counts.publish(
    this,
    'analytics.connections.counts.logged',
    UserStatus.connections.find({ userId: { $exists: true } }),
  );
  Counts.publish(
    this,
    'analytics.connections.counts.notLogged',
    UserStatus.connections.find({ userId: { $exists: false } }),
  );
  Counts.publish(this, 'analytics.connections.counts.idle', Meteor.users.find({ status: { idle: true } }));
  Counts.publish(this, 'analytics.connections.counts.idle', Meteor.users.find({ status: { idle: false } }));

  const structuresWithLoggedUsers = [];

  Structures.find()
    .fetch()
    .forEach(({ _id }) => {
      const users = Meteor.users.find({ structure: _id, $or: [{ 'status.online': true }, { 'status.idle': true }] });

      if (users.count() !== 0) {
        structuresWithLoggedUsers.push(_id);
        Counts.publish(this, `analytics.connections.counts.structures.${_id}`, users);
      }
    });

  return Structures.find({ _id: { $in: structuresWithLoggedUsers } }, { sort: { name: 1 }, limit: 200 });
});
