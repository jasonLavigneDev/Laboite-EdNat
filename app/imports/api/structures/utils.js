// import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import AppSettings from '../appsettings/appsettings';
import Structures from './structures';

export const hasAdminRightOnStructure = ({ userId, structureId }) => {
  const ids = [structureId];
  const structure = Structures.findOne({ _id: structureId }, { fields: { ancestorsIds: 1 } });

  if (structure && structure.ancestorsIds.length > 0) structure.ancestorsIds.forEach((ancestor) => ids.push(ancestor));

  const isAdmin = ids.some((id) => Roles.userIsInRole(userId, 'adminStructure', id));
  return isAdmin;
};

export const isAStructureWithSameNameExistWithSameParent = ({ name, parentId, structureId = undefined }) => {
  const regExp = new RegExp(`^${name}$`, 'i');
  const query = {
    name: { $regex: regExp },
    parentId,
  };

  // structureId will be undefined if we are in a create-structure scenario
  // so, don't need to use it
  // otherwise, we need to exclude the concerned structure from the query
  // that's why we use `$ne` clause/operator
  if (typeof structureId === 'string') {
    query._id = { $ne: structureId };
  }
  const structuresWithSameNameOnSameLevel = Structures.find({
    ...query,
  });
  return structuresWithSameNameOnSameLevel.count() > 0;
};

/** either app level admin or just structure level admin (direct) */
export const hasRightToAcceptAwaitingStructure = ({ userId, awaitingStructureId }) => {
  const isAdminStructure = Roles.userIsInRole(userId, 'adminStructure', awaitingStructureId);
  const isAppAdmin = Roles.userIsInRole(userId, 'admin');
  return isAdminStructure || isAppAdmin;
};

export const hasRightToSetStructureDirectly = (userId, structureId) => {
  const appSettings = AppSettings.findOne({ _id: 'settings' });
  const structure = Structures.findOne({ _id: structureId });

  const { userStructureValidationMandatory: isUserStructureValidationMandatoryAdminLevel } = appSettings;

  const isUserStructureValidationMandatoryStructureAdminLevel =
    structure && structure.userStructureValidationMandatory !== undefined && structure.userStructureValidationMandatory;

  return !isUserStructureValidationMandatoryAdminLevel && !isUserStructureValidationMandatoryStructureAdminLevel;
};
