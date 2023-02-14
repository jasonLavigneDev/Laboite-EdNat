import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';

import { isActive, getLabel } from '../utils';
import slugy from '../../ui/utils/slugy';
import { hasAdminRightOnStructure } from '../structures/utils';
import Services from './services';
import { addService, removeElement } from '../personalspaces/methods';

export const createService = new ValidatedMethod({
  name: 'services.createService',
  validate: new SimpleSchema({
    data: Services.schema.omit('slug'),
  }).validator({ clean: true }),

  run({ data }) {
    // admins can create structure services only for their structure if they have adminStructure permissions
    const isStructureAdmin =
      data.structure && hasAdminRightOnStructure({ userId: this.userId, structureId: data.structure });
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');
    const authorized = isActive(this.userId) && (isAdmin || isStructureAdmin);
    if (!authorized) {
      throw new Meteor.Error('api.services.createService.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    const sv = Services.findOne({ slug: slugy(data.title), structure: data.structure });
    if (sv !== undefined) {
      throw new Meteor.Error(
        'api.services.createService.ServiceAlreadyExists',
        i18n.__('api.services.ServiceAlreadyExists'),
      );
    }
    const serviceId = Services.insert(data);

    Services.update(serviceId, {
      $set: {
        logo: data.logo.replace('/undefined/', `/${serviceId}/`),
        screenshots: data.screenshots.map((screen) => screen.replace('/undefined/', `/${serviceId}/`)),
      },
    });

    if (Meteor.isServer && !Meteor.isTest && Meteor.settings.public.minioEndPoint) {
      const files = [data.logo, ...data.screenshots];
      try {
        Meteor.call('files.move', {
          sourcePath: 'services/undefined',
          destinationPath: `services/${serviceId}`,
          files,
        });
      } catch (error) {
        throw new Meteor.Error('api.services.createService.moveError', error.message);
      }
    }
  },
});

export const updateService = new ValidatedMethod({
  name: 'services.updateService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
    data: Services.schema.omit('slug', 'structure'),
  }).validator({ clean: true }),

  run({ data, serviceId }) {
    // check service existence
    const currentService = Services.findOne({ _id: serviceId });
    if (currentService === undefined) {
      throw new Meteor.Error('api.services.updateService.unknownGroup', i18n.__('api.services.unknownService'));
    }
    // check if current user has admin or structureAdmin rights (structure can not be changed)
    const isStructureAdmin =
      currentService.structure &&
      hasAdminRightOnStructure({ userId: this.userId, structureId: currentService.structure });
    const authorized = isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isStructureAdmin);
    if (!authorized) {
      throw new Meteor.Error('api.services.updateService.notPermitted', i18n.__('api.users.adminNeeded'));
    }
    // update service data, making sure that structure is not modified
    Services.update({ _id: serviceId }, { $set: { ...data, structure: currentService.structure } });

    if (Meteor.isServer && !Meteor.isTest && Meteor.settings.public.minioEndPoint) {
      const files = [data.logo, ...data.screenshots];
      Meteor.call('files.selectedRemove', {
        path: `services/${serviceId}`,
        toKeep: files,
      });
    }
  },
});

export const favService = new ValidatedMethod({
  name: 'services.favService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
  }).validator(),

  run({ serviceId }) {
    if (!this.userId) {
      throw new Meteor.Error('api.services.favService.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    // check service existence
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.services.favService.unknownService', i18n.__('api.services.unknownService'));
    }
    const user = Meteor.users.findOne(this.userId);
    // store service in user favorite services
    if (user.favServices.indexOf(serviceId) === -1) {
      Meteor.users.update(this.userId, {
        $push: { favServices: serviceId },
      });
    }
    // update user personalSpace
    addService._execute({ userId: this.userId }, { serviceId });
  },
});

export const unfavService = new ValidatedMethod({
  name: 'services.unfavService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id, label: getLabel('api.services.labels.id') },
  }).validator(),

  run({ serviceId }) {
    if (!this.userId) {
      throw new Meteor.Error('api.services.unfavService.notPermitted', i18n.__('api.users.mustBeLoggedIn'));
    }
    const user = Meteor.users.findOne(this.userId);
    // remove service from user favorite services
    if (user.favServices.indexOf(serviceId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { favServices: serviceId },
      });
    }
    // update user personalSpace
    removeElement._execute({ userId: this.userId }, { type: 'service', elementId: serviceId });
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck([createService, updateService, favService, unfavService], 'name');

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
