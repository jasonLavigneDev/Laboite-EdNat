import { Email } from 'meteor/email';
import sanitizeHtml from 'sanitize-html';
import i18n from 'meteor/universe:i18n';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Structures from '../structures/structures';
import { getTargetMail } from './utils';
import logServer, { levels, scopes } from '../logging';

Meteor.startup(function startSmtp() {
  process.env.MAIL_URL = Meteor.settings.smtp.url;
});

export const sendEmailToDiffusionList = new ValidatedMethod({
  name: 'smtp.sendMailToDiffusionList',
  validate: new SimpleSchema({
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
    },
    text: {
      type: String,
    },
    mailList: {
      type: Array,
    },
    'mailList.*': {
      type: String,
    },
  }).validator(),
  run({ firstName, lastName, email, text, mailList }) {
    const { appName = 'LaBoite' } = Meteor.settings.public;
    const object = `[Contact ${appName}] ${firstName} ${lastName}`;

    const cleanText = sanitizeHtml(text, {
      allowedTags: ['b', 'i', 'strong', 'em'],
    });

    const msg = `Message de: ${firstName} ${lastName}
Adresse mail: ${email}
                 
                 
${cleanText}`;

    const from = Meteor.settings.smtp.fromEmail;
    const to = Meteor.settings.smtp.toEmail;

    this.unblock();

    if (mailList.length > 0) {
      Email.send({ to, cci: mailList, from, subject: object, text: msg });
    } else {
      Email.send({ to, from, subject: object, text: msg });
    }
  },
});

export const sendContactEmail = new ValidatedMethod({
  name: 'smtp.sendContactEmail',
  validate: new SimpleSchema({
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
    },
    text: {
      type: String,
    },
    structureId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  run({ firstName, lastName, email, text, structureId }) {
    const structure = Structures.findOne({ _id: structureId });
    if (structure === undefined) {
      logServer(
        `SMTP - METHODS - METEOR ERROR - sendContactEmail - ${i18n.__('api.structures.unknownStructure')}`,
        levels.ERROR,
        scopes.SYSTEM,
      );
      throw new Meteor.Error('api.smtp.sendContactEmail.unknownStructure', i18n.__('api.structures.unknownStructure'));
    }

    const { appName = 'LaBoite' } = Meteor.settings.public;
    const object = `[Contact ${appName}] ${firstName} ${lastName} (${structure.name})`;

    const cleanText = sanitizeHtml(text, {
      allowedTags: ['b', 'i', 'strong', 'em'],
    });

    let msg = `Message de: ${firstName} ${lastName}
Structure de rattachement: ${structure.name}
Adresse mail: ${email}
                 
                 
${cleanText}`;

    const from = Meteor.settings.smtp.fromEmail;
    const structureTargetMail = getTargetMail({ structure }) || { mails: [], admin: true };

    if (structureTargetMail.admin) {
      msg = `Message de: ${firstName} ${lastName}
      Structure de rattachement: ${structure.name}
      Adresse mail: ${email}   
      
      ${cleanText}
      
      ATTENTION: Vous recevez ce mail car la configuration des contacts de la structure cible n'est pas valide.
      Veuillez vous rapprocher des administrateurs de celle-ci afin de faire suivre le message.`;
    }

    const tabTo = structureTargetMail.mails.slice(1) || [];
    const to = structureTargetMail.mails[0] || Meteor.settings.smtp.toEmail;

    this.unblock();

    if (tabTo.length > 0) {
      Email.send({ to, cc: tabTo, from, subject: object, text: msg });
    } else {
      Email.send({ to, from, subject: object, text: msg });
    }
  },
});

// Get list of all method names on Helps
const LISTS_METHODS = _.pluck([sendContactEmail, sendEmailToDiffusionList], 'name');

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000,
  );
}
