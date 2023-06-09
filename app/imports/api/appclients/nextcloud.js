import fetch from 'node-fetch';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { isActive, testUrl } from '../utils';
import logServer, { levels, scopes } from '../logging';
import Groups from '../groups/groups';

const nextcloudPlugin = Meteor.settings.public.groupPlugins.nextcloud;
const { nextcloud } = Meteor.settings;

function ocsUrl(ncURL) {
  const origin = testUrl(ncURL);
  return new URL('/ocs/v1.php/cloud', origin).href;
}

function getInstance(user) {
  return new URL(user.nclocator).host;
}

function checkResponse(response) {
  if (!response.ok) {
    throw new Error(`status: ${response.status}, message: ${response.statusText}, url: ${response.url}`);
  }
}

function getShareName(name) {
  return `groupe-${name}`;
}

class NextcloudClient {
  constructor() {
    this.ncURL = (nextcloudPlugin && nextcloudPlugin.URL) || '';
    const ncUser = (nextcloud && nextcloud.nextcloudUser) || '';
    const ncPassword = (nextcloud && nextcloud.nextcloudPassword) || '';
    this.circlesUser = (nextcloud && nextcloud.circlesUser) || '';
    const circlesPassword = (nextcloud && nextcloud.circlesPassword) || '';
    this.appsURL = testUrl(`${this.ncURL}/ocs/v2.php/apps`);
    this.baseHeaders = {
      Accept: 'application/json',
      'OCS-APIRequest': true,
    };
    // headers for user management
    this.basicAuth = Buffer.from(`${ncUser}:${ncPassword}`, 'binary').toString('base64');
    this.ocsHeaders = {
      ...this.baseHeaders,
      Authorization: `Basic ${this.basicAuth}`,
    };
    this.ocsPostHeaders = {
      ...this.ocsHeaders,
      'Content-Type': 'application/json',
    };
    // headers for circles and shares management
    this.circlesAuth = Buffer.from(`${this.circlesUser}:${circlesPassword}`, 'binary').toString('base64');
    this.circlesHeaders = {
      ...this.baseHeaders,
      Authorization: `Basic ${this.circlesAuth}`,
    };
    this.circlesPostHeaders = {
      ...this.circlesHeaders,
      'Content-Type': 'application/json',
    };
  }

  async userExists(username, ncURL) {
    const params = new URLSearchParams({ search: username });
    const response = await fetch(`${ocsUrl(ncURL)}/users?${params.toString()}`, {
      method: 'GET',
      headers: this.ocsHeaders,
    });
    if (response.ok) {
      const respJson = await response.json();
      return respJson.ocs.data.users.includes(username);
    }
    logServer(
      `APPCLIENT - NEXTCLOUD - userExists - ${i18n.__('api.nextcloud.apiError', { groupName: username })}`,
      levels.ERROR,
      scopes.SYSTEM,
      {
        groupName: username,
        ncURL,
        error: `status: ${response.status}, message: ${response.statusText}, url: ${response.url}`,
      },
    );
    return false;
  }

