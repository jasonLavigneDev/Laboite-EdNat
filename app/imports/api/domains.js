import { Meteor } from 'meteor/meteor';
import logServer from './logging';
import AsamExtensions from './asamextensions/asamextensions';
import { NOTIFICATIONS_TYPES, SCOPE_TYPES } from './notifications/enums';

// checks if the domain part of an email address matches whitelisted domains
export default function checkDomain(email) {
  let res = false;
  const domainMail = email.split('@')[1];
  const whiteDomains = Meteor.settings.private.whiteDomains || [];
  const checkKeyCloakWhiteListDomain = Meteor.settings.private.checkKeyCloakWhiteListDomain || false;
  whiteDomains.forEach((whiteDomain) => {
    if (new RegExp(whiteDomain).test(domainMail)) {
      // logServer(`  Email domain matches ${whiteDomain}: user activated`);
      logServer(
        `DOMAIN - checkDomain - Email domain matches${whiteDomain}:user activated`,
        NOTIFICATIONS_TYPES.INFO,
        SCOPE_TYPES.SYSTEM,
        {
          email,
        },
      );
      res = true;
    }
  });
  // console.log('res avant de vérifier keycloakWhitelist', res);
  if (!res && checkKeyCloakWhiteListDomain) {
    const asAmExtension = AsamExtensions.findOne({ extension: domainMail });
    res = typeof asAmExtension !== 'undefined';
  }
  // console.log('res après avoir vérifier keycloakWhitelist', res);

  return res;
}
