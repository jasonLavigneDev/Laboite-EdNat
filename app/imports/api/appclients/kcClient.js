import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import logServer, { levels, scopes } from '../logging';
import Groups from '../groups/groups';
import AppRoles from '../users/users';
import { isActive } from '../utils';
import { testMeteorSettingsUrl } from '../../ui/utils/utilsFuncs';

const keycloakSettings = Meteor.settings.keycloak;

class KeyCloakClient {
  constructor() {
    this.kcURL = testMeteorSettingsUrl(Meteor.settings.public.keycloakUrl);
    this.kcRealm = Meteor.settings.public.keycloakRealm;
    this.clientId = null;
    this.adminsGroupId = null;
    this.token = null;
    this.refreshToken = null;
    this._ensureClientId = this._ensureClientId.bind(this);
    this._setToken = this._setToken.bind(this);
    this._setRefreshToken = this._setRefreshToken.bind(this);
    this._expire = this._expire.bind(this);
    this._expireRefresh = this._expireRefresh.bind(this);
    this._checkToken = this._checkToken.bind(this);
    // initialize client id and check that we can get tokens
    this._getToken().then((initToken) => {
      if (initToken) {
        logServer(
          `APPCLIENT - KcCLIENT - getToken -  ${i18n.__('api.keycloak.initClient')}`,
          levels.INFO,
          scopes.SYSTEM,
          {},
        );
      }
    });
  }

