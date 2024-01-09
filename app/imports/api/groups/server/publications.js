import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import SimpleSchema from 'simpl-schema';

import { checkPaginationParams, isActive, getLabel, accentInsensitive } from '../../utils';
import Groups from '../groups';
import AppRoles from '../../users/users';
import logServer, { levels, scopes } from '../../logging';

import Polls from '../../polls/polls';
import EventsAgenda from '../../eventsAgenda/eventsAgenda';
import Bookmarks from '../../bookmarks/bookmarks';
import Articles from '../../articles/articles';
import Forms from '../../forms/forms';

// publish groups that user is admin/animator of
Meteor.publish('groups.adminof', function groupsAdminOf() {
  if (!isActive(this.userId)) {
    return this.ready();
  }

  // if user has global admin, get all groups
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return Groups.find({}, { fields: Groups.adminFields });
  }

  // otherwise get groups user is admin/animator of
  const roleAssignmentCursor = Meteor.roleAssignment.find(
    {
      'user._id': this.userId,
      'role._id': { $in: ['admin', 'animator'] },
      scope: { $ne: null },
    },
    { sort: { _id: 1 }, limit: 1000 },
  );
  const roleAssignments = roleAssignmentCursor.fetch();

  if (!roleAssignments.length) {
    return this.ready();
  }

  const roleScopes = roleAssignments.map((role) => role.scope);
  const groupsCursor = Groups.find(
    { _id: { $in: roleScopes } },
    { fields: Groups.adminFields, limit: 1000, sort: { _id: 1 } },
  );

  return [roleAssignmentCursor, groupsCursor];
});

// publish groups that user is admin/animator/member of
Meteor.publish('groups.member', function groupsAdminOf() {
  if (!isActive(this.userId)) {
    return this.ready();
  }

  const roleAssignmentCursor = Meteor.roleAssignment.find({
    'user._id': this.userId,
    'role._id': { $in: ['admin', 'animator', 'member'] },
    scope: { $ne: null },
  });
  const roleAssignments = roleAssignmentCursor.fetch();
  const rolesScopes = roleAssignments.map((role) => role.scope);
  const groupsCursor = Groups.find({ _id: { $in: rolesScopes } }, { fields: Groups.adminFields });

  return [roleAssignmentCursor, groupsCursor];
});

FindFromPublication.publish('groups.one.admin', function GroupsOne({ _id }) {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, ['admin', 'animator'], _id)) {
    return this.ready();
  }
  try {
    new SimpleSchema({
      _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ _id });
  } catch (err) {
    logServer(
      `GROUPS - PUBLICATION - ERROR - groups.one.admin,publish groups.one.admin : ${err}`,
      levels.ERROR,
      scopes.SYSTEM,
      {
        _id,
        err,
      },
    );
    this.error(err);
  }
  return Groups.find({ _id }, { fields: Groups.adminFields, sort: { name: 1 }, limit: 1 });
});

// publish one group and all users associated with given role
Meteor.publish('groups.users', function groupDetails({ groupId, role = 'member' }) {
  try {
    new SimpleSchema({
      groupId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
      role: {
        type: String,
        allowedValues: AppRoles,
      },
    }).validate({ groupId, role });
  } catch (err) {
    logServer(
      `GROUPS - PUBLICATION - ERROR - groups.users,publish groups.users : ${err}`,
      levels.ERROR,
      scopes.SYSTEM,
      {
        groupId,
        role: 'member',
        err,
      },
    );
    this.error(err);
  }
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const usersField = `${role}s`;
  const groupsCursor = Groups.find({ _id: groupId }, { fields: { [usersField]: 1 }, limit: 1, sort: { name: 1 } });
  const groups = groupsCursor.fetch();

  if (!groups.length) {
    return this.ready();
  }

  const users = groups[0][usersField];

  const usersCursor = Meteor.users.find(
    { _id: { $in: users } },
    {
      fields: {
        username: 1,
        emails: 1,
        firstName: 1,
        lastName: 1,
      },
      limit: 10000,
      sort: { _id: 1 },
    },
  );

  return [groupsCursor, usersCursor];
});

// build query for all groups
const queryAllGroups = ({ search }) => {
  const regex = new RegExp(accentInsensitive(search), 'i');
  return {
    type: { $nin: [10, 15] },
    $or: [
      {
        name: { $regex: regex },
      },
      {
        description: { $regex: regex },
      },
    ],
  };
};

