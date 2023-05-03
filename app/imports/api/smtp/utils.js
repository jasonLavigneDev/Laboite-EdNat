import { Roles } from 'meteor/alanning:roles';
import Structures from '../structures/structures';

/**
 * - Check first if structure has a contact email
 * - If not, check if structure has to send mail to structure admins
 * - If not, check if structures has to send mail to parent (so check parent configuration)
 * - If not, send to global admins
 */
export const getTargetMail = ({ structure }) => {
  const { contactEmail, sendMailToAdminStructure, sendMailToParent } = structure;
  if (contactEmail !== null) return [contactEmail];
  if (sendMailToAdminStructure) {
    const mails = Meteor.users
      .find({})
      .fetch()
      .filter((user) => Roles.userIsInRole(user._id, 'adminStructure', structure._id));
    return mails;
  }
  if (sendMailToParent) {
    if (structure.parentId) {
      const ancestor = Structures.findOne({ _id: { $in: structure.parentId } });
      if (ancestor) {
        return getTargetMail(ancestor);
      }
    }
  }
  const mails = Meteor.users
    .find({})
    .fetch()
    .filter((user) => Roles.userIsInRole(user._id, 'admin'));
  return mails;
};
