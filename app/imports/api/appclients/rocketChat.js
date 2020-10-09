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
}

const rcClient = Meteor.isServer && Meteor.settings.public.enableRocketChat ? new RocketChatClient() : null;

export default rcClient;