  async _checkConfig() {
    // checks that 'Circles' API is responding
    const response = await fetch(`${this.appsURL}/circles/circles`, {
      method: 'GET',
      headers: this.circlesHeaders,
    });
    checkResponse(response);
    const data = await response.json();
    if (data === undefined || data.ocs === undefined) {
      logServer(
        `APPCLIENT - NEXTCLOUD - checkFolderActive - ${i18n.__('api.nextcloud.circlesInactive')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {},
      );
      return false;
    }
    logServer(
      `APPCLIENT - NEXTCLOUD - checkConfig - ${i18n.__('api.nextcloud.configOk')}`,
      levels.INFO,
      scopes.SYSTEM,
      {},
    );
    return true;
  }

  async checkConfig() {
    logServer(
      `APPCLIENT - NEXTCLOUD - checkConfig - ${i18n.__('api.nextcloud.checkConfig', { URL: this.appsURL })}`,
      levels.INFO,
      scopes.SYSTEM,
      {
        URL: this.appsURL,
      },
    );
    return this._checkConfig().catch((error) => {
      logServer(
        `APPCLIENT - NEXTCLOUD - checkConfig - ${i18n.__('api.nextcloud.badConfig')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          error: error.reason || error.message,
        },
      );
      return false;
    });
  }

  async _configureCircle(circleId) {
    const params = { value: 40960 };
    const response = await fetch(`${this.appsURL}/circles/circles/${circleId}/config`, {
      method: 'PUT',
      headers: this.circlesPostHeaders,
      body: JSON.stringify(params),
    });
    checkResponse(response);
    const respJson = await response.json();
    if (respJson.ocs.meta.status !== 'ok') {
      logServer(
        `APPCLIENT - NEXTCLOUD - _configureCircle - ${i18n.__('api.nextcloud.configureCircleError')}`,
        levels.ERROR,
        scopes.SYSTEM,
        { circleId },
      );
    }
    return circleId;
  }

  async _ensureCircle(group) {
    const groupId = group._id;
    const shareName = getShareName(group.shareName);
    if (!group.circleId) {
      const params = { name: shareName, personal: false, local: false };
      const response = await fetch(`${this.appsURL}/circles/circles`, {
        method: 'POST',
        headers: this.circlesPostHeaders,
        body: JSON.stringify(params),
      });
      checkResponse(response);
      const respJson = await response.json();
      const infos = respJson.ocs.meta;
      if (infos.status === 'ok') {
        const circleId = respJson.ocs.data.id;
        logServer(
          `APPCLIENT - NEXTCLOUD - ensureCircle - ${i18n.__('api.nextcloud.circleAdded')}`,
          levels.INFO,
          scopes.SYSTEM,
          {
            name: shareName,
            groupId,
            circleId,
          },
        );
        // store circleId in group
        Groups.update({ _id: groupId }, { $set: { circleId } });
        // configure circle as a federated circle
        return this._configureCircle(circleId);
      }
      logServer(
        `APPCLIENT - NEXTCLOUD - ensureCircle - ${i18n.__('api.nextcloud.circleAddError', { groupId })}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          name: shareName,
          error: infos.message,
        },
      );
      return null;
    }
    return group.circleId;
  }

  async ensureCircle(group) {
    return this._ensureCircle(group).catch((error) => {
      logServer(
        `APPCLIENT - NEXTCLOUD - ensureCircle - ${i18n.__('api.nextcloud.circleAddError', { groupId: group._id })}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          name: getShareName(group.shareName),
          error: error.reason || error.message,
        },
      );
      return null;
    });
  }

  async _ensureShare(group, circleId) {
    // ensures that a group share exists and is associated to group circle
    const groupId = group._id;
    if (!group.shareId) {
      const shareName = getShareName(group.shareName);
      const resp = await fetch(`${this.ncURL}/remote.php/dav/files/${this.circlesUser}/${shareName}`, {
        method: 'MKCOL',
        headers: this.circlesHeaders,
      });
      if (resp.statusText !== 'Created') {
        logServer(
          `APPCLIENT - NEXTCLOUD - ensureShare - ${i18n.__('api.nextcloud.shareCreateError', { groupId })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            name: shareName,
            error: `status: ${resp.status}, message: ${resp.statusText}, url: ${resp.url}`,
          },
        );
      }
      const params = { password: null, path: shareName, permissions: 31, shareType: 7, shareWith: circleId };
      const response = await fetch(`${this.appsURL}/files_sharing/api/v1/shares`, {
        method: 'POST',
        headers: this.circlesPostHeaders,
        body: JSON.stringify(params),
      });
      checkResponse(response);
      const respJson = await response.json();
      if (respJson.ocs.meta.status === 'ok') {
        const shareId = respJson.ocs.data.id;
        logServer(
          `APPCLIENT - NEXTCLOUD - ensureShare - ${i18n.__('api.nextcloud.shareAdded', { groupId })}`,
          levels.INFO,
          scopes.SYSTEM,
          {
            path: shareName,
            groupId,
            circleId,
          },
        );
        // store shareId in group
        Groups.update({ _id: groupId }, { $set: { shareId } });
        return shareId;
      }
      logServer(
        `APPCLIENT - NEXTCLOUD - ensureShare - ${i18n.__('api.nextcloud.shareAddError', { groupId })}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          error: respJson.ocs.meta.message,
        },
      );
      return null;
    }
    return group.shareId;
  }

  async ensureShare(group, circleId) {
    return this._ensureShare(group, circleId).catch((error) => {
      logServer(
        `APPCLIENT - NEXTCLOUD - ensureShare - ${i18n.__('api.nextcloud.shareAddError', { groupId: group._id })}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          error: error.reason || error.message,
        },
      );
      return null;
    });
  }

  async _deleteCircle(group) {
    const response = await fetch(`${this.appsURL}/circles/circles/${group.circleId}`, {
      method: 'DELETE',
      headers: this.circlesHeaders,
    });
    checkResponse(response);
    const respJson = await response.json();
    if (respJson.ocs.meta.status === 'ok') {
      logServer(
        `APPCLIENT - NEXTCLOUD - deleteCircle - ${i18n.__('api.nextcloud.circleDeleted')}`,
        levels.INFO,
        scopes.SYSTEM,
        {
          groupId: group._id,
          circleId: group.circleId,
        },
      );
      Groups.update({ _id: group._id }, { $unset: { circleId: 1 } });
    } else {
      logServer(
        `APPCLIENT - NEXTCLOUD - deleteCircle - ${i18n.__('api.nextcloud.circleDeleteError')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          circleId: group.circleId,
          error: respJson.ocs.meta.message,
        },
      );
    }
  }

  async deleteCircle(group) {
    if (group.circleId) {
      await this._deleteCircle(group).catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - deleteCircle - ${i18n.__('api.nextcloud.circleDeleteError')}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            circleId: group.circleId,
            error: error.reason || error.message,
          },
        );
      });
    }
  }

  async _deleteFolder(group, shareName) {
    const response = await fetch(`${this.ncURL}/remote.php/dav/files/${this.circlesUser}/${shareName}`, {
      method: 'DELETE',
      headers: this.circlesHeaders,
    });
    checkResponse(response);
    logServer(
      `APPCLIENT - NEXTCLOUD - deleteFolder - ${i18n.__('api.nextcloud.folderDeleted')}`,
      levels.INFO,
      scopes.SYSTEM,
      {
        path: shareName,
      },
    );
    Groups.update({ _id: group._id }, { $unset: { shareId: 1 } });
  }

  async deleteFolder(group) {
    const shareName = getShareName(group.shareName);
    await this._deleteFolder(group, shareName).catch((error) => {
      logServer(
        `APPCLIENT - NEXTCLOUD - deleteFolder - ${i18n.__('api.nextcloud.folderDeleteError')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          path: shareName,
          error: error.reason || error.message,
        },
      );
    });
  }

  async _inviteUser(user, group) {
    const { circleId } = group;
    if (user.nclocator) {
      const params = { type: 1, userId: `${user.username}@${getInstance(user)}` };
      const response = await fetch(`${this.appsURL}/circles/circles/${circleId}/members`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: this.circlesPostHeaders,
      });
      checkResponse(response);
      const respJson = await response.json();
      if (respJson.ocs.meta.status === 'ok') {
        logServer(
          `APPCLIENT - NEXTCLOUD - inviteUser - ${i18n.__('api.nextcloud.userInvited')}`,
          levels.INFO,
          scopes.SYSTEM,
          {
            username: user.username,
            circleId,
          },
        );
      } else {
        logServer(
          `APPCLIENT - NEXTCLOUD - inviteUser - ${i18n.__('api.nextcloud.userInviteError')}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            username: user.username,
            circleId: group.circleId,
            error: respJson.ocs.meta.message,
          },
        );
      }
    }
  }

  async inviteUser(userId, group) {
    const user = Meteor.users.findOne(userId);
    await this._inviteUser(user, group).catch((error) => {
      logServer(
        `APPCLIENT - NEXTCLOUD - inviteUser - ${i18n.__('api.nextcloud.userInviteError')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          user: `${user.username}@${getInstance(user)}`,
          error: error.reason || error.message,
        },
      );
    });
  }

  async _inviteMembers(group, circleId) {
    const userIds = [...group.members, ...group.animators];
    const allUsers = Meteor.users.find({ _id: { $in: userIds } }, { fields: { username: 1, nclocator: 1 } }).fetch();
    const params = {
      members: allUsers.map((user) => {
        return { type: 1, id: `${user.username}@${getInstance(user)}` };
      }),
    };
    const response = await fetch(`${this.appsURL}/circles/circles/${circleId}/members/multi`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: this.circlesPostHeaders,
    });
    checkResponse(response);
    const respJson = await response.json();
    if (respJson.ocs.meta.status !== 'ok') {
      logServer(
        `APPCLIENT - NEXTCLOUD - inviteMembers - ${i18n.__('api.nextcloud.userInviteError')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          groupId: group._id,
          error: respJson.ocs.meta.message,
        },
      );
    }
  }

  async inviteMembers(group, circleId) {
    await this._inviteMembers(group, circleId).catch((error) => {
      logServer(
        `APPCLIENT - NEXTCLOUD - inviteMembers - ${i18n.__('api.nextcloud.userInviteError')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          groupId: group._id,
          error: error.reason || error.message,
        },
      );
    });
  }

  async _kickUser(user, group) {
    const { circleId } = group;
    const response = await fetch(`${this.appsURL}/circles/circles/${circleId}/members`, {
      method: 'GET',
      headers: this.circlesHeaders,
    });
    checkResponse(response);
    const respJson = await response.json();
    if (respJson.ocs.meta.status !== 'ok') {
      logServer(
        `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.userKickError')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          user: user.username,
          error: respJson.ocs.meta.message,
        },
      );
    } else {
      // find user memberId in circle
      const member = respJson.ocs.data.find((item) => item.userId === user.username);
      if (member !== undefined) {
        // remove member from circle
        const respDelete = await fetch(`${this.appsURL}/circles/circles/${circleId}/members/${member.id}`, {
          method: 'DELETE',
          headers: this.circlesHeaders,
        });
        checkResponse(respDelete);
        const respDelJson = await respDelete.json();
        if (respDelJson.ocs.meta.status !== 'ok') {
          logServer(
            `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.userKickError')}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              user: user.username,
              error: respDelJson.ocs.meta.message,
            },
          );
        } else {
          logServer(
            `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.userKicked')}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              username: user.username,
              circleId,
            },
          );
        }
      } else {
        logServer(
          `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.notMember')}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            username: user.username,
            circleId,
          },
        );
      }
    }
  }

  async kickUser(userId, group) {
    const user = Meteor.users.findOne(userId);
    await this._kickUser(user, group).catch((error) => {
      logServer(
        `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.userKickError')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          user: user.username,
          error: error.reason || error.message,
        },
      );
    });
  }

  async addUser(userId) {
    const user = Meteor.users.findOne(userId);
    if (!user.nclocator) {
      logServer(
        `APPCLIENT - NEXTCLOUD - ERROR - addUser - ${i18n.__('api.nextcloud.misingNCLocator')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          userId,
        },
      );
    } else {
      const resExists = await this.userExists(user.username, user.nclocator);
      if (resExists === false) {
        const ncData = {
          userid: user.username,
          password: '',
          email: user.emails ? user.emails[0].address : '',
          displayName: `${user.firstName} ${user.lastName}`,
          language: user.language,
        };
        this._addUser(ncData, user.nclocator).catch((error) => {
          logServer(
            `APPCLIENT - NEXTCLOUD - ERROR - _addUser - ${i18n.__('api.nextcloud.userAddError', { userId })}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              userData: ncData,
              userId,
              ncURL: user.nclocator,
              error: error.reason || error.message,
            },
          );
        });
      }
    }
  }

  async _addUser(userData, ncURL) {
    const userId = userData.userid;
    const response = await fetch(`${ocsUrl(ncURL)}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: this.ocsPostHeaders,
    });
    checkResponse(response);
    const respJson = await response.json();
    const infos = respJson.ocs.meta;
    if (infos.status === 'ok') {
      logServer(
        `APPCLIENT - NEXTCLOUD - _addUser - ${i18n.__('api.nextcloud.userAdded', { userId, ncURL })}`,
        levels.INFO,
        scopes.SYSTEM,
        {
          userData,
          userId,
          ncURL,
        },
      );
    } else {
      logServer(
        `APPCLIENT - NEXTCLOUD - _addUser - ${i18n.__('api.nextcloud.userAddError', { userId })}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          userData,
          userId,
          ncURL,
        },
      );
    }
  }
}