  _authenticate() {
    const { adminUser, adminPassword } = keycloakSettings;
    return axios.post(
      `${this.kcURL}/realms/${this.kcRealm}/protocol/openid-connect/token`,
      `username=${encodeURIComponent(adminUser)}&password=${encodeURIComponent(
        adminPassword,
      )}&grant_type=password&client_id=admin-cli`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  _refreshToken() {
    return axios.post(
      `${this.kcURL}/realms/${this.kcRealm}/protocol/openid-connect/token`,
      `refresh_token=${this.refreshToken}&grant_type=refresh_token&client_id=admin-cli`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  _expire() {
    this.token = null;
  }

  _expireRefresh() {
    this.refreshToken = null;
  }

  _setToken(token, timeout) {
    this.token = token;
    // reset this.token 5 seconds before it expires
    setTimeout(this._expire, (timeout - 5) * 1000);
  }

  _setRefreshToken(refreshToken, timeout) {
    this.refreshToken = refreshToken;
    // reset this.refreshToken 10 seconds before token expires
    setTimeout(this._expireRefresh, (timeout - 10) * 1000);
  }

  _checkToken() {
    if (this.token) return Promise.resolve(this.token);
    if (this.refreshToken)
      return this._refreshToken().then((response) => {
        const newToken = response.data.access_token;
        this._setToken(newToken, response.data.expires_in);
        this._setRefreshToken(response.data.refresh_token, response.data.refresh_expires_in);
        return newToken;
      });
    return this._authenticate().then((response) => {
      // logServer('Keycloak : new access token received');
      logServer(
        `APPCLIENT - KcCLIENT - _checkToken -  Keycloak : new access token received'`,
        levels.INFO,
        scopes.SYSTEM,
        {},
      );
      const newToken = response.data.access_token;
      this._setToken(newToken, response.data.expires_in);
      this._setRefreshToken(response.data.refresh_token, response.data.refresh_expires_in);
      return newToken;
    });
  }

  _getToken() {
    return this._checkToken()
      .then((newToken) => {
        // check that clientId is set in case keycloak was not available at startup
        return this._ensureClientId(newToken)
          .then(() => this._ensureAdminsId(newToken))
          .then(() => Promise.resolve(newToken));
      })
      .catch((error) => {
        // logServer(i18n.__('api.keycloak.tokenError'), 'error');
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - KcCLIENT - _getToken - ${i18n.__('api.keycloak.tokenError')}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
        return null;
      });
  }

  _ensureClientId(token) {
    if (this.clientId === null) {
      return axios
        .get(`${this.kcURL}/admin/realms/${this.kcRealm}/clients`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          this.clientId = response.data.find((client) => client.clientId === keycloakSettings.client).id;
          // logServer(i18n.__('api.keycloak.clientIdFound', { clientId: this.clientId }));
          logServer(
            `APPCLIENT - KcCLIENT - _ensureClientId - ${i18n.__('api.keycloak.clientIdFound', {
              clientId: this.clientId,
            })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              clientId: this.clientId,
            },
          );
          return this.clientId;
        })
        .catch((error) => {
          // logServer(i18n.__('api.keycloak.clientIdError'), 'error');
          // logServer(error.response && error.response.data ? error.response.data : error, 'error');
          logServer(
            `APPCLIENT - KcCLIENT - _ensureClientId - ${i18n.__('api.keycloak.clientIdError')}`,
            levels.ERROR,
            scopes.SYSTEM,
            {
              clientId: this.clientId,
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
          return null;
        });
    }
    return Promise.resolve(this.clientId);
  }

  _ensureAdminsId(token) {
    if (this.adminsGroupId === null) {
      return this._getGroupId('admins', token).then((groupId) => {
        if (groupId) {
          this.adminsGroupId = groupId;
          return this.adminsGroupId;
        }
        return this._addGroup('admins', token)
          .then(() => this._getGroupId('admins', token))
          .then((newGroupId) => {
            this.adminsGroupId = newGroupId;
            return this.adminsGroupId;
          });
      });
    }
    return Promise.resolve(this.adminsGroupId);
  }

  _getGroupId(name, token) {
    return axios
      .get(`${this.kcURL}/admin/realms/${this.kcRealm}/groups`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const kcGroup = response.data.find((elem) => elem.name === name);
        return kcGroup === undefined ? undefined : kcGroup.id;
      });
  }

  _getRoleId(name, token) {
    return axios
      .get(`${this.kcURL}/admin/realms/${this.kcRealm}/clients/${this.clientId}/roles`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const kcRole = response.data.find((elem) => elem.name === name);
        return kcRole === undefined ? undefined : kcRole.id;
      });
  }

  _addRole(name, token) {
    return axios.post(
      `${this.kcURL}/admin/realms/${this.kcRealm}/clients/${this.clientId}/roles`,
      {
        name,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  _addRoleToGroup(groupId, groupName, token) {
    return this._getRoleId(groupName, token).then((roleId) =>
      axios.post(
        `${this.kcURL}/admin/realms/${this.kcRealm}/groups/${groupId}/role-mappings/clients/${this.clientId}`,
        [{ name: groupName, id: roleId }],
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );
  }

  _addGroup(groupName, token) {
    return this._addRole(groupName, token).then(() => {
      return axios
        .post(
          `${this.kcURL}/admin/realms/${this.kcRealm}/groups`,
          {
            name: groupName,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(() => this._getGroupId(groupName, token))
        .then((groupId) => {
          // logServer(i18n.__('api.keycloak.groupAdded', { groupName, groupId }));
          logServer(
            `APPCLIENT - KcCLIENT - _addGroup - ${i18n.__('api.keycloak.groupAdded', { groupName, groupId })}`,
            levels.INFO,
            scopes.SYSTEM,
            {
              groupName,
              groupId,
            },
          );
          return this._addRoleToGroup(groupId, groupName, token);
        });
    });
  }

  addGroupWithRoles(name, callerId) {
    AppRoles.filter((role) => role !== 'candidate').forEach((role) => {
      const groupName = `${role}_${name}`;
      this._getToken().then((token) => {
        this._addGroup(groupName, token).catch((error) => {
          // logServer(i18n.__('api.keycloak.groupAddError', { groupName }), 'error', callerId);
          // logServer(error.response && error.response.data ? error.response.data : error, 'error');
          logServer(
            `APPCLIENT - KcCLIENT - addGroupWithRoles - ${i18n.__('api.keycloak.groupAddError', { groupName })}`,
            levels.ERROR,
            scopes.USER,
            {
              groupName,
              callerId,
              name,
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
        });
      });
    });
  }

  addGroup(name, callerId) {
    const user = Meteor.users.findOne(callerId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    this._getToken().then((token) => {
      this._addGroup(name, token)
        .then(() => {
          if (keycloakId) {
            return this._setRole(callerId, keycloakId, name);
          }
          return null;
        })
        .catch((error) => {
          // logServer(i18n.__('api.keycloak.groupAddError', { groupName: name }), 'error', callerId);
          // logServer(error.response && error.response.data ? error.response.data : error, 'error');
          logServer(
            `APPCLIENT - KcCLIENT - addGroup - ${i18n.__('api.keycloak.groupAddError', { groupName: name })}`,
            levels.ERROR,
            scopes.USER,
            {
              groupName: name,
              callerId,
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
        });
    });
  }

  _removeRole(name, token) {
    return axios.delete(`${this.kcURL}/admin/realms/${this.kcRealm}/clients/${this.clientId}/roles/${name}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  _updateGroup(oldName, groupName, callerId) {
    this._getToken()
      .then((token) => {
        // search group id
        return this._getGroupId(oldName, token).then((groupId) => {
          if (groupId === undefined) {
            // logServer(i18n.__('api.keycloak.groupNotFound', { groupName: oldName }), 'error', callerId);
            logServer(
              `APPCLIENT - KcCLIENT - _updateGroup - ${i18n.__('api.keycloak.groupNotFound', { groupName: oldName })}`,
              levels.ERROR,
              scopes.USER,
              {
                groupName,
                oldName,
                callerId,
              },
            );
            return null;
          }
          // delete associated role
          return this._removeRole(oldName, token).then(() => {
            // update group
            return axios
              .put(
                `${this.kcURL}/admin/realms/${this.kcRealm}/groups/${groupId}`,
                { name: groupName },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                },
              )
              .then(() => this._addRole(groupName, token))
              .then(() =>
                this._addRoleToGroup(groupId, groupName, token).then(() => {
                  // logServer(i18n.__('api.keycloak.groupNameChanged', { oldName, newName: groupName }));
                  logServer(
                    `APPCLIENT - KcCLIENT - _updateGroup - ${i18n.__('api.keycloak.groupNameChanged', {
                      oldName,
                      newName: groupName,
                    })}`,
                    levels.INFO,
                    scopes.USER,
                    {
                      groupName,
                      groupId,
                      oldName,
                      callerId,
                    },
                  );
                }),
              );
          });
        });
      })
      .catch((error) => {
        // logServer(i18n.__('api.keycoak.groupUpdateError', { groupName: oldName }), 'error', callerId);
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - KcCLIENT - _updateGroup - ${i18n.__('api.keycoak.groupUpdateError', { groupName: oldName })}`,
          levels.ERROR,
          scopes.USER,
          {
            groupName,
            callerId,
            oldName,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
      });
  }

  updateGroupWithRoles(oldName, groupName, callerId) {
    AppRoles.filter((role) => role !== 'candidate').forEach((role) => {
      const oldRole = `${role}_${oldName}`;
      const newRole = `${role}_${groupName}`;
      this._updateGroup(oldRole, newRole, callerId);
    });
  }

  updateGroup(oldName, groupName, callerId) {
    this._updateGroup(oldName, groupName, callerId);
  }

  _removeGroup(groupName, callerId) {
    this._getToken()
      .then((token) => {
        // search group id
        return this._getGroupId(groupName, token).then((groupId) => {
          if (groupId === undefined) {
            // logServer(i18n.__('api.keycloak.groupNotFound', { groupName }), 'error', callerId);
            logServer(
              `APPCLIENT - KcCLIENT - _removeGroup - ${i18n.__('api.keycloak.groupNotFound', { groupName })}`,
              levels.ERROR,
              scopes.USER,
              {
                groupName,
                callerId,
              },
            );
            return null;
          }
          // delete associated role
          return this._removeRole(groupName, token).then(() => {
            // delete group
            return axios
              .delete(`${this.kcURL}/admin/realms/${this.kcRealm}/groups/${groupId}`, {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => logServer(i18n.__('api.keycloak.groupRemoved', { groupName })));
          });
        });
      })
      .catch((error) => {
        // logServer(i18n.__('api.keycloak.groupRemoveError', { groupName }), 'error', callerId);
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(
          `APPCLIENT - KcCLIENT - _removeGroup - ${i18n.__('api.keycloak.groupRemoveError', { groupName })}`,
          levels.ERROR,
          scopes.USER,
          {
            groupName,
            callerId,
            error: error.response && error.response.data ? error.response.data : error,
          },
        );
      });
  }

  removeGroupWithRoles(group, callerId) {
    AppRoles.filter((role) => role !== 'candidate').forEach((role) => {
      const groupName = `${role}_${group.name}`;
      this._removeGroup(groupName, callerId);
    });
  }

  removeGroup(name, callerId) {
    this._removeGroup(name, callerId);
  }

  setAdmin(userId, callerId, groupName = `admins`) {
    const user = Meteor.users.findOne(userId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    if (keycloakId) {
      this._getToken()
        .then((token) =>
          this._getGroupId(groupName, token).then((groupId) => {
            return axios
              .put(`${this.kcURL}/admin/realms/${this.kcRealm}/users/${keycloakId}/groups/${groupId}`, '', {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                if (groupName === 'adminStructure') {
                  // logServer(i18n.__('api.keycloak.adminStructureAdded', { userId }));
                  logServer(
                    `APPCLIENT - KcCLIENT - setAdmin - ${i18n.__('api.keycloak.adminStructureAdded', { userId })}`,
                    levels.INFO,
                    scopes.USER,
                    {
                      userId,
                      callerId,
                      groupName,
                    },
                  );
                } else {
                  // logServer(i18n.__('api.keycloak.adminAdded', { userId }));
                  logServer(
                    `APPCLIENT - KcCLIENT - setAdmin - ${i18n.__('api.keycloak.adminAdded', { userId })}`,
                    levels.INFO,
                    scopes.USER,
                    {
                      userId,
                      callerId,
                      groupName,
                    },
                  );
                }
              });
          }),
        )
        .catch((error) => {
          if (groupName === 'adminStructure') {
            // logServer(i18n.__('api.keycloak.addAdminStructureError', { userId }), 'error', callerId);
            logServer(
              `APPCLIENT - KcCLIENT - setAdmin - ${i18n.__('api.keycloak.addAdminStructureError', { userId })}`,
              levels.ERROR,
              scopes.USER,
              {
                userId,
                callerId,
                groupName,
                error: error?.response ?? 'error',
              },
            );
          } else {
            // logServer(i18n.__('api.keycloak.addAdminError', { userId }), 'error', callerId);
            logServer(
              `APPCLIENT - KcCLIENT - setAdmin - ${i18n.__('api.keycloak.addAdminError', { userId })}`,
              levels.ERROR,
              scopes.USER,
              {
                userId,
                callerId,
                groupName,
              },
            );
          }
          // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        });
    } else {
      // logServer(i18n.__('api.keycloak.userNotFound', { userId }), 'error', callerId);
      logServer(
        `APPCLIENT - KcCLIENT - setAdmin - ${i18n.__('api.keycloak.userNotFound', { userId })}`,
        levels.ERROR,
        scopes.USER,
        {
          userId,
          callerId,
          groupName,
        },
      );
    }
  }

  unsetAdmin(userId, callerId, groupName = `admins`) {
    const user = Meteor.users.findOne(userId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    if (keycloakId) {
      this._getToken()
        .then((token) =>
          this._getGroupId(groupName, token).then((groupId) =>
            axios
              .delete(`${this.kcURL}/admin/realms/${this.kcRealm}/users/${keycloakId}/groups/${groupId}`, {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                if (groupName === 'adminStructure') {
                  // logServer(i18n.__('api.keycloak.adminStructureRemoved', { userId }));
                  logServer(
                    `APPCLIENT - KcCLIENT - unsetAdmin - ${i18n.__('api.keycloak.adminStructureRemoved', { userId })}`,
                    levels.INFO,
                    scopes.USER,
                    {
                      userId,
                      callerId,
                      groupName,
                    },
                  );
                } else {
                  // logServer(i18n.__('api.keycloak.adminRemoved', { userId }));
                  logServer(
                    `APPCLIENT - KcCLIENT - unsetAdmin - ${i18n.__('api.keycloak.adminRemoved', { userId })}`,
                    levels.INFO,
                    scopes.USER,
                    {
                      userId,
                      callerId,
                      groupName,
                    },
                  );
                }
              }),
          ),
        )
        .catch((error) => {
          // logServer(`Keycloak : ERROR removing user ${userId} from admins`, 'error', callerId);
          // logServer(error.response && error.response.data ? error.response.data : error, 'error');
          logServer(
            `APPCLIENT - KcCLIENT - unsetAdmin - Keycloak : ERROR removing user ${userId} from admins`,
            levels.ERROR,
            scopes.USER,
            {
              userId,
              callerId,
              groupName,
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
        });
    } else {
      // logServer(i18n.__('api.keycloak.userNotFound', { userId }), 'error', callerId);
      logServer(
        `APPCLIENT - KcCLIENT - unsetAdmin - ${i18n.__('api.keycloak.userNotFound', { userId })}`,
        levels.ERROR,
        scopes.USER,
        {
          userId,
          callerId,
          groupName,
        },
      );
    }
  }

  _setRole(userId, keycloakId, roleName) {
    return this._getToken().then((token) =>
      this._getGroupId(roleName, token).then((groupId) =>
        axios
          .put(`${this.kcURL}/admin/realms/${this.kcRealm}/users/${keycloakId}/groups/${groupId}`, '', {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
          .then(() => {
            // logServer(i18n.__('api.keycloak.userGroupAdded', { groupName: roleName, userId }));

            logServer('APPCLIENT - KcCLIENT - _setRole - ', levels.INFO, scopes.USER, {
              userId,
              keycloakId,
              groupName: roleName,
            });
          }),
      ),
    );
  }

  setRole(userId, roleName, callerId) {
    const user = Meteor.users.findOne(userId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    if (keycloakId) {
      this._setRole(userId, keycloakId, roleName).catch((error) => {
        // logServer(i18n.__('api.keycloak.userGroupAddError', { groupName: roleName, userId }), 'error', callerId);
        // logServer(error.response && error.response.data ? error.response.data : error, 'error');
        logServer(`APPCLIENT - KcCLIENT - setRole`, levels.ERROR, scopes.USER, {
          userId,
          groupName: roleName,
          callerId,
          error: error.response && error.response.data ? error.response.data : error,
        });
      });
    } else {
      // logServer(i18n.__('api.keycloak.userNotFound', { userId }), 'error', callerId);
      logServer(
        `APPCLIENT - KcCLIENT - setRole - ${i18n.__('api.keycloak.userNotFound', { userId })}`,
        levels.ERROR,
        scopes.USER,
        {
          userId,
          groupName: roleName,
          callerId,
        },
      );
    }
  }

  unsetRole(userId, roleName, callerId) {
    const user = Meteor.users.findOne(userId);
    const keycloakId = user.services && user.services.keycloak ? user.services.keycloak.id : null;
    if (keycloakId) {
      this._getToken()
        .then((token) =>
          this._getGroupId(roleName, token).then((groupId) =>
            axios
              .delete(`${this.kcURL}/admin/realms/${this.kcRealm}/users/${keycloakId}/groups/${groupId}`, {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                // logServer(i18n.__('api.keycloak.userGroupRemoved', { groupName: roleName, userId }));
                logServer(
                  `APPCLIENT - KcCLIENT - unsetRole - ${i18n.__('api.keycloak.userGroupRemoved', {
                    groupName: roleName,
                    userId,
                  })}`,
                  levels.INFO,
                  scopes.USER,
                  {
                    userId,
                    callerId,
                    roleName,
                  },
                );
              }),
          ),
        )
        .catch((error) => {
          // logServer(i18n.__('api.keycloak.userGroupRemoveError', { groupName: roleName, userId }), 'error', callerId);
          // logServer(error.response && error.response.data ? error.response.data : error, 'error');
          logServer(
            `APPCLIENT - KcCLIENT - unsetRole - ${i18n.__('api.keycloak.userGroupRemoveError', {
              groupName: roleName,
              userId,
            })}`,
            levels.ERROR,
            scopes.USER,
            {
              userId,
              callerId,
              roleName,
              error: error.response && error.response.data ? error.response.data : error,
            },
          );
        });
    } else {
      // logServer(i18n.__('api.keycloak.userNotFound', { userId }), 'error', callerId);
      logServer(
        `APPCLIENT - KcCLIENT - unsetRole - ${i18n.__('api.keycloak.userNotFound', { userId })}`,
        levels.ERROR,
        scopes.USER,
        {
          userId,
          callerId,
          roleName,
        },
      );
    }
  }
}

// setup client calls on methods hooks
if (Meteor.isServer) {
  const kcClient = new KeyCloakClient();

  Meteor.afterMethod('groups.createGroup', function kcCreateGroup({ name }) {
    if (!this.error) kcClient.addGroup(name, this.userId);
  });

  Meteor.afterMethod('groups.updateGroup', function kcUpdateGroup() {
    if (!this.error) {
      const [newData, oldGroup] = this.result;
      if (newData.name !== oldGroup.name) {
        kcClient.updateGroup(oldGroup.name, newData.name, this.userId);
      }
    }
  });

  Meteor.afterMethod('groups.removeGroup', function kcRemoveGroup({ groupId }) {
    if (!this.error) {
      const groupData = this.result;
      if (groupData) {
        const isAdmin = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
        if (isAdmin || this.userId === groupData.owner) kcClient.removeGroup(groupData.name, this.userId);
      }
    }
  });

  Meteor.afterMethod('groups.addGroupMembersToGroup', function kcAddGroupMembersToGroup({ groupId, anotherGroupId }) {
    if (!this.error) {
      const group = Groups.findOne({ _id: groupId });
      const group2 = Groups.findOne({ _id: anotherGroupId });

      const usersGroup = group2.members;

      usersGroup.forEach((user) => {
        if (!Roles.userIsInRole(user, 'animator', groupId)) {
          kcClient.setRole(user, group.name, this.userId);
        }
      });
    }
  });

  Meteor.afterMethod('users.setAdmin', function kcSetAdmin({ userId }) {
    if (!this.error) {
      kcClient.setAdmin(userId, this.userId);
    }
  });

  Meteor.afterMethod('users.unsetAdmin', function kcUnsetAdmin({ userId }) {
    if (!this.error) {
      kcClient.unsetAdmin(userId, this.userId);
    }
  });

  Meteor.afterMethod('users.setAdminStructure', function kcSetAdmin({ userId }) {
    if (!this.error) {
      kcClient.setAdmin(userId, this.userId, 'adminStructure');
    }
  });

  Meteor.afterMethod('users.unsetAdminStructure', function kcUnsetAdmin({ userId }) {
    if (!this.error) {
      kcClient.unsetAdmin(userId, this.userId, 'adminStructure');
    }
  });

  Meteor.afterMethod('users.setAnimatorOf', function kcSetAnimator({ userId, groupId }) {
    if (!this.error) {
      // there is no difference between member and animator roles in keycloak
      if (!Roles.userIsInRole(userId, 'member', groupId)) {
        const group = Groups.findOne({ _id: groupId });
        kcClient.setRole(userId, group.name, this.userId);
      }
    }
  });

  Meteor.afterMethod('users.unsetAnimatorOf', function kcUnsetAnimator({ userId, groupId }) {
    if (!this.error) {
      if (!Roles.userIsInRole(userId, 'member', groupId)) {
        const group = Groups.findOne({ _id: groupId });
        kcClient.unsetRole(userId, group.name, this.userId);
      }
    }
  });

  Meteor.afterMethod('users.setMemberOf', function kcSetMember({ userId, groupId }) {
    if (!this.error) {
      if (!Roles.userIsInRole(userId, 'animator', groupId)) {
        const group = Groups.findOne({ _id: groupId });
        kcClient.setRole(userId, group.name, this.userId);
      }
    }
  });

  Meteor.afterMethod('users.unsetMemberOf', function kcUnsetMember({ userId, groupId }) {
    if (!this.error) {
      if (!Roles.userIsInRole(userId, 'animator', groupId)) {
        const group = Groups.findOne({ _id: groupId });
        kcClient.unsetRole(userId, group.name, this.userId);
      }
    }
  });
}
