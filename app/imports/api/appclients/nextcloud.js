import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import Groups from '../groups/groups';
import { isActive, testUrl } from '../utils';
import logServer, { levels, scopes } from '../logging';

const nextcloudPlugin = Meteor.settings.public.groupPlugins.nextcloud;
const { nextcloud } = Meteor.settings;

function ocsUrl(ncURL) {
  const origin = testUrl(ncURL);
  return new URL('/ocs/v1.php/cloud', origin).href;
}

function checkFolderActive(response) {
  // checks that 'Group Folder' API is responding
  if (response.data === undefined || response.data.ocs === undefined) {
    // logServer(i18n.__('api.nextcloud.groupFoldersInactive'), 'error');
    logServer(
      `APPCLIENT - NEXTCLOUD - checkFolderActive - ${i18n.__('api.nextcloud.groupFoldersInactive')}`,
      levels.ERROR,
      scopes.SYSTEM,
      {},
    );
    return false;
  }
  return true;
}

class NextcloudClient {
  constructor() {
    const ncURL = (nextcloudPlugin && nextcloudPlugin.URL) || '';
    const ncUser = (nextcloud && nextcloud.nextcloudUser) || '';
    const ncPassword = (nextcloud && nextcloud.nextcloudPassword) || '';
    this.nextURL = ocsUrl(ncURL);
    this.appsURL = testUrl(`${ncURL}/apps`);
    this.basicAuth = Buffer.from(`${ncUser}:${ncPassword}`, 'binary').toString('base64');
  }

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
        // logServer(i18n.__('api.nextcloud.groupNotFound', { groupName }), 'error');
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - groupExists - ${i18n.__('api.nextcloud.groupNotFound', { groupName })}`,
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
        // logServer(i18n.__('api.nextcloud.apiError', { groupName: userId }), 'error');
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - userExists - ${i18n.__('api.nextcloud.apiError', { groupName: userId })}`,
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
    // logServer(i18n.__('api.nextcloud.checkConfig', { URL: this.nextURL }));
    logServer(
      `APPCLIENT - NEXTCLOUD - checkConfig - ${i18n.__('api.nextcloud.checkConfig', { URL: this.nextURL })}`,
      levels.INFO,
      scopes.SYSTEM,
      {
        URL: this.nextURL,
      },
    );
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
        if (checkFolderActive(response) === true) {
          // logServer(i18n.__('api.nextcloud.configOk'));
          logServer(
            `APPCLIENT - NEXTCLOUD - checkConfig - ${i18n.__('api.nextcloud.configOk')}`,
            levels.INFO,
            scopes.SYSTEM,
            {},
          );
          return true;
        }
        return false;
      })
      .catch((error) => {
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        // logServer(i18n.__('api.nextcloud.badConfig'), 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - checkConfig - ${i18n.__('api.nextcloud.badConfig')}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            error: error.response && error.response.data ? error.response.data : error,
          },
        );

        return false;
      });
  }

  addGroup(groupName) {
    return axios
      .post(
        `${this.nextURL}/groups`,
        {
          groupid: groupName,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.basicAuth}`,
            'OCS-APIRequest': true,
          },
        },
      )
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status === 'ok') {
          // logServer(i18n.__('api.nextcloud.groupAdded', { groupName }));
          logServer(
            `APPCLIENT - NEXTCLOUD - addGroup - ${i18n.__('api.nextcloud.groupAdded', { groupName })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              groupName,
            },
          );
        } else {
          // logServer(
          //   `${i18n.__('api.nextcloud.groupAddError', { groupName })} (${infos.statuscode} - ${infos.message})`,
          //   'error',
          // );
          logServer(
            `APPCLIENT - NEXTCLOUD - addGroup - ${i18n.__('api.nextcloud.groupAddError', { groupName })} (${
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
        // logServer(i18n.__('api.nextcloud.groupAddError', { groupName }), 'error');
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - addGroup - ${i18n.__('api.nextcloud.groupAddError', { groupName })}`,
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
        // logServer(i18n.__('api.nextcloud.groupFolderAssignError', { groupName, folderName }), 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - _addGroupToFolder - ${i18n.__('api.nextcloud.groupFolderAssignError', {
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
          // logServer(i18n.__('api.nextcloud.groupFolderAdded', { folderName }));
          logServer(
            `APPCLIENT - NEXTCLOUD - addGroupFolder - ${i18n.__('api.nextcloud.groupFolderAdded', { folderName })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              groupName,
              folderName,
            },
          );
          return this._addGroupToFolder(groupName, folderName, response.data.ocs.data.id).then((resp) => {
            if (resp === true) {
              // logServer(i18n.__('api.nextcloud.permissionsSet', { folderName }));
              logServer(
                `APPCLIENT - NEXTCLOUD - addGroupFolder - ${i18n.__('api.nextcloud.permissionsSet', { folderName })}`,
                levels.INFO,
                scopes.SYSTEM,
                {
                  groupName,
                  folderName,
                },
              );
              return this._addQuotaToFolder(response.data.ocs.data.id).then((respQuota) => {
                if (respQuota) {
                  // logServer(i18n.__('api.nextcloud.quotaSet', { folderName }));
                  logServer(
                    `APPCLIENT - NEXTCLOUD - addGroupFolder - ${i18n.__('api.nextcloud.quotaSet', { folderName })}`,
                    levels.INFO,
                    scopes.SYSTEM,
                    {
                      groupName,
                      folderName,
                      respQuota,
                    },
                  );
                } else {
                  // logServer(i18n.__('api.nextcloud.quotaSetError', { folderName }), 'error');
                  logServer(
                    `APPCLIENT - NEXTCLOUD - addGroupFolder - ${i18n.__('api.nextcloud.quotaSetError', {
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
            // logServer(i18n.__('api.nextcloud.permissionSetError', { folderName }), 'error');
            logServer(
              `APPCLIENT - NEXTCLOUD - addGroupFolder - ${i18n.__('api.nextcloud.permissionSetError', { folderName })}`,
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
        // logServer(i18n.__('api.nextcloud.folderAddError', { folderName }), 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - addGroupFolder - ${i18n.__('api.nextcloud.folderAddError', { folderName })}`,
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
        // logServer(i18n.__('api.nextcloud.folderAddError', { folderName }), 'error');
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - addGroupFolder - ${i18n.__('api.nextcloud.folderAddError', { folderName })}`,
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
                    // logServer(
                    //   i18n.__('api.nextcloud.folderRemoved', { id: folder.id, mount_point: folder.mount_point }),
                    // );
                    logServer(
                      `APPCLIENT - NEXTCLOUD - removeGroupFolder - ${i18n.__('api.nextcloud.folderRemoved', {
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
                  // logServer(
                  //   i18n.__('api.nextcloud.folderRemoveError', { id: folder.id, message: infos.message }),
                  //   'error',
                  // );
                  logServer(
                    `APPCLIENT - NEXTCLOUD - removeGroupFolder - ${i18n.__('api.nextcloud.folderRemoveError', {
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
          // logServer(i18n.__('api.nextcloud.groupRemoved', { groupName }));
          logServer(
            `APPCLIENT - NEXTCLOUD - removeGroup - ${i18n.__('api.nextcloud.groupRemoved', { groupName })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              groupName,
            },
          );
        } else {
          // logServer(`${i18n.__('api.nextcloud.groupRemoveError', { groupName })} (${infos.message})`, 'error');
          logServer(
            `APPCLIENT - NEXTCLOUD - removeGroup - ${i18n.__('api.nextcloud.groupRemoved', { groupName })}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              groupName,
              infos: infos.message,
            },
          );
        }
        return infos.status === 'ok';
      })
      .catch((error) => {
        // logServer(i18n.__('api.nextcloud.groupRemoveError', { groupName }), 'error');
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - removeGroup - ${i18n.__('api.nextcloud.groupRemoveError', { groupName })}`,
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

  addUser(userId) {
    const user = Meteor.users.findOne(userId);
    if (!user.nclocator) {
      // logServer(i18n.__('api.nextcloud.misingNCLocator'), 'error');
      logServer(
        `APPCLIENT - NEXTCLOUD - addUser - ${i18n.__('api.nextcloud.misingNCLocator')}`,
        levels.ERROR,
        scopes.SYSTEM,
        {
          userId,
        },
      );
    } else {
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
          // logServer(i18n.__('api.nextcloud.userAdded', { userId, ncURL }));
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
          // logServer(
          //   `${i18n.__('api.nextcloud.userAddError', { userId })} (${infos.statuscode} - ${infos.message})`,
          //   'error',
          // );
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
        return infos.status === 'ok' ? infos.status : infos.message;
      })
      .catch((error) => {
        // logServer(i18n.__('api.nextcloud.userAddError', { userId }), 'error');
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - NEXTCLOUD - _addUser - ${i18n.__('api.nextcloud.userAddError', { userId })}`,
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
  }
}

if (Meteor.isServer && nextcloudPlugin && nextcloudPlugin.enable) {
  const nextClient = new NextcloudClient();
  // check that api is accessible and groupFolders plugin is active
  nextClient.checkConfig();

  Meteor.afterMethod('groups.createGroup', function nextCreateGroup({ name, plugins }) {
    if (!this.error) {
      if (plugins.nextcloud === true) {
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
            // logServer(i18n.__(msg), 'error', this.userId);
            logServer(`APPCLIENT - NEXTCLOUD - groups.createGroup - ${i18n.__(msg)}`, levels.ERROR, scopes.SYSTEM, {
              userId: this.userId,
            });
          }
        });
      }
    }
  });

  Meteor.afterMethod('groups.removeGroup', function nextRemoveGroup({ groupId }) {
    if (!this.error) {
      const groupData = this.result;
      const isAdmin = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
      if (isAdmin || this.userId === groupData.owner) {
        if (groupData.plugins.nextcloud === true) {
          // remove group from nextcloud if it exists
          nextClient.groupExists(groupData.name).then((resExists) => {
            if (resExists) {
              nextClient.removeGroupFolder(groupData.name).then((response) => {
                if (response)
                  nextClient.removeGroup(groupData.name).then((res) => {
                    if (res === false) {
                      // logServer(i18n.__('api.nextcloud.removeGroupError'), 'error', this.userId)
                      logServer(
                        `APPCLIENT - NEXTCLOUD - groups.removeGroup - ${i18n.__('api.nextcloud.removeGroupError')}`,
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
                  // logServer(i18n.__('api.nextcloud.removeGroupFolderError'), 'error', this.userId)
                  logServer(
                    `APPCLIENT - NEXTCLOUD - groups.removeGroup - ${i18n.__('api.nextcloud.removeGroupFolderError')}`,
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
        }
      }
    }
  });

  Meteor.afterMethod('groups.updateGroup', function nextUpdateGroup({ groupId }) {
    if (!this.error) {
      // create nextcloud group if needed
      const group = Groups.findOne({ _id: groupId });
      const groupName = group.name;
      if (group.plugins.nextcloud === true) {
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
                // logServer(msg, 'error', this.userId);
                logServer(`APPCLIENT - NEXTCLOUD - groups.updateGroup - ${i18n.__(msg)}`, levels.ERROR, scopes.SYSTEM, {
                  userId: this.userId,
                  response,
                });
              }
            });
          }
        });
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
