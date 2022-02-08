import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { isActive } from '../../utils';
import Bookmarks from '../bookmarks';
import Groups from '../../groups/groups';

Meteor.publish('bookmark.group.all', function bookmarkAll({ groupId }) {
  try {
    new SimpleSchema({
      groupId: {
        type: String,
      },
    }).validate({ groupId });
  } catch (err) {
    return this.ready();
  }

  if (!isActive(this.userId)) {
    return this.ready();
  }
  const { type } = Groups.findOne(groupId);

  // for protected/private groups, publish users only for allowed users
  if (type !== 0 && !Roles.userIsInRole(this.userId, ['admin', 'animator', 'member'], groupId)) {
    return this.ready();
  }

  return Bookmarks.find({ groupId }, { sort: { name: 1 } });
});
