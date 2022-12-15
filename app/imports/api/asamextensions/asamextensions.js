import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { getLabel } from '../utils';

const AsamExtensions = new Mongo.Collection('asamextensions');

AsamExtensions.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});

/**
 * About:
 * `entiteNomCourt`, `entiteNomLong', `familleNomCourt`, `familleNomLong`
 *
 * These are used for helping admin user to think about the right structure to match
 *
 * These are not to be taken as truth or correct name for x or y structure
 */
AsamExtensions.schema = new SimpleSchema({
  extension: {
    type: String,
    label: getLabel('api.asamextensions.labels.extension'),
    min: 1,
  },

  entiteNomCourt: {
    type: String,
    label: getLabel('api.asamextensions.labels.entiteNomCourt'),
  },
  entiteNomLong: { type: String, label: getLabel('api.asamextensions.labels.entiteNomLong') },
  familleNomCourt: { type: String, label: getLabel('api.asamextensions.labels.familleNomCourt') },
  familleNomLong: { type: String, label: getLabel('api.asamextensions.labels.familleNomLong') },
  structureId: {
    type: SimpleSchema.RegEx.Id,
    label: getLabel('api.asamextensions.labels.structureId'),
    defaultValue: null,
  },
});

AsamExtensions.publicFields = {
  extension: 1,
  entiteNomCourt: 1,
  entiteNomLong: 1,
  familleNomCourt: 1,
  familleNomLong: 1,
  structureId: 1,
};
export default AsamExtensions;
