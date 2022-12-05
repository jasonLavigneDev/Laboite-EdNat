import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import cors from 'cors';
import Rest from 'connect-rest';

import addNotification from './notifications/server/rest';
import getStats from './stats/server/rest';
import getNcToken from './nextcloud/server/rest';
import { widget } from './widget';

WebApp.connectHandlers.use(bodyParser.urlencoded({ extended: false }));
WebApp.connectHandlers.use(bodyParser.json());
WebApp.connectHandlers.use('*', cors());
// // gzip/deflate outgoing responses
// var compression = require('compression');
// app.use(compression());

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

WebApp.connectHandlers.use('/scripts/widget', (req, res) => {
  const fileContent = widget();
  res.writeHead(200, {
    'Content-Type': 'application/javascript',
  });
  res.write(fileContent);
  res.end();
});