if (Meteor.isServer && nextcloudPlugin && nextcloudPlugin.enable) {
  const nextClient = new NextcloudClient();
  // check that api is accessible and circles application is active
  nextClient.checkConfig();

  Meteor.afterMethod('groups.createGroup', async function nextCreateGroup({ plugins }) {
    if (!this.error) {
      if (plugins.nextcloud === true) {
        const groupId = this.result;
        const group = Groups.findOne({ _id: groupId });
        // create nextcloud circle and share, invite group members/animators to circle
        const circleId = await nextClient.ensureCircle(group);
        if (circleId) {
          nextClient.ensureShare(group, circleId);
          nextClient.inviteMembers(group, circleId);
        }
      }
    }
  });

  Meteor.afterMethod('groups.removeGroup', function nextRemoveGroup({ groupId }) {
    if (!this.error) {
      const groupData = this.result;
      const isAdmin = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
      if (isAdmin || this.userId === groupData.owner) {
        if (groupData.plugins.nextcloud === true) {
          // remove circle and share folder group from nextcloud
          nextClient.deleteCircle(groupData);
          nextClient.deleteFolder(groupData);
        }
      }
    }
  });

  Meteor.afterMethod('groups.updateGroup', async function nextUpdateGroup({ groupId }) {
    if (!this.error) {
      const group = Groups.findOne({ _id: groupId });
      if (group.plugins.nextcloud === true && !group.circleId) {
        // create nextcloud circle and share if needed
        const circleId = await nextClient.ensureCircle(group);
        if (circleId) {
          nextClient.ensureShare(group, circleId);
          // add all group members to circle
          nextClient.inviteMembers(group, circleId);
        }
      } else if (group.plugins.nextcloud === false && group.circleId) {
        // remove circle and share from nextcloud
        nextClient.deleteCircle(group);
        nextClient.deleteFolder(group);
      }
    }
  });

  Meteor.afterMethod('users.setMemberOf', function nextSetMember({ userId, groupId }) {
    if (!this.error) {
      // invite user to group circle if needed
      const group = Groups.findOne({ _id: groupId });
      if (group.plugins.nextcloud === true) {
        nextClient.inviteUser(userId, group);
      }
    }
  });

  Meteor.afterMethod('users.unsetMemberOf', function nextUnsetMember({ userId, groupId }) {
    if (!this.error) {
      // remove user from circle if needed
      const group = Groups.findOne({ _id: groupId });
      if (group.plugins.nextcloud === true) {
        if (!group.animators.includes(userId)) nextClient.kickUser(userId, group);
      }
    }
  });

  Meteor.afterMethod('users.setAnimatorOf', function nextSetAnimator({ userId, groupId }) {
    if (!this.error) {
      // invite user to group circle if needed
      const group = Groups.findOne({ _id: groupId });
      if (group.plugins.nextcloud === true) {
        nextClient.inviteUser(userId, group);
      }
    }
  });

  Meteor.afterMethod('users.unsetAnimatorOf', function nextUnsetAnimator({ userId, groupId }) {
    if (!this.error) {
      // invite user from circle if needed
      const group = Groups.findOne({ _id: groupId });
      if (group.plugins.nextcloud === true) {
        if (!group.members.includes(userId)) nextClient.kickUser(userId, group);
      }
    }
  });

  Meteor.afterMethod('users.setActive', function nextAddUser({ userId }) {
    if (!this.error) {
      // create nextcloud user if needed
      // get nclocator for this user
      nextClient.addUser(userId);
    }
  });

  Meteor.afterMethod('users.userUpdated', function rcUserUpdated(params) {
    if (!this.error) {
      const { userId, data } = params;
      if (data.isActive && data.isActive === true) {
        nextClient.addUser(userId);
      }
    }
  });
}
