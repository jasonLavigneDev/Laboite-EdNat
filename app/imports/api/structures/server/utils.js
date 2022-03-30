import { Roles } from 'meteor/alanning:roles';
import Structures from '../structures';

export const hasAdminRightOnStructure = ({ userId, structureId }) => {
  const ids = [structureId];
  const structure = Structures.findOne({ _id: structureId }, { fields: { ancestorsIds: 1 } });

  if (structure && structure.ancestorsIds.length > 0) structure.ancestorsIds.forEach((ancestor) => ids.push(ancestor));

  const isAdmin = ids.some((id) => Roles.userIsInRole(userId, 'adminStructure', id));
  return isAdmin;
};
