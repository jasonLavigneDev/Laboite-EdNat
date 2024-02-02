import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import Structures from '../structures/structures';
import Groups from './groups';
import logServer, { levels, scopes } from '../logging';

// checks that users are members of authorized structures if applicable
export function checkGroupUsers(groupId) {
  const group = Groups.findOne(groupId);
  if (!group.structureIds) return;
  // get all structures that have accesss to this group (declared structures and their child structures)
  const authorizedStructs = group.structureIds
    .map((structId) => {
      const struct = Structures.findOne(structId);
      return [struct._id, ...struct.childrenIds];
    })
    .flat();
  // XXX TO BE DETERMINED: are admins included in this procedure ?????
  const userTypes = ['Candidate', 'Member', 'Animator', 'Admin'];
  // search for candidates / members / animators / admins that are no longer allowed
  userTypes.forEach((userType) => {
    const unsubFunc = `users.unset${userType}Of`;
    const users = Meteor.users
      .find({ _id: { $in: group[`${userType.toLowerCase()}s`] } }, { fields: { _id: 1, structure: 1 } })
      .fetch();
    // check for all users who are no longer in authorized structures
    users
      .filter((user) => !authorizedStructs.includes(user.structure))
      .forEach((userToRemove) => {
        Meteor.call(unsubFunc, { userId: userToRemove._id, groupId: group._id }, (err) => {
          if (err) {
            logServer(
              `GROUPS - UTILS - ERROR - checkGroupUsers - error when unsubscribing user`,
              levels.ERROR,
              scopes.SYSTEM,
              {
                errorMEssage: err.message,
              },
            );
          }
        });
      });
  });
}

export function validateShareName() {
  const name = this.value;
  if (this.value) {
    return name.includes('/') || name.includes('\\') ? SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED : undefined;
  }
  return undefined;
}
