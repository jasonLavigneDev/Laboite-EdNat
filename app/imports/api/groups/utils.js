import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import i18n from 'meteor/universe:i18n';
import Structures from '../structures/structures';
import Groups from './groups';

// checks if some users don't have access to authorized structures
export function checkGroupUsers(groupId, structureIds) {
  const group = Groups.findOne(groupId);
  if (structureIds.length === 0) return;
  // get all structures that have accesss to this group (declared structures and their child structures)
  const authorizedStructs = structureIds
    .map((structId) => {
      const struct = Structures.findOne(structId);
      return [struct._id, ...struct.childrenIds];
    })
    .flat();
  const userTypes = ['Candidate', 'Member', 'Animator', 'Admin'];
  // search for candidates / members / animators / admins that are no longer allowed
  userTypes.forEach((userType) => {
    const users = Meteor.users
      .find({ _id: { $in: group[`${userType.toLowerCase()}s`] } }, { fields: { _id: 1, structure: 1 } })
      .fetch();
    // check for users who are no longer in authorized structures
    if (users.some((user) => !authorizedStructs.includes(user.structure))) {
      // raise an exception for the first unauthorized user found
      throw new Meteor.Error('api.groups.checkGroupUsers.unauthorized', i18n.__('api.groups.unauthorizedUser'));
    }
  });
}

export function validateShareName() {
  const name = this.value;
  if (this.value) {
    return name.includes('/') || name.includes('\\') ? SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED : undefined;
  }
  return undefined;
}
