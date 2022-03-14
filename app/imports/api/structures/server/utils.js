import { Roles } from 'meteor/alanning:roles';
import Structures from '../structures';

export const hasAdminRightOnStructure = ({ userId, structureId }) => {
  const ids = [structureId];
  const _ancestorsIds = Structures.findOne({ _id: structureId }, { fields: { ancestorsIds: 1 } });
  console.log(_ancestorsIds);
  if (_ancestorsIds && _ancestorsIds.length > 0) {
    _ancestorsIds.forEach((ancestor) => ids.push(ancestor));
  }
  //   if (_ancestorsIds) ids.push(..._ancestorsIds);
  const isAdmin = ids.some((ancestorId) => Roles.userIsInRole(userId, 'adminStructure', ancestorId));
  return isAdmin;
};
