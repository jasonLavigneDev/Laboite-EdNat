import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { Accounts } from 'meteor/accounts-base';
import axios from 'axios';
import Notifications from './notifications/notifications';
import { template } from './utils';
import PackageJSON from '../../package.json';

export default function initWidgetApi() {
  /**
   * Redirect to the chatbot
   */
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

  /**
   * Show a demo of the widget
   */
  WebApp.connectHandlers.use('/scripts/widget/demo', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    });
    res.write(Assets.getText('widget/demo.html'));
    res.end();
  });

  /**
   * Load the NPM countly script
   */
  WebApp.connectHandlers.use('/scripts/countly.js', async (req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }

    if ('countly-sdk-web' in PackageJSON.dependencies) {
      const countlyVersion = PackageJSON.dependencies['countly-sdk-web'].replace(/[~|^]/, '');

      res.writeHead(200, {
        'Content-Type': 'application/javascript',
      });

      const response = await axios.get(
        `https://cdn.jsdelivr.net/npm/countly-sdk-web@${countlyVersion}/lib/countly.min.js`,
        {
          responseType: 'stream',
        },
      );

      response.data.pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  /**
   * Load the NPM widget script
   */
  WebApp.connectHandlers.use('/scripts/widget.js', async (req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }

    if (!Meteor.settings.public?.widget?.packageUrl) {
      res.writeHead(404);
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/javascript',
    });

    const response = await axios.get(Meteor.settings.public.widget.packageUrl, {
      responseType: 'stream',
    });

    response.data.pipe(res);
  });

  /**
   * Load the widget script for retro-compatibility
   * @deprecated
   */
  WebApp.connectHandlers.use('/scripts/widget', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'application/javascript',
    });

    res.write(
      template(Assets.getText('widget/script.js'), {
        url: Meteor.absoluteUrl().slice(0, -1),
      }),
    );
    res.end();
  });

  /**
   * Redirect widget assets
   */
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

  /**
   * Log in user with initiating a WebSocket instance
   */
  WebApp.connectHandlers.use('/widget/load', (req, res) => {
    if (req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/html',
      });

      res.write(
        template(Assets.getText('widget/lite.html'), {
          countlyUrl: Meteor.settings.public?.countly.url,
          countlyKey: Meteor.settings.public?.countly.app_key,
        }),
      );
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
