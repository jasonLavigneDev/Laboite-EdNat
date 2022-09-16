import Structures from '../structures/structures';

/**
 * - Check first if structure has a contact email
 * - If not, check if ancestors have one
 * - I nothing find, return null
 */
export const getTargetMail = ({ structure }) => {
  const { contactEmail } = structure;
  if (contactEmail !== null) return contactEmail;
  const mails = Structures.find({ _id: { $in: structure.ancestorsIds } }, { fields: { contactEmail: 1 } }).fetch();
  // reverse the array since we get the structures in descending order
  const result = mails.reverse().find((mail) => mail.contactEmail !== null);
  return result || null;
};
