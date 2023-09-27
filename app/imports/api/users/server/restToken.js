import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import logServer, { levels, scopes } from '../../logging';
import { searchMatchingStructure } from '../users';
import Structures from '../../structures/structures';

export default async function createUserToken(req, content) {
  // sample use:
  // curl -iX POST -H "X-API-KEY: createusertoken-password" \
  //      -H "Content-Type: application/json" \
  //      -d '{"email":"email@domaine.fr"}' \
  //      http://localhost:3000/api/createusertoken

  if ('email' in content) {
    const emailUser = Accounts.findUserByEmail(content.email);
    const structureObject = Structures.findOne({ _id: emailUser.structure });
    const tabApiKeys = Meteor.settings.private.createUserTokenApiKeys;
    const tabApiKeysByStructure = Meteor.settings.private.createUserTokenApiKeysByStructures;
    const apiKey = req.headers['x-api-key'];
    const isAllowed = searchMatchingStructure(structureObject, apiKey, tabApiKeys, tabApiKeysByStructure);
    if (!isAllowed) {
      throw new Meteor.Error(
        'This structure is not allow to create a connection token',
        `Error encountered while creating ${content.email} user token`,
      );
    }
    if (emailUser) {
      const dataToken = Accounts._generateStampedLoginToken();

      try {
        Accounts._insertLoginToken(emailUser._id, dataToken);
      } catch (err) {
        logServer(`USERS - REST - createUserToken`, levels.ERROR, scopes.USER, {
          dataToken,
          error: err,
        });
        throw new Meteor.Error(
          'restapi.users.createusertoken.insertError',
          `Error encountered while creating ${content.email} user token`,
        );
      }
      return { response: dataToken };
    }
    throw new Meteor.Error('restapi.users.createusertoken.notExisting', `user ${content.email} is not existing`);
  }
  throw new Meteor.Error('restapi.users.createusertoken.dataMissing', 'Missing request parameters');
}
