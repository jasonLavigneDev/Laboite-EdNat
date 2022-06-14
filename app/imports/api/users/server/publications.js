import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import SimpleSchema from 'simpl-schema';
import { checkPaginationParams, isActive, getLabel } from '../../utils';
import Groups from '../../groups/groups';
import { getStructureIds } from '../structures';
import logServer from '../../logging';

// publish additional fields for current user
Meteor.publish('userData', function publishUserData() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: Meteor.users.selfFields,
      },
    );
  }
  return this.ready();
});

// publish users waiting for activation by admin
Meteor.publish('users.request', function usersRequest() {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  return Meteor.users.find(
    { isActive: { $ne: true } },
    {
      fields: Meteor.users.adminFields,
    },
  );
});

Meteor.publish('users.request.count', function usersRequestCounter() {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  Counts.publish(this, 'users.request.count', Meteor.users.find({ isActive: { $ne: true } }));
  return [];
});

// automatically publish assignments for current user
Meteor.publish(null, function publishAssignments() {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  return this.ready();
});

// publish all admin assignments (global admin)
Meteor.publish('roles.admin', function publishAdmins() {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  return Meteor.roleAssignment.find({ 'role._id': 'admin', scope: null });
});

// publish all structure admin assignments for one structure
Meteor.publish('roles.adminStructure', function publishStructureAdmins() {
  const user = Meteor.users.findOne({ _id: this.userId });
  if (
    !isActive(this.userId) ||
    (!Roles.userIsInRole(this.userId, 'adminStructure', user.structure) && !Roles.userIsInRole(this.userId, 'admin'))
  ) {
    return this.ready();
  }
  return Meteor.roleAssignment.find({ 'role._id': 'adminStructure', scope: user.structure });
});

// publish all structure admin assignments for all structure
Meteor.publish('roles.adminStructureAll', function publishStructureAdminsAll() {
  const ret = Meteor.roleAssignment.find({ 'role._id': 'adminStructure', scope: { $in: getStructureIds() } });

  if (
    !isActive(this.userId) ||
    (ret.fetch().indexOf(this.userId) !== -1 && !Roles.userIsInRole(this.userId, 'admin'))
  ) {
    return this.ready();
  }
  return ret;
});

// Publish all existing roles
Meteor.publish(null, function publishRoles() {
  if (this.userId) {
    return Meteor.roles.find({});
  }
  return this.ready();
});

// build query for all users from group
const queryUsersFromGroup = ({ group, search }) => {
  const { admins, members, animators } = group;
  const ids = [...admins, ...members, ...animators];
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    _id: { $in: ids },
    $or: searchQuery,
  };
};

Meteor.methods({
  // count all users from a group
  'get_users.group_count': function getGroupAllUsersCount({ search, slug }) {
    try {
      const group = Groups.findOne({ slug });
      const query = queryUsersFromGroup({ group, search });

      return Meteor.users.find(query).count();
    } catch (error) {
      return 0;
    }
  },
});

// publish all users from a group
FindFromPublication.publish('users.group', function usersFromGroup({ page, itemPerPage, search, slug, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.groups.labels.slug'),
      },
    })
      .extend(checkPaginationParams)
      .validate({ page, itemPerPage, slug, search });
  } catch (err) {
    logServer(`publish users.group: ${err}`);
    this.error(err);
  }
  const group = Groups.findOne({ slug });
  // for protected/private groups, publish users only for allowed users
  if (group.type !== 0 && !Roles.userIsInRole(this.userId, ['admin', 'animator', 'member'], group._id)) {
    return this.ready();
  }

  try {
    const query = queryUsersFromGroup({ group, search });

    const data = Meteor.users.find(query, {
      fields: Meteor.users.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { lastName: 1 },
      ...rest,
    });
    return data;
  } catch (error) {
    return this.ready();
  }
});

// build query for all users who published articles
const queryUsersPublishers = ({ search }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    articlesCount: { $gt: 0 },
    $or: searchQuery,
  };
};

// publish all users who published articles
FindFromPublication.publish('users.publishers', ({ page, itemPerPage, search, ...rest }) => {
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish users.publishers: ${err}`);
    this.error(err);
  }
  const pubFields = { ...Meteor.users.publicFields };
  // do not leak email adresses on public page
  delete pubFields.emails;
  delete pubFields.username;

  try {
    const query = queryUsersPublishers({ search });
    return Meteor.users.find(query, {
      fields: pubFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});

Meteor.methods({
  // count all users who published
  'get_users.publishers_count': ({ search }) => {
    try {
      const query = queryUsersPublishers({ search });

      return Meteor.users
        .find(query, {
          sort: { lastname: 1 },
        })
        .count();
    } catch (error) {
      return 0;
    }
  },
});

// build query for all users from group
const queryUsersAdmin = ({ search }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username', 'structure'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    $or: searchQuery,
  };
};

// publish all users from a group
FindFromPublication.publish('users.admin', function usersAdmin({ page, itemPerPage, search, ...rest }) {
  if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish users.admin : ${err}`);
    this.error(err);
  }

  try {
    const query = queryUsersAdmin({ search });

    return Meteor.users.find(query, {
      fields: Meteor.users.adminFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { lastName: 1, firstName: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});
// count all users
Meteor.methods({
  'get_users.admin_count': ({ search }) => {
    try {
      const query = queryUsersAdmin({ search });

      return Meteor.users
        .find(query, {
          sort: { lastName: 1 },
        })
        .count();
    } catch (error) {
      return 0;
    }
  },
});

// build query for all users with same structure
const queryUsersByStructure = ({ search }, currentStructure) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['firstName', 'lastName', 'emails.address', 'username'];
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));
  return {
    structure: currentStructure,
    $or: searchQuery,
  };
};

// publish all users with same structure
FindFromPublication.publish('users.byStructure', function usersStructure({ page, itemPerPage, search, ...rest }) {
  const currentUser = Meteor.users.findOne(this.userId);
  if (
    !isActive(this.userId) ||
    (!Roles.userIsInRole(this.userId, 'admin') &&
      !Roles.userIsInRole(this.userId, 'adminStructure', currentUser.structure))
  ) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish users.byStructure : ${err}`);
    this.error(err);
  }

  try {
    const query = queryUsersByStructure({ search }, currentUser.structure);
    return Meteor.users.find(query, {
      fields: Meteor.users.adminFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { lastName: 1, firstName: 1 },
      ...rest,
    });
  } catch (error) {
    return this.ready();
  }
});
// count structure users
Meteor.methods({
  'get_users.byStructure_count': function queryUsersStructureCount({ search }) {
    const currentUser = Meteor.users.findOne(this.userId);
    try {
      const query = queryUsersByStructure({ search }, currentUser.structure);

      return Meteor.users
        .find(query, {
          sort: { lastName: 1 },
        })
        .count();
    } catch (error) {
      return 0;
    }
  },
});
