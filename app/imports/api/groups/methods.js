import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import sanitizeHtml from 'sanitize-html';
import { isActive, getLabel, validateString, sanitizeParameters } from '../utils';
import Groups from './groups';
import { addGroup, removeElement } from '../personalspaces/methods';
import logServer, { levels, scopes } from '../logging';
import { checkGroupUsers, validateShareName } from './utils';
import { userStructures } from '../structures/utils';

const reservedGroupNames = ['admins', 'adminStructure'];

export const favGroup = new ValidatedMethod({
  name: 'groups.favGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ groupId }) {
    if (!isActive(this.userId)) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - favGroup - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
        { groupId },
      );
      throw new Meteor.Error('api.groups.favGroup.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check group existence
    const group = Groups.findOne(groupId);
    if (group === undefined) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - favGroup - ${i18n.__('api.groups.unknownGroup')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { groupId },
      );
      throw new Meteor.Error('api.groups.favGroup.unknownService', i18n.__('api.groups.unknownGroup'));
    }
    const user = Meteor.users.findOne(this.userId);
    // store group in user favorite groups
    if (user.favGroups === undefined) {
      Meteor.users.update(this.userId, {
        $set: { favGroups: [groupId] },
      });
    } else if (user.favGroups.indexOf(groupId) === -1) {
      Meteor.users.update(this.userId, {
        $push: { favGroups: groupId },
      });
    }
    // update user personalSpace
    addGroup._execute({ userId: this.userId }, { groupId });
    logServer(`GROUPS - favGroup - ADD - User ${this.userId} add favGroup ${groupId} `, levels.VERBOSE, scopes.USER);
  },
});

export const unfavGroup = new ValidatedMethod({
  name: 'groups.unfavGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ groupId }) {
    if (!isActive(this.userId)) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - unfavGroup - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
        { groupId },
      );
      throw new Meteor.Error('api.groups.unfavGroup.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // remove group from user favorite groups
    if (user.favGroups.indexOf(groupId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { favGroups: groupId },
      });
    }
    // update user personalSpace
    removeElement._execute({ userId: this.userId }, { type: 'group', elementId: groupId });
    logServer(
      `GROUPS - METHODS - REMOVE - unFavGroup - User ${this.userId} unFavGroup ${groupId}`,
      levels.VERBOSE,
      scopes.USER,
    );
  },
});

