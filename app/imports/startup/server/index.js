import { Migrations } from 'meteor/percolate:migrations';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { NOTIFICATIONS_TYPES, SCOPE_TYPES } from '../../api/notifications/enums';
import { checkMigrationStatus } from '../../api/appsettings/methods';

// import i18n translation files
import '../locales';
import './inject-i18n';

// Set up some rate limiting and other important security settings.
import './config/security';

// This defines all the collections, publications and methods that the application provides
// as an API to the client.
import './config/ValidationError';
import './register-api';
import '../../api/restApi';

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
});
