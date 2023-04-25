import axios from 'axios';
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

function checkCirclesActive(response) {
  // checks that 'Circles' API is responding
  if (response.data === undefined || response.data.ocs === undefined) {
    logServer(
      `APPCLIENT - NEXTCLOUD - checkFolderActive - ${i18n.__('api.nextcloud.circlesInactive')}`,
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
    this.ncURL = (nextcloudPlugin && nextcloudPlugin.URL) || '';
    this.ncUser = (nextcloud && nextcloud.nextcloudUser) || '';
    const ncPassword = (nextcloud && nextcloud.nextcloudPassword) || '';
    this.nextURL = ocsUrl(this.ncURL);
    this.appsURL = testUrl(`${this.ncURL}/ocs/v2.php/apps`);
    this.basicAuth = Buffer.from(`${this.ncUser}:${ncPassword}`, 'binary').toString('base64');
    this.ocsHeaders = {
      Accept: 'application/json',
      Authorization: `Basic ${this.basicAuth}`,
      'OCS-APIRequest': true,
    };

    this.ocsPostHeaders = {
      ...this.ocsHeaders,
      'Content-Type': 'application/json',
    };
  }

  userExists(userId, ncURL = this.ncURL) {
    return axios
      .get(`${ocsUrl(ncURL)}/users`, {
        params: {
          search: userId,
        },
        headers: this.ocsHeaders,
      })
      .then((response) => {
        return response.data.ocs.data.users.includes(userId);
      })
      .catch((error) => {
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
    logServer(
      `APPCLIENT - NEXTCLOUD - checkConfig - ${i18n.__('api.nextcloud.checkConfig', { URL: this.nextURL })}`,
      levels.INFO,
      scopes.SYSTEM,
      {
        URL: this.nextURL,
      },
    );
    return axios
      .get(`${this.appsURL}/circles/circles`, {
        headers: this.ocsHeaders,
      })
      .then((response) => {
        if (checkCirclesActive(response) === true) {
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

  _configureCircle(circleId) {
    const params = { value: 40960 };
    return axios
      .put(`${this.appsURL}/circles/circles/${circleId}/config`, params, { headers: this.ocsPostHeaders })
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status !== 'ok') {
          logServer(
            `APPCLIENT - NEXTCLOUD - _configureCircle - ${i18n.__('api.nextcloud.configureCircleError')}`,
            levels.ERROR,
            scopes.SYSTEM,
            { circleId },
          );
        }
        return circleId;
      });
  }

  ensureCircle(groupId) {
    const group = Groups.findOne(groupId);
    if (!group.circleId) {
      const params = { name: group.name, personal: false, local: false };
      return axios
        .post(`${this.appsURL}/circles/circles`, params, { headers: this.ocsPostHeaders })
        .then((response) => {
          const infos = response.data.ocs.meta;
          if (infos.status === 'ok') {
            const circleId = response.data.ocs.data.id;
            logServer(
              `APPCLIENT - NEXTCLOUD - ensureCircle - ${i18n.__('api.nextcloud.circleAdded')}`,
              levels.INFO,
              scopes.SYSTEM,
              {
                name: group.name,
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
              name: group.name,
              error: infos.message,
            },
          );
          return null;
        })
        .catch((error) => {
          logServer(
            `APPCLIENT - NEXTCLOUD - ensureCircle - ${i18n.__('api.nextcloud.circleAddError', { groupId })}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              name: group.name,
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
          return null;
        });
    }
    return group.circleId;
  }

  ensureShare(groupId, circleId) {
    // ensures that a group share exists and is associated to group circle
    const group = Groups.findOne(groupId);
    if (!group.shareId) {
      const shareName = `groupe_${group.name}`;
      return axios({
        method: 'mkcol',
        url: `${this.ncURL}/remote.php/dav/files/${this.ncUser}/${shareName}`,
        headers: this.ocsHeaders,
      })
        .then((resp) => {
          if (resp.statusText !== 'Created') {
            logServer(
              `APPCLIENT - NEXTCLOUD - ensureShare - ${i18n.__('api.nextcloud.shareCreateError', { groupId })}`,
              levels.ERROR,
              scopes.SYSTEM,
              {
                name: shareName,
                error: resp.error ? resp.error : resp,
              },
            );
          }
          const params = { password: null, path: shareName, permissions: 31, shareType: 7, shareWith: circleId };
          return axios
            .post(`${this.appsURL}/files_sharing/api/v1/shares`, params, { headers: this.ocsPostHeaders })
            .then((response) => {
              const infos = response.data.ocs.meta;
              if (infos.status === 'ok') {
                const shareId = response.data.ocs.data.id;
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
                  error: infos.message,
                },
              );
              return null;
            });
        })
        .catch((error) => {
          logServer(
            `APPCLIENT - NEXTCLOUD - ensureShare - ${i18n.__('api.nextcloud.shareAddError', { groupId })}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
          return null;
        });
    }
    return group.shareId;
  }

  deleteCircle(group) {
    if (group.circleId) {
      axios
        .delete(`${this.appsURL}/circles/circles/${group.circleId}`, { headers: this.ocsHeaders })
        .then((response) => {
          const infos = response.data.ocs.meta;
          if (infos.status === 'ok') {
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
                error: infos.message,
              },
            );
          }
        })
        .catch((error) => {
          logServer(
            `APPCLIENT - NEXTCLOUD - deleteCircle - ${i18n.__('api.nextcloud.circleDeleteError')}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              circleId: group.circleId,
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
          return null;
        });
    }
  }

  deleteFolder(group) {
    const shareName = `groupe_${group.name}`;
    return axios({
      method: 'delete',
      url: `${this.ncURL}/remote.php/dav/files/${this.ncUser}/${shareName}`,
      headers: this.ocsHeaders,
    })
      .then(() => {
        logServer(
          `APPCLIENT - NEXTCLOUD - deleteFolder - ${i18n.__('api.nextcloud.folderDeleted')}`,
          levels.INFO,
          scopes.SYSTEM,
          {
            path: shareName,
          },
        );
        Groups.update({ _id: group._id }, { $unset: { shareId: 1 } });
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - deleteFolder - ${i18n.__('api.nextcloud.folderDeleteError')}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            path: shareName,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
      });
  }

  inviteUser(userId, group) {
    const user = Meteor.users.findOne(userId);
    const { circleId } = group;
    if (user.nclocator) {
      const params = { type: 1, userId: `${user.username}@${user.nclocator}` };
      axios
        .post(`${this.appsURL}/circles/circles/${circleId}/members`, params, { headers: this.ocsPostHeaders })
        .then((response) => {
          const infos = response.data.ocs.meta;
          if (infos.status === 'ok') {
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
                circleId: group.circleId,
                error: infos.message,
              },
            );
          }
        })
        .catch((error) => {
          logServer(
            `APPCLIENT - NEXTCLOUD - inviteUser - ${i18n.__('api.nextcloud.userInviteError')}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              user: `${user.username}@${user.nclocator}`,
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
        });
    }
  }

  inviteMembers(group, circleId) {
    const userIds = [...group.members, ...group.animators];
    const allUsers = Meteor.users.find({ _id: { $in: userIds } }, { fields: { username: 1, nclocator: 1 } }).fetch();
    const params = {
      members: allUsers.map((user) => {
        return { type: 1, id: `${user.username}@${user.nclocator}` };
      }),
    };
    axios
      .post(`${this.appsURL}/circles/circles/${circleId}/members/multi`, params, { headers: this.ocsPostHeaders })
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status !== 'ok') {
          logServer(
            `APPCLIENT - NEXTCLOUD - inviteMembers - ${i18n.__('api.nextcloud.userInviteError')}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              groupId: group._id,
              error: infos.message,
            },
          );
        }
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - inviteMembers - ${i18n.__('api.nextcloud.userInviteError')}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            groupId: group._id,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
      });
  }

  kickUser(userId, group) {
    const user = Meteor.users.findOne(userId);
    const { circleId } = group;
    axios
      .get(`${this.appsURL}/circles/circles/${circleId}/members`, { headers: this.ocsHeaders })
      .then((response) => {
        const infos = response.data.ocs.meta;
        if (infos.status !== 'ok') {
          logServer(
            `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.userKickError')}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              user: user.username,
              error: infos.message,
            },
          );
        } else {
          // find user memberId in circle
          // XXX FIXME: check on a federated instance if match is for username or username@nclocator
          const member = response.data.ocs.data.find((item) => item.userId === user.username);
          if (member !== undefined) {
            // remove member from circle
            axios
              .delete(`${this.appsURL}/circles/circles/${circleId}/members/${member.id}`, {
                headers: this.ocsHeaders,
              })
              .then((resp) => {
                const respInfos = resp.data.ocs.meta;
                if (respInfos.status !== 'ok') {
                  logServer(
                    `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.userKickError')}`,
                    levels.ERROR,
                    scopes.SYSTEM,
                    {
                      user: user.username,
                      error: respInfos.message,
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
              });
          }
        }
      })
      .catch((error) => {
        logServer(
          `APPCLIENT - NEXTCLOUD - kickUser - ${i18n.__('api.nextcloud.userKickError')}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            user: user.username,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
      });
  }

  addUser(userId) {
    const user = Meteor.users.findOne(userId);
    if (!user.nclocator) {
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
        headers: this.ocsPostHeaders,
      })
      .then((response) => {
        const infos = response.data.ocs.meta;
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
        return infos.status === 'ok' ? infos.status : infos.message;
      })
      .catch((error) => {
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
  // check that api is accessible and circles application is active
  nextClient.checkConfig();

  Meteor.afterMethod('groups.createGroup', function nextCreateGroup({ plugins }) {
    if (!this.error) {
      if (plugins.nextcloud === true) {
        const groupId = this.result;
        nextClient.ensureCircle(groupId).then((circleId) => {
          if (circleId) nextClient.ensureShare(groupId, circleId);
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
          // remove circle and share folder group from nextcloud
          nextClient.deleteCircle(groupData);
          nextClient.deleteFolder(groupData);
        }
      }
    }
  });

  Meteor.afterMethod('groups.updateGroup', function nextUpdateGroup({ groupId }) {
    if (!this.error) {
      const group = Groups.findOne({ _id: groupId });
      if (group.plugins.nextcloud === true && !group.circleId) {
        // create nextcloud circle and share if needed
        nextClient.ensureCircle(groupId).then((circleId) => {
          if (circleId) {
            nextClient.ensureShare(groupId, circleId);
            // add all group members to circle
            nextClient.inviteMembers(group, circleId);
          }
        });
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
