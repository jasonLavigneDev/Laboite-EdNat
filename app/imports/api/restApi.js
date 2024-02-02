import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import cors from 'cors';
import Rest from 'connect-rest';

import addNotification from './notifications/server/rest';
import getStats from './stats/server/rest';
import getNcToken from './nextcloud/server/rest';
import createUser from './users/server/rest';
import ftUploadProxy from './francetransfert/server/rest';
import createUserToken from './users/server/restToken';
import initWidgetApi from './widgetApi';

export default function initRestApi() {
  const unless = (path, middleware) => (req, res, next) => {
    if (path === req.path) {
      return next();
    }
    return middleware(req, res, next);
  };

  // We don't want to parse data for francetransfert proxy
  WebApp.connectHandlers.use(unless('/api/francetransfert/upload', bodyParser.urlencoded({ extended: false })));
  WebApp.connectHandlers.use(unless('/api/francetransfert/upload', bodyParser.json()));
  WebApp.connectHandlers.use('*', cors());
  // // gzip/deflate outgoing responses
  // var compression = require('compression');
  // app.use(compression());

  // Initialize France Transfert proxy
  WebApp.connectHandlers.use('/api/francetransfert/upload', Meteor.bindEnvironment(ftUploadProxy));

  // Initialize REST library
  const options = {
    context: '/api',
    // logger: { file: 'mochaTest.log', level: 'debug' },
    apiKeys: Meteor.settings.private.apiKeys,
    // discover: { path: 'discover', secure: true },
    // proto: { path: 'proto', secure: true }
  };
  const rest = Rest.create(options);

  // adds connect-rest middleware to connect
  WebApp.connectHandlers.use(rest.processRequest());

  // rest.get('/notifications/?userid', Meteor.bindEnvironment(getNotifications));
  rest.post({ path: '/notifications', version: '>=1.0.0' }, Meteor.bindEnvironment(addNotification));
  rest.get({ path: '/stats', version: '>=1.0.0' }, Meteor.bindEnvironment(getStats));

  const ncApiKeys = Meteor.settings.nextcloud.nextcloudApiKeys;
  // specific endpoint and api key for nextcloud token retrieval
  // Only active if at least one API key is defined in config (nextcloud.nextcloudApiKeys)
  if (ncApiKeys && ncApiKeys.length > 0) {
    const restNc = Rest.create({ ...options, apiKeys: ncApiKeys });
    WebApp.connectHandlers.use(restNc.processRequest());
    restNc.post({ path: '/nctoken', version: '>=1.0.0' }, Meteor.bindEnvironment(getNcToken));
  }

  const cuApiKeys = Meteor.settings.private.createUserApiKeys;
  // specific endpoint and api key for user creation
  // Only active if at least one API key is defined in config (private.createUserApiKeys)
  if (cuApiKeys && cuApiKeys.length > 0) {
    const restCu = Rest.create({ ...options, apiKeys: cuApiKeys });
    WebApp.connectHandlers.use(restCu.processRequest());
    restCu.post({ path: '/createuser', version: '>=1.0.0' }, Meteor.bindEnvironment(createUser));
  }

  const cutApiKeys = Meteor.settings.private.createUserTokenApiKeys;
  if (cutApiKeys && cutApiKeys.length > 0) {
    const restCut = Rest.create({ ...options, apiKeys: cutApiKeys });
    WebApp.connectHandlers.use(restCut.processRequest());
    restCut.post({ path: '/createusertoken', version: '>=1.0.0' }, Meteor.bindEnvironment(createUserToken));
  }

  initWidgetApi();
}
