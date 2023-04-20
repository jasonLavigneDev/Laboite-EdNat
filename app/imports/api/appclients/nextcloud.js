import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { testUrl } from '../utils';
import logServer, { levels, scopes } from '../logging';

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
    const ncURL = (nextcloudPlugin && nextcloudPlugin.URL) || '';
    const ncUser = (nextcloud && nextcloud.nextcloudUser) || '';
    const ncPassword = (nextcloud && nextcloud.nextcloudPassword) || '';
    this.nextURL = ocsUrl(ncURL);
    this.appsURL = testUrl(`${ncURL}/ocs/v2.php/apps`);
    this.basicAuth = Buffer.from(`${ncUser}:${ncPassword}`, 'binary').toString('base64');
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
        params: { format: 'json' },
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.basicAuth}`,
          'OCS-APIRequest': true,
        },
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
  // check that api is accessible and groupFolders plugin is active
  nextClient.checkConfig();

  // Meteor.afterMethod('groups.createGroup', function nextCreateGroup({ name, plugins }) {
  //   if (!this.error) {
  //     if (plugins.nextcloud === true) {
  //     }
  //   }
  // });

  // Meteor.afterMethod('groups.removeGroup', function nextRemoveGroup({ groupId }) {
  //   if (!this.error) {
  //     const groupData = this.result;
  //     const isAdmin = isActive(this.userId) && Roles.userIsInRole(this.userId, 'admin', groupId);
  //     if (isAdmin || this.userId === groupData.owner) {
  //       if (groupData.plugins.nextcloud === true) {
  //         // remove group from nextcloud if it exists
  //       }
  //     }
  //   }
  // });

  // Meteor.afterMethod('groups.updateGroup', function nextUpdateGroup({ groupId }) {
  //   if (!this.error) {
  //     // create nextcloud group if needed
  //     const group = Groups.findOne({ _id: groupId });
  //     const groupName = group.name;
  //     if (group.plugins.nextcloud === true) {
  //     }
  //   }
  // });

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
