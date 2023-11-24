import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { Roles } from 'meteor/alanning:roles';
import logServer, { levels, scopes } from '../logging';

const emailTemplate = (kcData) => `
Erreur lors de la création d'un nouvel utilisateur.
Des information sont manquantes dans les données envoyées par Keycloak
(champs obligatoires: preferred_username, email, family_name, given_name)

Informations reçues: ${JSON.stringify(kcData)}
`;

export const warnAdministrators = (kcData) => {
  const adminEmails = Roles.getUsersInRole('admin')
    .fetch()
    .map((user) => {
      try {
        return user.emails[0].address;
      } catch (err) {
        return null;
      }
    })
    .filter((email) => email !== null);
  const from = Meteor.settings.smtp.fromEmail;
  const { appName = 'LaBoite' } = Meteor.settings.public;
  const subject = `[Erreur ${appName}] Création de compte en erreur`;
  try {
    Email.send({ to: adminEmails, from, subject, text: emailTemplate(kcData) });
  } catch (error) {
    logServer(
      'USERS - API - METEOR ERROR - warnAdministrators - Error sending email to administrators',
      levels.ERROR,
      scopes.SYSTEM,
      { emails: adminEmails },
    );
  }
};
