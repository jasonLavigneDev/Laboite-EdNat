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

<<<<<<< HEAD
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
=======
  groupExists(groupName) {
    return axios
      .get(`${this.nextURL}/groups`, {
        params: {
          search: groupName,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        return response.data.ocs.data.groups.includes(groupName);
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - groupExists - ${i18n.__('api.nextcloud.groupNotFound', { groupName })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            groupName,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
        return false;
      });
  }

  userExists(userId, ncURL = this.ncURL) {
    return axios
      .get(`${ocsUrl(ncURL)}/users`, {
        params: {
          search: userId,
        },
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        return response.data.ocs.data.users.includes(userId);
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - userExists - ${i18n.__('api.nextcloud.apiError', { groupName: userId })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            groupName: userId,
            ncURL,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
        return false;
      });
  }

  checkConfig() {
    logServer(
      `APPCLIENT - NEXTCLOUD - AXIOS - checkConfig - ${i18n.__('api.nextcloud.checkConfig', { URL: this.nextURL })}`,
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
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
<<<<<<< HEAD
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
=======
      })
      .then((response) => {
        if (checkFolderActive(response) === true) {
          logServer(
            `APPCLIENT - NEXTCLOUD - THEN - checkConfig - ${i18n.__('api.nextcloud.configOk')}`,
            levels.INFO,
            scopes.SYSTEM,
            {},
          );
          return true;
        }
        return false;
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - checkConfig - ${i18n.__('api.nextcloud.badConfig')}`,
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
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
<<<<<<< HEAD
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
=======
      )
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status === 'ok') {
          logServer(
            `APPCLIENT - NEXTCLOUD - THEN - addGroup - ${i18n.__('api.nextcloud.groupAdded', { groupName })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              groupName,
            },
          );
        } else {
          logServer(
            `APPCLIENT - NEXTCLOUD - ERROR - addGroup - ${i18n.__('api.nextcloud.groupAddError', { groupName })} (${
              infos.statuscode
            } - ${infos.message})}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              groupName,
              infos,
            },
          );
        }
        return infos.status === 'ok' ? infos.status : infos.message;
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - addGroup - ${i18n.__('api.nextcloud.groupAddError', { groupName })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            groupName,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
        return i18n.__('api.nextcloud.groupAddError', { groupName });
      });
  }

  _addGroupToFolder(groupName, folderName, folderId) {
    return axios
      .post(
        `${this.appsURL}/groupfolders/folders/${folderId}/groups`,
        {
          group: groupName,
        },
        {
          params: { format: 'json' },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.basicAuth}`,
            'OCS-APIRequest': true,
          },
        },
      )
      .then((response) => {
        if (response.data.ocs.meta.status === 'ok') {
          return axios
            .post(
              `${this.appsURL}/groupfolders/folders/${folderId}/groups/${groupName}`,
              {
                // set permissions to : create, read, update, delete (not share)
                permissions: 15,
              },
              {
                params: { format: 'json' },
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Basic ${this.basicAuth}`,
                  'OCS-APIRequest': true,
                },
              },
            )
            .then((resp) => resp.data.ocs.meta.status === 'ok');
        }
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - _addGroupToFolder - ${i18n.__('api.nextcloud.groupFolderAssignError', {
            groupName,
            folderName,
          })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            groupName,
            folderName,
          },
        );
        return false;
      });
  }

  _addQuotaToFolder(folderId) {
    // get quota (in bytes) from settings, or -3 if not set (unlimited)
    const quota = nextcloud.nextcloudQuota || -3;
    return axios
      .post(
        `${this.appsURL}/groupfolders/folders/${folderId}/quota`,
        {
          quota,
        },
        {
          params: { format: 'json' },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.basicAuth}`,
            'OCS-APIRequest': true,
          },
        },
      )
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (checkFolderActive(response) && infos.status === 'ok') {
          return true;
        }
        return false;
      });
  }

  addGroupFolder(groupName, folderName) {
    // creates a new group folder and configure access for group users
    return axios
      .post(
        `${this.appsURL}/groupfolders/folders`,
        {
          mountpoint: folderName,
        },
        {
          params: { format: 'json' },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.basicAuth}`,
            'OCS-APIRequest': true,
          },
        },
      )
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (checkFolderActive(response) && infos.status === 'ok') {
          logServer(
            `APPCLIENT - NEXTCLOUD - THEN - addGroupFolder -
            ${i18n.__('api.nextcloud.groupFolderAdded', { folderName })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              groupName,
              folderName,
            },
          );
          return this._addGroupToFolder(groupName, folderName, response.data.ocs.data.id).then((resp) => {
            if (resp === true) {
              logServer(
                `APPCLIENT - NEXTCLOUD - ADD - addGroupFolder -
                ${i18n.__('api.nextcloud.permissionsSet', { folderName })}`,
                levels.INFO,
                scopes.SYSTEM,
                {
                  groupName,
                  folderName,
                },
              );
              return this._addQuotaToFolder(response.data.ocs.data.id).then((respQuota) => {
                if (respQuota) {
                  logServer(
                    `APPCLIENT - NEXTCLOUD - ADD - addGroupFolder -
                    ${i18n.__('api.nextcloud.quotaSet', { folderName })}`,
                    levels.INFO,
                    scopes.SYSTEM,
                    {
                      groupName,
                      folderName,
                      respQuota,
                    },
                  );
                } else {
                  logServer(
                    `APPCLIENT - NEXTCLOUD - ERROR - addGroupFolder - ${i18n.__('api.nextcloud.quotaSetError', {
                      folderName,
                    })}`,
                    levels.ERROR,
                    scopes.SYSTEM,
                    {
                      groupName,
                      folderName,
                      respQuota,
                    },
                  );
                }
                return respQuota;
              });
            }
            logServer(
              `APPCLIENT - NEXTCLOUD - ERROR - addGroupFolder -
              ${i18n.__('api.nextcloud.permissionSetError', { folderName })}`,
              levels.ERROR,
              scopes.SYSTEM,
              {
                groupName,
                folderName,
              },
            );
            return resp;
          });
        }
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - addGroupFolder - ${i18n.__('api.nextcloud.folderAddError', { folderName })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            groupName,
            folderName,
          },
        );
        return false;
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - addGroupFolder - ${i18n.__('api.nextcloud.folderAddError', { folderName })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            groupName,
            folderName,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
        return false;
      });
  }

  removeGroupFolder(groupName) {
    return axios
      .get(`${this.appsURL}/groupfolders/folders`, {
        params: { format: 'json' },
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        if (checkFolderActive(response) && response.data.ocs.meta.status === 'ok') {
          // find groupFolder ID for groupName
          const folders = Object.values(response.data.ocs.data).filter((entry) => {
            return entry.mount_point === groupName && Object.keys(entry.groups).includes(groupName);
          });
          return Promise.all(
            folders.map((folder) => {
              // check that folder is linked to group
              return axios
                .delete(`${this.appsURL}/groupfolders/folders/${folder.id}`, {
                  params: { format: 'json' },
                  headers: {
                    Accept: 'application/json',
                    Authorization: `Basic ${this.basicAuth}`,
                    'OCS-APIRequest': true,
                  },
                })
                .then((resp) => {
                  const infos = resp.data.ocs.meta;
                  if (infos.status === 'ok') {
                    logServer(
                      `APPCLIENT - NEXTCLOUD - REMOVE - removeGroupFolder - ${i18n.__('api.nextcloud.folderRemoved', {
                        id: folder.id,
                        mount_point: folder.mount_point,
                      })}`,
                      levels.INFO,
                      scopes.SYSTEM,
                      {
                        id: folder.id,
                        mount_point: folder.mount_point,
                        groupName,
                      },
                    );
                    return true;
                  }
                  logServer(
                    `APPCLIENT - NEXTCLOUD - ERROR - removeGroupFolder - ${i18n.__('api.nextcloud.folderRemoveError', {
                      id: folder.id,
                      message: infos.message,
                    })}`,
                    levels.ERROR,
                    scopes.SYSTEM,
                    {
                      id: folder.id,
                      groupName,
                      message: infos.message,
                    },
                  );
                  return false;
                });
            }),
          ).then((responses) => !responses.includes(false));
        }
        return false;
      });
  }

  removeGroup(groupName) {
    return axios
      .delete(`${this.nextURL}/groups/${groupName}`, {
        headers: {
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status === 'ok') {
          logServer(
            `APPCLIENT - NEXTCLOUD - REMOVE - removeGroup - ${i18n.__('api.nextcloud.groupRemoved', { groupName })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              groupName,
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
            },
          );
        } else {
          logServer(
<<<<<<< HEAD
            `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.userKicked')}`,
            levels.INFO,
=======
            `APPCLIENT - NEXTCLOUD - ERROR - removeGroup - ${i18n.__('api.nextcloud.groupRemoved', { groupName })}`,
            levels.ERROR,
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
            scopes.SYSTEM,
            {
              username: user.username,
              circleId,
            },
          );
        }
<<<<<<< HEAD
      } else {
        logServer(
          `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.notMember')}`,
=======
        return infos.status === 'ok';
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - removeGroup - ${i18n.__('api.nextcloud.groupRemoveError', { groupName })}`,
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
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
<<<<<<< HEAD
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
=======
      this.userExists(user.username, user.nclocator).then((resExists) => {
        if (resExists === false) {
          const ncData = {
            userid: user.username,
            password: '',
            email: user.emails ? user.emails[0].address : '',
            displayName: `${user.firstName} ${user.lastName}`,
            language: user.language,
          };
          this._addUser(ncData, user.nclocator);
        }
      });
    }
  }

  _addUser(userData, ncURL = this.ncURL) {
    const userId = userData.userid;
    return axios
      .post(`${ocsUrl(ncURL)}/users`, userData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
      })
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status === 'ok') {
          logServer(
            `APPCLIENT - NEXTCLOUD - ADD - _addUser - ${i18n.__('api.nextcloud.userAdded', { userId, ncURL })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              userData,
              userId,
              ncURL,
            },
          );
        } else {
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
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
<<<<<<< HEAD
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
=======
        }
        return infos.status === 'ok' ? infos.status : infos.message;
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - ERROR - _addUser - ${i18n.__('api.nextcloud.userAddError', { userId })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            userData,
            userId,
            ncURL,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
        return i18n.__('api.nextcloud.userAddError', { userId });
      });
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
  }
}

