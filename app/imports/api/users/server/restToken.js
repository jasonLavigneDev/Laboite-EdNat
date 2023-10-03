import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import logServer, { levels, scopes } from '../../logging';

export default async function createUserToken(req, content) {
  // sample use:
  // curl -iX POST -H "X-API-KEY: createusertoken-password" \
  //      -H "Content-Type: application/json" \
  //      -d '{"email":"email@domaine.fr"}' \
  //      http://localhost:3000/api/createusertoken

  if ('email' in content) {
    const emailUser = Accounts.findUserByEmail(content.email);
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
