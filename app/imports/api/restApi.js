import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { Accounts } from 'meteor/accounts-base';
import bodyParser from 'body-parser';
import cors from 'cors';
import Rest from 'connect-rest';

import addNotification from './notifications/server/rest';
import getStats from './stats/server/rest';
import getNcToken from './nextcloud/server/rest';
import createUser from './users/server/rest';
import ftUploadProxy from './francetransfert/server/rest';
import createUserToken from './users/server/restToken';
import Notifications from './notifications/notifications';
import { template } from './utils';
import axios from "axios";

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

  /**
   * @deprecated
   */
  WebApp.connectHandlers.use('/scripts/widget/demo', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    });
    res.write(Assets.getText('widget/demo.html'));
    res.end();
  });


  WebApp.connectHandlers.use('/scripts/widget.js', async (req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }

    if(!Meteor.settings.public?.widget?.packageUrl) {
      res.writeHead(404);
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/javascript',
    });

    const response = await axios.get(Meteor.settings.public.widget.packageUrl, {
      responseType: 'stream'
    })

    response.data.pipe(res)
  });

  /**
   * @deprecated
   */
  WebApp.connectHandlers.use('/scripts/widget', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'application/javascript',
    });

    const url = Meteor.absoluteUrl().slice(0, -1)

    res.write(
      template(Assets.getText('widget/script.js'), {
        url,
        script: `${url}/scripts/widget.js`,
      }),
    );
    res.end();
  });


  WebApp.connectHandlers.use('/widget/assets/', (req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }

    const { theme } = Meteor.settings.public;

    const widgetAssets = {
      logo: Meteor.absoluteUrl(`images/logos/${theme}/widget/logo.svg`),
      notifications: Meteor.absoluteUrl(`images/logos/${theme}/widget/notifications.svg`),
      connected: Meteor.absoluteUrl(`images/logos/${theme}/widget/connected.svg`),
      disconnected: Meteor.absoluteUrl(`images/logos/${theme}/widget/disconnected.svg`),
    };

    const key = req.url.substring(1);

    if (key in widgetAssets) {
      res.writeHead(301, {
        Location: widgetAssets[key],
      });
      res.end();
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  WebApp.connectHandlers.use('/chat', (req, res, next) => {
    const { chatbotUrl } = Meteor.settings.public;

    if (!chatbotUrl) {
      next();
    } else {
      res.writeHead(301, {
        Location: chatbotUrl,
      });
      res.end();
    }
  });

  WebApp.connectHandlers.use('/widget/load', (req, res) => {
    if (req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/html',
      });
      res.write(Assets.getText('widget/lite.html'));
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }

    const { authorization } = req.headers;

    function respondUnauthorized(status, message) {
      res.writeHead(status, message, {
        'Content-Type': 'application/json',
      });
      res.write(
        JSON.stringify({
          authenticated: false,
          notifications: 0,
        }),
      );
      res.end();
    }

    if (!authorization) {
      respondUnauthorized(401, 'No authorization');
      return;
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Token') {
      respondUnauthorized(401, 'Invalid authorization type');
      return;
    }

    const hashedToken = Accounts._hashLoginToken(token);

    const user = Meteor.users.findOne({
      'services.resume.loginTokens.hashedToken': hashedToken,
    });

    if (user) {
      const tokenRecord = user.services.resume.loginTokens.find((t) => t.hashedToken === hashedToken);
      if (tokenRecord) {
        const loginExpirationInDays = Number(Meteor.settings.private.loginExpirationInDays || '1');

        const expirationDate = new Date(tokenRecord.when);
        expirationDate.setDate(expirationDate.getDate() + loginExpirationInDays);

        const isExpired = expirationDate < new Date();

        if (!isExpired) {
          const notifications = Notifications.find({ userId: user._id, read: false }).count();

          res.writeHead(200, {
            'Content-Type': 'application/json',
          });
          res.write(
            JSON.stringify({
              authenticated: true,
              notifications,
            }),
          );
          res.end();
        } else {
          respondUnauthorized(401, 'Token expired');
        }
      } else {
        respondUnauthorized(401, 'User not found');
      }
    } else {
      respondUnauthorized(401, 'User not found');
    }
  });
}