if (Meteor.isServer && nextcloudPlugin && nextcloudPlugin.enable) {
  const nextClient = new NextcloudClient();
  // check that api is accessible and circles application is active
  nextClient.checkConfig();

  Meteor.afterMethod('groups.createGroup', async function nextCreateGroup({ plugins }) {
    if (!this.error) {
      if (plugins.nextcloud === true) {
<<<<<<< HEAD
        const groupId = this.result;
        const group = Groups.findOne({ _id: groupId });
        // create nextcloud circle and share, invite group members/animators to circle
        const circleId = await nextClient.ensureCircle(group);
        if (circleId) {
          nextClient.ensureShare(group, circleId);
          nextClient.inviteMembers(group, circleId);
        }
=======
        // create associated group in Nextcloud
        nextClient.addGroup(name).then((response) => {
          if (response === 'ok') {
            nextClient.addGroupFolder(name, name).then((res) => {
              if (res === false) logServer(i18n.__('api.nextcloud.addGroupFolderError'), 'error', this.userId);
            });
          } else {
            const msg =
              response === 'group exists'
                ? i18n.__('api.nextcloud.groupExists')
                : i18n.__('api.nextcloud.addGroupError');
            logServer(
              `APPCLIENT - NEXTCLOUD - ERROR - groups.createGroup - ${i18n.__(msg)}`,
              levels.ERROR,
              scopes.SYSTEM,
              {
                userId: this.userId,
              },
            );
          }
        });
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
      }
    }
  });

  Meteor.afterMethod('groups.removeGroup', function nextRemoveGroup({ groupId }) {
    if (!this.error) {
      const groupData = this.result;
      const isAdmin = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
      if (isAdmin || this.userId === groupData.owner) {
        if (groupData.plugins.nextcloud === true) {
<<<<<<< HEAD
          // remove circle and share folder group from nextcloud
          nextClient.deleteCircle(groupData);
          nextClient.deleteFolder(groupData);
=======
          // remove group from nextcloud if it exists
          nextClient.groupExists(groupData.name).then((resExists) => {
            if (resExists) {
              nextClient.removeGroupFolder(groupData.name).then((response) => {
                if (response)
                  nextClient.removeGroup(groupData.name).then((res) => {
                    if (res === false) {
                      logServer(
                        `APPCLIENT - NEXTCLOUD - ERROR - groups.removeGroup - ${i18n.__(
                          'api.nextcloud.removeGroupError',
                        )}`,
                        levels.ERROR,
                        scopes.SYSTEM,
                        {
                          groupId,
                          userId: this.userId,
                        },
                      );
                    }
                  });
                else {
                  logServer(
                    `APPCLIENT - NEXTCLOUD - ERROR - groups.removeGroup - ${i18n.__(
                      'api.nextcloud.removeGroupFolderError',
                    )}`,
                    levels.ERROR,
                    scopes.SYSTEM,
                    {
                      groupId,
                      userId: this.userId,
                    },
                  );
                }
              });
            }
          });
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
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
<<<<<<< HEAD
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
=======
        nextClient.groupExists(groupName).then((resExists) => {
          if (resExists === false) {
            nextClient.addGroup(groupName).then((response) => {
              if (response === 'ok') {
                nextClient.addGroupFolder(groupName, groupName).then((res) => {
                  if (res === false) logServer(i18n.__('api.nextcloud.addGroupFolderError'), 'error', this.userId);
                });
              } else {
                const msg =
                  response === 'group exists'
                    ? i18n.__('api.nextcloud.groupExists')
                    : i18n.__('api.nextcloud.addGroupError');
                logServer(
                  `APPCLIENT - NEXTCLOUD - ERROR - groups.updateGroup - ${i18n.__(msg)}`,
                  levels.ERROR,
                  scopes.SYSTEM,
                  {
                    userId: this.userId,
                    response,
                  },
                );
              }
            });
          }
        });
>>>>>>> 728da50d (feat(logs): rework logs and delete unwanted comments)
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
