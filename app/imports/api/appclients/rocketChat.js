import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
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
    // APPELS API : fournir headers "X-User-Id" et "X-Auth-Token"
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
    this.token = null;
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
      this._setToken(newToken, response.data.expires_in);
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
    this._getToken().then((token) => {
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
          } else {
            logServer(`${i18n.__('api.rocketChat.groupAddError', { name })} (${response.error})`, 'error', callerId);
          }
          return response.data.success === true ? 'ok' : response.error;
        })
        .catch((error) => {
          logServer(i18n.__('api.rocketChat.groupAddError', { name }), 'error');
          logServer(error.response && error.response.data ? error.response.data.error : error, 'error', callerId);
          return null;
        });
    });
  }

  removeGroup(name, callerId) {
    this._getToken().then((token) => {
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
            logServer(`${i18n.__('api.rocketChat.groupRemoveError', { name })} (${response.error})`, 'error', callerId);
          }
          return response.data.success === true ? 'ok' : response.error;
        })
        .catch((error) => {
          logServer(i18n.__('api.rocketChat.groupRemoveError', { name }), 'error');
          logServer(error.response && error.response.data ? error.response.data.error : error, 'error', callerId);
          return null;
        });
    });
  }

  getUserByEmail(email) {
    this._getToken().then((token) => {
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
          console.log(response.data);
        })
        .catch((error) => {
          logServer(i18n.__('api.rocketChat.getUserError'), 'error');
          logServer(error.response && error.response.data ? error.response.data : error, 'error');
          return null;
        });
    });
  }
}

const rcClient = Meteor.isServer && Meteor.settings.public.enableRocketChat ? new RocketChatClient() : null;

export default rcClient;
