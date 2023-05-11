import { Roles } from 'meteor/alanning:roles';
import Structures from '../structures/structures';

/**
 * - Check first if structure has a contact email
 * - If not, check if structure has to send mail to structure admins
 * - If not, check if structures has to send mail to parent (so check parent configuration)
 * - If not, send to global admins
 */
export const getTargetMail = ({ structure }) => {
  const { contactEmail, sendMailToStructureAdmin, sendMailToParent } = structure;
  if (contactEmail) return { mails: [contactEmail], admin: false };
  if (sendMailToStructureAdmin) {
    const mails = Roles.getUsersInRole('adminStructure', { scope: structure._id }).fetch();
    return { mails, admin: false };
  }
  if (sendMailToParent) {
    if (structure.parentId) {
      const ancestor = Structures.findOne({ _id: structure.parentId });
      if (ancestor) {
        return getTargetMail({ structure: ancestor });
      }
    }
  }
  const mails = Roles.getUsersInRole('admin').fetch();
  return { mails, admin: true };
};