export const findGroups = new ValidatedMethod({
  name: 'groups.findGroups',
  validate: new SimpleSchema({
    page: {
      type: SimpleSchema.Integer,
      min: 1,
      defaultValue: 1,
      optional: true,
      label: getLabel('api.methods.labels.page'),
    },
    pageSize: {
      type: SimpleSchema.Integer,
      min: 1,
      defaultValue: 10,
      optional: true,
      label: getLabel('api.methods.labels.pageSize'),
    },
    sortColumn: {
      type: String,
      defaultValue: 'name',
      optional: true,
      label: getLabel('api.methods.labels.sortColumn'),
    },
    sortOrder: {
      type: SimpleSchema.Integer,
      allowedValues: [1, -1],
      defaultValue: 1,
      optional: true,
      label: getLabel('api.methods.labels.sortOrder'),
    },
    groupId: {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator({ clean: true }),
  run({ page, pageSize, sortColumn, sortOrder, groupId }) {
    validateString(sortColumn, true);
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    const user = Meteor.users.findOne({ _id: this.userId });
    // calculate number of entries to skip
    const skip = (page - 1) * pageSize;
    const myGroups = user.favGroups;
    const sort = {};
    sort[sortColumn] = sortOrder;
    const totalCount = Groups.find({ _id: { $in: myGroups, $ne: groupId } }).count();
    const data = Groups.find(
      { _id: { $in: myGroups, $ne: groupId } },
      {
        fields: isAdmin ? Groups.adminFields : Groups.publicFields,
        limit: pageSize,
        skip,
        sort,
      },
    ).fetch();
    return { data, page, totalCount };
  },
});

export function _createGroup({ name, type, content, description, avatar, plugins, userId, shareName, structureIds }) {
  try {
    const user = Meteor.users.findOne(userId);
    if (user.groupCount < user.groupQuota) {
      const groupData = {
        name,
        type,
        content,
        description,
        avatar,
        owner: userId,
        animators: [userId],
        admins: [userId],
        active: true,
        plugins,
        shareName,
      };
      if (structureIds && structureIds.length > 0) {
        // Check that group owner is in one of the allowed structures
        const userStructs = userStructures(user);
        if (!structureIds.some((structId) => userStructs.includes(structId))) {
          throw new Meteor.Error('api.groups.createGroup.unauthorized', i18n.__('api.groups.ownerNotInStructures'));
        }
        groupData.structureIds = structureIds;
      }
      const groupId = Groups.insert(groupData);
      Roles.addUsersToRoles(userId, ['admin', 'animator'], groupId);

      favGroup._execute({ userId }, { groupId });
      logServer(
        `GROUPS - METHODS - CREATE - createGroup - User ${userId} create group ${groupId}`,
        levels.VERBOSE,
        scopes.USER,
      );

      if (type !== 15) {
        user.groupCount += 1;
        Meteor.users.update(userId, {
          $set: { groupCount: user.groupCount },
        });
      }

      // move group temp avatar from user minio to group minio and update avatar link
      if (avatar !== '' && avatar.includes('groupAvatar.png')) {
        const { minioEndPoint, minioBucket, minioPort } = Meteor.settings.public;
        const HOST = `https://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;
        Meteor.call('files.move', {
          sourcePath: `users/${userId}`,
          destinationPath: `groups/${groupId}`,
          files: [`${HOST}users/${userId}/groupAvatar.png`],
        });

        const avatarLink = `${HOST}groups/${groupId}/groupAvatar.png?${new Date().getTime()}`;

        Groups.update({ _id: groupId }, { $set: { avatar: avatarLink } });
      }
      return groupId;
    }
    logServer(
      `GROUPS - METHODS - METEOR ERROR - _createGroup - ${i18n.__('api.groups.toManyGroup')}`,
      levels.VERBOSE,
      scopes.SYSTEM,
    );
    throw new Meteor.Error('api.groups.createGroup.toManyGroup', i18n.__('api.groups.toManyGroup'));
  } catch (error) {
    if (error.code === 11000) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - _createGroup - ${i18n.__('api.groups.groupAlreadyExist')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { name, type, content, description, avatar, plugins, userId },
      );
      throw new Meteor.Error('api.groups.createGroup.duplicateName', i18n.__('api.groups.groupAlreadyExist'));
    } else {
      logServer(
        `GROUPS - METHODS - ERROR - createGroup - fail when user ${userId} create group`,
        levels.WARN,
        scopes.SYSTEM,
        {
          errorMessage: error.message,
        },
      );
      throw error;
    }
  }
}

export const createGroup = new ValidatedMethod({
  name: 'groups.createGroup',
  validate: new SimpleSchema({
    name: { type: String, min: 1, label: getLabel('api.groups.labels.name') },
    type: { type: SimpleSchema.Integer, min: 0, label: getLabel('api.groups.labels.type') },
    description: { type: String, label: getLabel('api.groups.labels.description') },
    content: { type: String, defaultValue: '', label: getLabel('api.groups.labels.content') },
    avatar: { type: String, defaultValue: '', label: getLabel('api.groups.labels.avatar') },
    plugins: { type: Object, optional: true, blackbox: true, label: getLabel('api.groups.labels.plugins') },
    shareName: {
      type: String,
      optional: true,
      label: getLabel('api.groups.labels.shareName'),
      custom: validateShareName,
    },
    structureIds: {
      type: Array,
      optional: true,
    },
    'structureIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.groups.labels.structureIds'),
    },
  }).validator({ clean: true }),

  run({ name, type, content, description, avatar, plugins, shareName, structureIds }) {
    if (!isActive(this.userId)) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - createGroup - ${i18n.__('api.users.mustBeLoggedIn')}`,
        levels.WARN,
        scopes.SYSTEM,
        { name, type, content, description, avatar, plugins },
      );
      throw new Meteor.Error('api.groups.createGroup.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    if (reservedGroupNames.includes(name)) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - createGroup - ${i18n.__('api.groups.groupAlreadyExist')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { name, type, content, description, avatar, plugins },
      );
      throw new Meteor.Error('api.groups.createGroup.notPermitted', i18n.__('api.groups.groupAlreadyExist'));
    }
    validateString(name);
    validateString(description);
    validateString(avatar);
    if (shareName) validateString(shareName);
    const sanitizedContent = sanitizeHtml(content, sanitizeParameters);
    validateString(sanitizedContent);
    return _createGroup({
      name,
      type,
      content: sanitizedContent,
      description,
      plugins,
      avatar,
      userId: this.userId,
      shareName,
      structureIds,
    });
  },
});

// eslint-disable-next-line react/prop-types
export function _removeGroup({ groupId, userId }) {
  // check group existence
  const group = Groups.findOne({ _id: groupId });
  if (group === undefined) {
    logServer(
      `GROUPS - METHODS - METEOR ERROR - _removeGroup - ${i18n.__('api.groups.unknownGroup')}`,
      levels.ERROR,
      scopes.SYSTEM,
      { groupId, userId },
    );
    throw new Meteor.Error('api.groups.removeGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
  }
  // check if current user has admin rights on group (or global admin)
  // FIXME : allow only for owner or for all admins ?
  const isAdmin = isActive(userId) && Roles.userIsInRole(userId, 'admin', groupId);
  const authorized = isAdmin || userId === group.owner;
  if (!authorized) {
    logServer(
      `GROUPS - METHODS - METEOR ERROR - _removeGroup - ${i18n.__('api.groups.adminGroupNeeded')}`,
      levels.ERROR,
      scopes.SYSTEM,
      { groupId, userId },
    );
    throw new Meteor.Error('api.groups.removeGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
  }

  if (group.type !== 15) {
    // Update group quota for owner
    const owner = Meteor.users.findOne({ _id: group.owner });
    if (owner !== undefined) {
      owner.groupCount -= 1;
      if (owner.groupCount <= 0) {
        owner.groupCount = 0;
      }
      Meteor.users.update(group.owner, {
        $set: { groupCount: owner.groupCount },
      });
    }
  }

  // remove all roles set on this group
  Roles.removeScope(groupId);
  logServer(`GROUPS - METHODS - REMOVE - _removeGroup - groupId: ${groupId}`, levels.INFO, scopes.USER);
  Groups.remove(groupId);
  // remove from users favorite groups
  Meteor.users.update({ favGroups: { $all: [groupId] } }, { $pull: { favGroups: groupId } }, { multi: true });
  logServer(`GROUPS - METHODS - UPDATE - user ${userId} remove group ${groupId}`, levels.VERBOSE, scopes.USER);
  return group;
}

export const removeGroup = new ValidatedMethod({
  name: 'groups.removeGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ groupId }) {
    return _removeGroup({ groupId, userId: this.userId });
  },
});

function _updateGroup(groupId, groupData, oldGroup) {
  if (Meteor.isServer) {
    // before update, check if some users are no longer authorized (based on structureIds)
    const oldStructs = Array.isArray(oldGroup.structureIds) ? oldGroup.structureIds.sort().toString() : '';
    const newStructs = Array.isArray(groupData.structureIds) ? groupData.structureIds.sort().toString() : '';
    // will raise an error if any user in the group has no access to chosen structures
    if (oldStructs !== newStructs) checkGroupUsers(oldGroup, groupData.structureIds);
  }
  try {
    Groups.update({ _id: groupId }, { $set: groupData });
    // set structureIds to null if no structure selected
    if (!groupData.structureIds || groupData.structureIds.length === 0) {
      Groups.update({ _id: groupId }, { $unset: { structureIds: 1 } });
    }
    // return both old and new data to allow plugins to detect changes in 'after' hook
    logServer(`GROUPS - METHODS - UPDATE - user update group ${groupId}`, levels.VERBOSE, scopes.USER);
    return [groupData, oldGroup];
  } catch (error) {
    if (error.code === 11000) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - _updateGroup - ${i18n.__('api.groups.groupAlreadyExist')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { groupId, groupData, oldGroup },
      );
      throw new Meteor.Error('api.groups.updateGroup.duplicateName', i18n.__('api.groups.groupAlreadyExist'));
    } else {
      logServer(`GROUPS - METHODS - ERROR - updateGroup - error when user updateGroup`, levels.WARN, scopes.SYSTEM, {
        errorMEssage: error.message,
      });
      throw error;
    }
  }
}

export const updateGroup = new ValidatedMethod({
  name: 'groups.updateGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.groups.labels.id') },
    data: Object,
    'data.name': {
      type: String,
      min: 1,
      optional: true,
      label: getLabel('api.groups.labels.name'),
    },
    'data.type': {
      type: SimpleSchema.Integer,
      allowedValues: [0, 5, 10, 15],
      optional: true,
      label: getLabel('api.groups.labels.type'),
    },
    'data.description': { type: String, optional: true, label: getLabel('api.groups.labels.description') },
    'data.content': { type: String, optional: true, label: getLabel('api.groups.labels.content') },
    'data.avatar': { type: String, optional: true, label: getLabel('api.groups.labels.avatar') },
    'data.active': { type: Boolean, optional: true, label: getLabel('api.groups.labels.active') },
    'data.groupPadId': { type: String, optional: true, label: getLabel('api.groups.labels.groupPadId') },
    'data.digest': { type: String, optional: true, label: getLabel('api.groups.labels.digest') },
    'data.plugins': { type: Object, optional: true, blackbox: true, label: getLabel('api.groups.labels.plugins') },
    'data.shareName': {
      type: String,
      optional: true,
      label: getLabel('api.groups.labels.shareName'),
      custom: validateShareName,
    },
    'data.structureIds': {
      type: Array,
      optional: true,
    },
    'data.structureIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      label: getLabel('api.groups.labels.structureIds'),
    },
  }).validator({ clean: true }),

  run({ groupId, data }) {
    // check group existence
    const group = Groups.findOne({ _id: groupId });
    if (group === undefined) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - updateGroup - ${i18n.__('api.groups.unknownGroup')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { groupId, data },
      );
      throw new Meteor.Error('api.groups.updateGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    // check if current user has admin rights on group (or global admin)
    const isAllowed = isActive(this.userId) && Roles.userIsInRole(this.userId, ['admin', 'animator'], groupId);
    const authorized = isAllowed || this.userId === group.owner;
    if (!authorized) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - updateGroup - ${i18n.__('api.groups.adminGroupNeeded')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { groupId, data },
      );
      throw new Meteor.Error('api.groups.updateGroup.notPermitted', i18n.__('api.groups.adminGroupNeeded'));
    }
    if (reservedGroupNames.includes(data.name)) {
      logServer(
        `GROUPS - METHODS - METEOR ERROR - updateGroup - ${i18n.__('api.groups.groupAlreadyExist')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { groupId, data },
      );
      throw new Meteor.Error('api.groups.updateGroup.notPermitted', i18n.__('api.groups.groupAlreadyExist'));
    }
    if (data.name) validateString(data.name);
    if (data.description) validateString(data.description);
    if (data.avatar) validateString(data.avatar);
    if (data.groupPadId) validateString(data.groupPadId);
    if (data.digest) validateString(data.digest);
    if (data.shareName) validateString(data.shareName);
    const sanitizedContent = sanitizeHtml(data.content, sanitizeParameters);
    validateString(sanitizedContent);
    let groupData = {};
    if (!Roles.userIsInRole(this.userId, 'admin', groupId)) {
      // animator can only update description and content
      if (data.description) groupData.description = data.description;
      if (data.content) groupData.content = sanitizedContent;
      if (data.avatar) groupData.avatar = data.avatar;
    } else {
      groupData = { ...data, content: sanitizedContent };
    }
    return _updateGroup(groupId, groupData, group);
  },
});

export const countMembersOfGroup = new ValidatedMethod({
  name: 'groups.single.admin',
  validate: new SimpleSchema({
    slug: String,
  }).validator(),
  run({ slug }) {
    const group = Groups.findOne({ slug }, { fields: Groups.adminFields, limit: 1 });

    if (group) {
      const { members, animators, admins } = group;
      return new Set([members, animators, admins].flat()).size;
    }
    return 0;
  },
});

export const checkShareName = new ValidatedMethod({
  name: 'groups.checkShareName',
  validate: new SimpleSchema({
    shareName: { type: String, label: getLabel('api.groups.labels.shareName') },
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true, label: getLabel('api.groups.labels.id') },
  }).validator(),

  run({ shareName, groupId }) {
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.groups.checkShareName.notLoggedIn', i18n.__('api.users.mustBeLoggedIn'));
    }
    const query = { shareName };
    if (groupId) query._id = { $ne: groupId };
    const group = Groups.findOne(query);
    if (group) return false;
    return true;
  },
});

if (Meteor.isServer) {
  // Get list of all method names on User
  const LISTS_METHODS = _.pluck(
    [favGroup, unfavGroup, createGroup, removeGroup, updateGroup, countMembersOfGroup, checkShareName],
    'name',
  );
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000,
  );
}
