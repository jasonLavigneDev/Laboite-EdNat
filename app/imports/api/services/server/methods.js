import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel } from '../../utils';
import Services from '../services';
import { removeFilesFolder } from '../../files/server/methods';
import { hasAdminRightOnStructure } from '../../structures/utils';

export const removeService = new ValidatedMethod({
  name: 'services.removeService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
  }).validator(),

  run({ serviceId }) {
    // check service existence
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.services.removeService.unknownService', i18n.__('api.services.unknownService'));
    }
    const isStructureAdmin =
      service.structure && hasAdminRightOnStructure({ userId: this.userId, structureId: service.structure });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isStructureAdmin);
    if (!authorized) {
      throw new Meteor.Error('api.services.removeService.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // remove service from users favorites
    Meteor.users.update({ favServices: { $all: [serviceId] } }, { $pull: { favServices: serviceId } }, { multi: true });
    Services.remove(serviceId);
    if (Meteor.isServer && !Meteor.isTest && Meteor.settings.public.minioEndPoint) {
      removeFilesFolder(`services/${service._id}`);
    }
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([removeService], 'name');

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000,
  );
}
