import { Email } from 'meteor/email';
import sanitizeHtml from 'sanitize-html';
import i18n from 'meteor/universe:i18n';
import Structures from '../structures/structures';
import { getTargetMail } from './utils';

Meteor.startup(function startSmtp() {
  process.env.MAIL_URL = Meteor.settings.smtp.url;
});

Meteor.methods({
  sendContactEmail(firstName, lastName, email, text, structureId) {
    check([firstName, lastName, email, text, structureId], [String]);

    const structure = Structures.findOne({ _id: structureId });
    if (structure === undefined) {
      throw new Meteor.Error('api.smtp.sendContactEmail.unknownStructure', i18n.__('api.structures.unknownStructure'));
    }

    const { appName = 'LaBoite' } = Meteor.settings.public;
    const object = `[Contact ${appName}] ${firstName} ${lastName} (${structure.name})`;

    const cleanText = sanitizeHtml(text, {
      allowedTags: ['b', 'i', 'strong', 'em'],
    });

    const msg = `Message de: ${firstName} ${lastName}
Structure de rattachement: ${structure.name}
Adresse mail: ${email}
                 
                 
${cleanText}`;

    const tabTo = Meteor.roleAssignment
      .find({ 'role._id': 'adminStructure', scope: structureId })
      .fetch()
      .map((role) => Meteor.users.findOne({ _id: role.user._id }).emails[0].address);

    const from = Meteor.settings.smtp.fromEmail;
    const structureTargetMail = getTargetMail({ structure });
    // if a structure contact mail if found, use it
    // if not, use settings one
    const to = structureTargetMail || Meteor.settings.smtp.toEmail;

    this.unblock();

    if (tabTo.length > 0) {
      Email.send({ to: tabTo, cc: to, from, subject: object, text: msg });
    } else {
      Email.send({ to, from, subject: object, text: msg });
    }
  },
});