// build query for groups where user is member of
const queryAllGroupsMemberOf = ({ search, groups }) => {
  const regex = new RegExp(accentInsensitive(search), 'i');
  const fieldsToSearch = ['name', 'type', 'description', 'slug', 'avatar', 'content'];
  const searchQuery = fieldsToSearch.map((field) => ({
    [field]: { $regex: regex },
    _id: { $in: groups },
  }));
  return {
    $or: searchQuery,
  };
};

Meteor.methods({
  'get_groups.memberOf_count': ({ search, userId }) => {
    const groups = Meteor.users.findOne({ _id: userId }).favGroups;

    try {
      const query = queryAllGroupsMemberOf({ search, groups });
      return Groups.find(query, { fields: Groups.publicFields, sort: { name: 1 } }).count();
    } catch (error) {
      logServer(`GROUPS - PUBLICATION - ERROR - get_groups.memberOf_count`, levels.ERROR, scopes.SYSTEM, {
        error,
      });
      return 0;
    }
  },
});

Meteor.methods({
  'get_groups.all_count': ({ search }) => {
    try {
      const query = queryAllGroups({ search });
      return Groups.find(query, { fields: Groups.publicFields, sort: { name: 1 } }).count();
    } catch (error) {
      logServer(`GROUPS - PUBLICATION - ERROR - get_groups.all_count`, levels.ERROR, scopes.SYSTEM, {
        error,
      });
      return 0;
    }
  },
});

// publish all existing groups
FindFromPublication.publish('groups.all', function groupsAll({ page, search, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`GROUPS - PUBLICATION - ERROR - groups.all,publish groups.all : ${err}`, levels.ERROR, scopes.SYSTEM, {
      page,
      itemPerPage,
      search,
      err,
    });
    this.error(err);
  }

  try {
    const query = queryAllGroups({ search });

    return Groups.find(query, {
      fields: Groups.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { name: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});

// publish all existing groups where user is member
FindFromPublication.publish('groups.memberOf', function groupsMemberOf({ page, search, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(
      `GROUPS - PUBLICATION - ERROR - groups.memberOf,publish groups.memberOf : ${err}`,
      levels.ERROR,
      scopes.SYSTEM,
      {
        page,
        itemPerPage,
        search,
        err,
      },
    );
    this.error(err);
  }

  const groups = Meteor.users.findOne({ _id: this.userId }).favGroups;

  try {
    const query = queryAllGroupsMemberOf({ search, groups });

    return Groups.find(query, {
      fields: Groups.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { name: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});

// publish one group based on its slug
FindFromPublication.publish('groups.one', function groupsOne({ slug }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.groups.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(`GROUPS - PUBLICATION - ERROR - groups.one, publish groups.one : ${err}`, levels.ERROR, scopes.SYSTEM, {
      slug,
      err,
    });
    this.error(err);
  }
  return Groups.find(
    { slug },
    {
      fields: Groups.allPublicFields,
      limit: 1,
      sort: { name: -1 },
    },
  );
});

// publish one group and events and pools based on its slug
Meteor.publish('groups.single', function groupSingle({ slug }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.groups.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(
      `GROUPS - PUBLICATION - ERROR - groups.single, publish groups.one : ${err}`,
      levels.ERROR,
      scopes.SYSTEM,
      {
        slug,
        err,
      },
    );
    this.error(err);
  }

  const groupsCursor = Groups.find({ slug }, { fields: Groups.allPublicFields, limit: 1, sort: { name: -1 } });
  const groups = groupsCursor.fetch();

  if (groups.length === 0) {
    return this.ready();
  }

  const groupId = groups[0]._id;
  const projection = {
    fields: {
      _id: 1,
    },
    sort: { _id: 1 },
    limit: 100,
  };
  const now = new Date();

  const pollsCursor = Polls.find({ groups: { $in: [groupId] }, active: true }, projection);
  const eventsAgendaCursor = EventsAgenda.find(
    { groups: { $elemMatch: { _id: groupId } }, end: { $gte: now } },
    projection,
  );
  const bookmarksCursor = Bookmarks.find({ groupId }, projection);
  const articlesCusrsor = Articles.find({ groups: { $elemMatch: { _id: groupId } } }, projection);
  const formsCursor = Forms.find({ groups: { $in: [groupId] }, active: true }, projection);

  return [groupsCursor, pollsCursor, eventsAgendaCursor, bookmarksCursor, articlesCusrsor, formsCursor];
});
