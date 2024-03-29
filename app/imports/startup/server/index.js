import { Migrations } from 'meteor/percolate:migrations';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import helmet from 'helmet';
import { SyncedCron } from 'meteor/littledata:synced-cron';
import cors from 'cors';
import { NOTIFICATIONS_TYPES, SCOPE_TYPES } from '../../api/notifications/enums';
import { checkMigrationStatus } from '../../api/appsettings/methods';

// import i18n translation files
import '../locales';
import './inject-i18n';
import './index-chatbot';

// Set up some rate limiting and other important security settings.
import './config/security';

// This defines all the collections, publications and methods that the application provides
// as an API to the client.
import './config/ValidationError';
import './register-api';

// Set up roles, initial accounts and services
import './db-initialize/Structures';
import './db-initialize/Accounts';
import './db-initialize/Services';
import './db-initialize/Categories';
import './db-initialize/Groups';
import './db-initialize/Tags';
import './db-initialize/Articles';
import './db-initialize/AppSettings';
import logServer from '../../api/logging';
import initRestApi from '../../api/restApi';
// import './db-initialize/PersonalSpaces';

Meteor.startup(() => {
  logServer('STARTUP - log function works correctly', NOTIFICATIONS_TYPES.INFO, SCOPE_TYPES.SYSTEM, { itWorks: true });
  logServer('STARTUP - log function works correctly', NOTIFICATIONS_TYPES.ERROR, SCOPE_TYPES.SYSTEM, {
    itWorks: false,
  });

  Migrations.migrateTo('latest');

  checkMigrationStatus();
  // set up Default language to French in HTML attribute
  WebApp.addHtmlAttributeHook(() => ({ lang: 'fr' }));

  /**
   * Configure Content Security Policies
   */
  // set up various security related headers
  const scriptSrcs = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
  if (Meteor.settings.public.matomo?.urlBase) scriptSrcs.push(Meteor.settings.public.matomo.urlBase);
  if (Meteor.settings.public.chatbotUrl)
    scriptSrcs.push(`${Meteor.settings.public.chatbotUrl}backoffice/assets/scripts/embbed-chatbot.min.js`);
  const imgSrcs = ['*', 'data:', 'blob:'];
  if (Meteor.settings.public.minioEndPoint) imgSrcs.push(`https://${Meteor.settings.public.minioEndPoint}`);
  const frameAncestors = Meteor.settings.private?.cspFrameAncestors || ["'self'"];

  if (Meteor.settings.public?.chatbotUrl) scriptSrcs.push(Meteor.settings.public.chatbotUrl);

  WebApp.connectHandlers.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['*'],
          scriptSrc: scriptSrcs,
          connectSrc: ['*'],
          imgSrc: imgSrcs,
          mediaSrc: imgSrcs,
          styleSrc: ["'self'", "'unsafe-inline'"],
          frameAncestors,
        },
      },
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
      crossOriginOpenerPolicy: {
        policy: 'unsafe-none',
      },
      crossOriginEmbedderPolicy: {
        policy: 'credentialless',
      },
      noSniff: true,
      hidePoweredBy: true,
    }),
  );

  initRestApi();

  SyncedCron.config({
    log: true,
    // Name of collection to use for synchronisation and logging
    collectionTTL: 172800,
  });
  SyncedCron.start();

  /**
   * Configure CORS
   */
  WebApp.connectHandlers.use(
    cors({
      origin: '*', // Enable every origin to load Laboite's scripts (for the widget)
    }),
  );
});
