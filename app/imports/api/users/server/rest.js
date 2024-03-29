import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import i18n from 'meteor/universe:i18n';
import { findStructureByEmail } from '../users';
import logServer, { levels, scopes } from '../../logging';
import NextcloudClient from '../../appclients/nextcloud';

const nextcloudPlugin = Meteor.settings.public.groupPlugins.nextcloud;
let nextClient = null;
if (nextcloudPlugin && nextcloudPlugin.enable) nextClient = new NextcloudClient();

export default async function createUser(req, content) {
  // sample use:
  // curl -X POST -H "X-API-KEY: createuser-password" \
  //      -H "Content-Type: application/json" \
  //      -d '{"username":"utilisateur1", "firstname":"", "lastname":"", "email":"" }' \
  //      http://localhost:3000/api/createuser
  if ('username' in content && 'firstname' in content && 'lastname' in content && 'email' in content) {
    const emailUser = Accounts.findUserByEmail(content.email);
    if (emailUser) {
      logServer(`USERS - REST - ERROR - createUser - user already exists with this email`, levels.WARN, scopes.USER, {
        emailUser,
      });
      throw new Meteor.Error(
        'restapi.users.createuser.emailExists',
        `user already exists with this email: ${content.email}`,
      );
    }
    const user = Meteor.users.findOne({ username: content.username });
    if (!user) {
      // create user account if not existing
      const userData = {
        username: content.username,
        createdAt: new Date(),
        emails: [{ address: content.email, verified: true }],
        primaryEmail: content.email,
        firstName: content.firstname,
        lastName: content.lastname,
        profile: {},
      };
      // check if we can determine structure from email
      const structure = findStructureByEmail(content.email);
      if (structure) userData.structure = structure._id;
      try {
        const { emails, ...u } = userData;
        const userId = Accounts.createUser({ ...u, email: emails[0].address });
        Meteor.users.update(userId, { $set: { emails, isActive: true } });

        // create user on nextcloud server
        if (nextClient) {
          return nextClient
            .addUser(userId)
            .then((resp) => {
              if (resp === true) return { response: 'user created' };
              throw new Meteor.Error(
                'restapi.users.createuser.nextcloudError',
                `Error encountered while creating user ${content.username} on nextcloud server`,
              );
            })
            .catch(() => {
              throw new Meteor.Error(
                'restapi.users.createuser.nextcloudError',
                `Error encountered while creating user ${content.username} on nextcloud server`,
              );
            });
        }
      } catch (err) {
        logServer(
          `USERS - REST - ERROR - createUser - ${i18n.__('api.users.insertError', { user: content.username })}`,
          levels.ERROR,
          scopes.USER,
          {
            userData,
            error: err,
          },
        );
        throw new Meteor.Error(
          'restapi.users.createuser.insertError',
          `Error encountered while creating user ${content.username}`,
        );
      }
      return { response: 'user created' };
    }
    logServer(`USERS - REST - ERROR - createUser - username already exists`, levels.WARN, scopes.USER, {
      user: content.username,
    });
    throw new Meteor.Error('restapi.users.createuser.alreadyExists', 'username already exists');
  }
  logServer(`USERS - REST - ERROR - createUser - Missing request parameters`, levels.ERROR, scopes.USER, {
    req,
  });
  throw new Meteor.Error('restapi.users.createuser.dataMissing', 'Missing request parameters');
}
