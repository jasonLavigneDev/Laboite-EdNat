import { Roles } from 'meteor/alanning:roles';
import Structures from './structures';

export const hasAdminRightOnStructure = ({ userId, structureId }) => {
  const ids = [structureId];
  const structure = Structures.findOne({ _id: structureId }, { fields: { ancestorsIds: 1 } });

  if (structure && structure.ancestorsIds.length > 0) structure.ancestorsIds.forEach((ancestor) => ids.push(ancestor));

  const isAdmin = ids.some((id) => Roles.userIsInRole(userId, 'adminStructure', id));
  return isAdmin;
};

export const isAStructureWithSameNameExistWithSameParent = ({ name, parentId }) => {
  const regExp = new RegExp(name, 'i');
  const structuresWithSameNameOnSameLevel = Structures.find({ name: { $regex: regExp }, parentId });

  return structuresWithSameNameOnSameLevel.count() > 0;
};
