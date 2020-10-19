import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import slugify from 'slugify';
import Groups from '../groups/groups';
import logServer from '../logging';

class RocketChatClient {
  constructor() {
    this.rcURL = `${Meteor.settings.public.rocketChatURL}/api/v1`;
    this.token = null;
    this.adminId = null;
    this._setToken = this._setToken.bind(this);
    this._expire = this._expire.bind(this);
    this._checkToken = this._checkToken.bind(this);
    // initialize client id and check that we can get tokens
    this._getToken().then((initToken) => {
      if (initToken) {
        logServer(i18n.__('api.rocketChat.initClient'));
      }
    });
  }

  _authenticate() {
    const { rocketChatUser, rocketChatPassword } = Meteor.settings.rocketChat;
    return axios.post(
      `${this.rcURL}/login`,
      { user: rocketChatUser, password: rocketChatPassword },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
  }

  _expire() {
    const previousToken = this.token;
    this.token = null;
    // call Rocket Chat API to invalidate this token
    return axios
      .post(
        `${this.rcURL}/logout`,
        {},
        {
          headers: {
            Accept: 'application/json',
            'X-User-Id': this.adminId,
            'X-Auth-Token': previousToken,
          },
        },
      )
      .then((response) => {
        if (response.data.status === 'success') {
          logServer(i18n.__('api.rocketChat.logout'));
        } else {
          logServer(i18n.__('api.rocketChat.logoutError'), 'error');
        }
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.logoutError'), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
      });
  }

  _setToken(token, timeout) {
    this.token = token;
    // reset this.token 5 seconds before it expires
    setTimeout(this._expire, (timeout - 5) * 1000);
  }

  _checkToken() {
    if (this.token) return Promise.resolve(this.token);
    return this._authenticate().then((response) => {
      logServer('RocketChat : new token received');
      const newToken = response.data.data.authToken;
      this.adminId = response.data.data.userId;
      // Rocket Chat does not indicate token expiration (set to 15 minutes)
      this._setToken(newToken, 900);
      return newToken;
    });
  }

  _getToken() {
    return this._checkToken()
      .then((newToken) => Promise.resolve(newToken))
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.tokenError'), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return null;
      });
  }

  createGroup(name, callerId) {
    return this._getToken()
      .then((token) => {
        return axios
          .post(
            `${this.rcURL}/groups.create`,
            {
              // ATTENTION : les caractères 'spéciaux', accentués et les espace sont refusés ...
              name,
              // Retrouver et ajouter automatiquement les membres du groupe (ou canaux publics) ?
              members: [],
              readOnly: false,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-User-Id': this.adminId,
                'X-Auth-Token': token,
              },
            },
          )
          .then((response) => {
            if (response.data && response.data.success === true) {
              logServer(i18n.__('api.rocketChat.groupAdded', { name }));
              return response.data.group;
            }
            logServer(`${i18n.__('api.rocketChat.groupAddError', { name })} (${response.error})`, 'error', callerId);
            return null;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.groupAddError', { name }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  removeGroup(name, callerId) {
    return this._getToken()
      .then((token) => {
        return axios
          .post(
            `${this.rcURL}/groups.delete`,
            {
              roomName: name,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-User-Id': this.adminId,
                'X-Auth-Token': token,
              },
            },
          )
          .then((response) => {
            if (response.data.success === true) {
              logServer(i18n.__('api.rocketChat.groupRemoved', { name }));
            } else {
              logServer(
                `${i18n.__('api.rocketChat.groupRemoveError', { name })} (${response.error})`,
                'error',
                callerId,
              );
            }
            return response.data.success;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.groupRemoveError', { name }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  _getUserByEmail(email) {
    return this._getToken()
      .then((token) => {
        return axios
          .get(`${this.rcURL}/users.list`, {
            params: {
              query: { emails: { $elemMatch: { address: email } } },
            },
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-User-Id': this.adminId,
              'X-Auth-Token': token,
            },
          })
          .then((response) => {
            if (response.data && response.data.success === true) {
              if (response.data.users.length > 0) return response.data.users[0];
              return null;
            }
            logServer(`${i18n.__('api.rocketChat.getUserError')} (${response.error})`, 'error');
            return null;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.getUserError'), 'error');
        logServer(error.response && error.response.data ? error.response.data : error, 'error');
        return null;
      });
  }

  inviteUser(groupId, email, callerId) {
    // user : user object as returned by API (i.e: this.getUserbyEmail)
    // role: boolean to set user as owner, moderator or member of this group
    return this._getToken()
      .then((token) =>
        this._getUserByEmail(email).then((user) => {
          return axios
            .post(
              `${this.rcURL}/groups.invite`,
              {
                roomName: groupId,
                userId: user._id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.userInvited', { groupId, email }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.userInviteError', { groupId, email })} (${response.data.error})`,
                  'error',
                  callerId,
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.userInviteError', { groupId, email }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  setRole(groupId, email, role, callerId) {
    // user : user object as returned by API (i.e: this.getUserbyEmail)
    // role: boolean to set user as owner or moderator of a group
    const APIUrl = role === 'owner' ? 'addOwner' : 'addModerator';
    const displayRole = i18n.__(`api.rocketChat.${role}`);
    return this._getToken()
      .then((token) =>
        this._getUserByEmail(email).then((user) => {
          return axios
            .post(
              `${this.rcURL}/groups.${APIUrl}`,
              {
                roomName: groupId,
                userId: user._id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.roleSet', { groupId, email, role: displayRole }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.setRoleError', { groupId, email, role: displayRole })} (${
                    response.data.error
                  })`,
                  'error',
                  callerId,
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.setRoleError', { groupId, email, role: displayRole }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  unsetRole(groupId, email, role, callerId) {
    // user : user object as returned by API (i.e: this.getUserbyEmail)
    // role: boolean to set user as owner or moderator of a group
    const APIUrl = role === 'owner' ? 'removeOwner' : 'removeModerator';
    const displayRole = i18n.__(`api.rocketChat.${role}`);
    return this._getToken()
      .then((token) =>
        this._getUserByEmail(email).then((user) => {
          return axios
            .post(
              `${this.rcURL}/groups.${APIUrl}`,
              {
                roomName: groupId,
                userId: user._id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.roleUnset', { groupId, email, role: displayRole }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.unsetRoleError', { groupId, email, role: displayRole })} (${
                    response.data.error
                  })`,
                  'error',
                  callerId,
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.unsetRoleError', { groupId, email, role: displayRole }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  kickUser(groupId, email, callerId) {
    // user : user object as returned by API (i.e: this.getUserbyEmail)
    return this._getToken()
      .then((token) =>
        this._getUserByEmail(email).then((user) => {
          return axios
            .post(
              `${this.rcURL}/groups.kick`,
              {
                roomName: groupId,
                userId: user._id,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'X-User-Id': this.adminId,
                  'X-Auth-Token': token,
                },
              },
            )
            .then((response) => {
              if (response.data && response.data.success === true) {
                logServer(i18n.__('api.rocketChat.userKicked', { groupId, email }));
              } else {
                logServer(
                  `${i18n.__('api.rocketChat.userKickError', { groupId, email })} (${response.data.error})`,
                  'error',
                  callerId,
                );
              }
              return response.data.success;
            });
        }),
      )
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.userKickError', { groupId, email }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  createUser(email, name, username, callerId) {
    return this._getToken()
      .then((token) => {
        return axios
          .post(
            `${this.rcURL}/users.create`,
            {
              email,
              name,
              username,
              password: 'fixme',
              active: true,
              verified: true,
              requirePasswordChange: false,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-User-Id': this.adminId,
                'X-Auth-Token': token,
              },
            },
          )
          .then((response) => {
            if (response.data && response.data.success === true) {
              logServer(i18n.__('api.rocketChat.userAdded', { email }));
              return response.data.user;
            }
            logServer(`${i18n.__('api.rocketChat.userAddError', { email })} (${response.error})`, 'error', callerId);
            return null;
          });
      })
      .catch((error) => {
        logServer(i18n.__('api.rocketChat.userAddError', { email }), 'error', callerId);
        logServer(error.response && error.response.data ? error.response.data.error : error, 'error');
        return null;
      });
  }

  ensureUser(userId, callerId) {
    const meteorUser = Meteor.users.findOne(userId);
    const email = meteorUser.emails[0].address;
    return this._getUserByEmail(email).then((user) => {
      if (user === null) {
        return this.createUser(
          email,
          `${meteorUser.firstName} ${meteorUser.lastName}`,
          meteorUser.username !== email ? meteorUser.username : `${meteorUser.firstName}.${meteorUser.lastName}`,
          callerId,
        );
      }
      return Promise.resolve(user);
    });
  }
}

if (Meteor.isServer && Meteor.settings.public.enableRocketChat) {
  const rcClient = new RocketChatClient();

  Meteor.afterMethod('groups.createGroup', function ({ name }) {
    const slug = slugify(name, {
      replacement: '-', // replace spaces with replacement
      remove: null, // regex to remove characters
      lower: true, // result in lower case
    });
    rcClient.createGroup(slug, this.userId).then(() => {
      // adds user as channel admin
      rcClient.ensureUser(this.userId, this.userId).then((user) => {
        const email = user.emails[0].address;
        rcClient.inviteUser(slug, email, this.userId).then(() => rcClient.setRole(slug, email, 'owner', this.userId));
      });
    });
  });

  Meteor.beforeMethod('groups.removeGroup', function ({ groupId }) {
    const group = Groups.findOne({ _id: groupId });
    rcClient.removeGroup(group.slug, this.userId);
  });

  Meteor.afterMethod('users.setAdminOf', function ({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    rcClient.ensureUser(userId, this.userId).then((rcUser) => {
      if (rcUser !== null) {
        const email = rcUser.emails[0].address;
        rcClient
          .inviteUser(group.slug, email, this.userId)
          .then(() => rcClient.setRole(group.slug, email, 'owner', this.userId));
      }
    });
  });

  Meteor.beforeMethod('users.unsetAdminOf', function ({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    rcClient.ensureUser(userId, this.userId).then((user) => {
      if (user !== null) {
        const email = user.emails[0].address;
        rcClient.unsetRole(group.slug, email, 'owner', this.userId).then(() => {
          if (!Roles.userIsInRole(userId, ['member', 'animator'], groupId)) {
            rcClient.kickUser(group.slug, email, this.userId);
          }
        });
      }
    });
  });

  Meteor.afterMethod('users.setAnimatorOf', function ({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    rcClient.ensureUser(userId, this.userId).then((rcUser) => {
      if (rcUser != null) {
        const email = rcUser.emails[0].address;
        rcClient
          .inviteUser(group.slug, email, this.userId)
          .then(() => rcClient.setRole(group.slug, email, 'moderator', this.userId));
      }
    });
  });

  Meteor.beforeMethod('users.unsetAnimatorOf', function ({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    rcClient.ensureUser(userId, this.userId).then((user) => {
      if (user !== null) {
        const email = user.emails[0].address;
        rcClient.unsetRole(group.slug, email, 'moderator', this.userId).then(() => {
          if (!Roles.userIsInRole(userId, ['member', 'admin'], groupId)) {
            rcClient.kickUser(group.slug, email, this.userId);
          }
        });
      }
    });
  });

  Meteor.afterMethod('users.setMemberOf', function ({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    rcClient.ensureUser(userId, this.userId).then((rcUser) => {
      if (rcUser != null) {
        const email = rcUser.emails[0].address;
        rcClient.inviteUser(group.slug, email, this.userId);
      }
    });
  });

  Meteor.beforeMethod('users.unsetMemberOf', function ({ userId, groupId }) {
    const group = Groups.findOne({ _id: groupId });
    if (!Roles.userIsInRole(userId, ['animator', 'admin'], groupId)) {
      rcClient.ensureUser(userId, this.userId).then((user) => {
        if (user !== null) {
          const email = user.emails[0].address;
          rcClient.kickUser(group.slug, email, this.userId);
        }
      });
    }
  });
}
