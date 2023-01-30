import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { findStructureByEmail } from '../users';
import logServer from '../../logging';

export default function createUser(req, content) {
  // sample use:
  // curl -X POST -H "X-API-KEY: createuser-password" \
  //      -H "Content-Type: application/json" \
  //      -d '{"username":"utilisateur1", "firstname":"", "lastname":"", "email":"" }' \
  //      http://localhost:3000/api/createuser
  if ('username' in content && 'firstname' in content && 'lastname' in content && 'email' in content) {
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
        Meteor.users.insert(userData);
      } catch (err) {
        logServer(err);
        logServer(i18n.__('api.users.insertError', { user: content.username }), 'error');
        throw new Meteor.Error(
          'restapi.users.createuser.insertError',
          `Error encountered while creating user ${content.username}`,
        );
      }
      return { response: 'user created' };
    }
    throw new Meteor.Error('restapi.users.createuser.alreadyExists', 'user already exists');
  }
  throw new Meteor.Error('restapi.users.createuser.dataMissing', 'Missing request parameters');
}
