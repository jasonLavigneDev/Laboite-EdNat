import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import axios from 'axios';
import logServer, { levels, scopes } from '../../logging';

export default async function getNcToken(req, content) {
  // sample use:
  // curl -X  POST -H "X-API-KEY: 849b7648-14b8-4154-9ef2-8d1dc4c2b7e9" \
  //      -H "Content-Type: application/json" \
  //      -d '{"username":"utilisateur1" }' \
  //      http://localhost:3000/api/nctoken
  if ('username' in content || 'email' in content) {
    let user = null;
    if (content.email) {
      user = Accounts.findUserByEmail(content.email);
    } else {
      user = Accounts.findUserByUsername(content.username);
    }
    // check that user exists
    if (!user) {
      throw new Meteor.Error('restapi.nextcloud.getNcToken.unknownUser', i18n.__('api.users.unknownUser'));
    }
    // fetch token from nextcloud sessiontoken app
    const ncUrl = user.nclocator.startsWith('http') ? user.nclocator : `https://${user.nclocator}`;
    const appUrl = `${ncUrl}/index.php/apps/sessiontoken/token`;
    const { sessionTokenKey, sessionTokenAppName } = Meteor.settings.nextcloud;
    const params = { apikey: sessionTokenKey, user: user.username, name: sessionTokenAppName };
    return axios({
      method: 'post',
      url: appUrl,
      data: new URLSearchParams(params).toString(),
    })
      .then((response) => {
        if (response.data.token) {
          return { nclocator: user.nclocator, nctoken: response.data.token };
        }
        throw new Meteor.Error(
          'restapi.nextcloud.getNcToken.noTokenReceived',
          i18n.__('api.nextcloud.getTokenError', { user: user.username }),
        );
      })
      .catch((err) => {
        // logServer(err);
        // logServer(i18n.__('api.nextcloud.getTokenError', { user: user.username }), 'error');
        logServer(
          `NEXTCLOUD - REST - getNcToken - ${i18n.__('api.nextcloud.getTokenError', { user: user.username })}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            content,
            user,
            err,
          },
        );
        throw new Meteor.Error(
          'restapi.nextcloud.getNcToken.tokenRequestError',
          i18n.__('api.nextcloud.getTokenError', { user: user.username }),
        );
      });
  }
  throw new Meteor.Error(
    'restapi.nextcloud.getNcToken.dataWithoutUsername',
    'request sent to API with no username or email',
  );
}
