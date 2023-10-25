import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import i18n from 'meteor/universe:i18n';
import { findStructureByEmail, searchMatchingStructure } from '../users';
import logServer, { levels, scopes } from '../../logging';
import NextcloudClient from '../../appclients/nextcloud';
import Structures from '../../structures/structures';

const nextcloudPlugin = Meteor.settings.public.groupPlugins.nextcloud;
let nextClient = null;
if (nextcloudPlugin && nextcloudPlugin.enable) nextClient = new NextcloudClient();

export default async function createUser(req, content) {
  // sample use:
  // curl -X POST -H "X-API-KEY: createuser-password" \
  //      -H "Content-Type: application/json" \
  //      -d '{"username":"utilisateur1", "firstname":"", "lastname":"", "email":"", "structure":"" }' \   // avec structure passée en param
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
      const structureObject = Structures.findOne({ name: content.structure });
      if (!content.structure || !structureObject) {
        // check if we can determine structure from email
        const structureByEmail = findStructureByEmail(content.email);
        if (structureByEmail) {
          userData.structure = structureByEmail._id;
        }
      } else {
        const apiKey = req.headers['x-api-key'];
        const tabApiKeys = Meteor.settings.private.createUserApiKeys;
        const tabApiKeysByStructure = Meteor.settings.private.createUserApiKeysByStructure;
        const isAllowed = searchMatchingStructure(structureObject, apiKey, tabApiKeys, tabApiKeysByStructure);
        // add a structure to user if we give a structure in content.structure
        if (content.structure && isAllowed) {
          userData.structure = structureObject._id;
        } else {
          throw new Meteor.Error(
            'Structure not allowed to create users',
            `Error encountered while creating user whith structure ${content.structure}`,
          );
        }
      }
      try {
        const { emails, ...u } = userData;
        const userId = Accounts.createUser({ ...u, email: emails[0].address });
        Meteor.users.update(userId, { $set: { emails } });

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
