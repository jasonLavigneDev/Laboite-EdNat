import { Meteor } from 'meteor/meteor';

import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { getLabel, isActive } from '../../utils';
import Services from '../services';
import Categories from '../../categories/categories';
import logServer, { levels, scopes } from '../../logging';

import { hasAdminRightOnStructure } from '../../structures/utils';

// publish available services not attached to a structure
Meteor.publish('services.all', function servicesAll() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Services.find({ structure: '' }, { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 });
});

// publish available sergices attached to current user structure
FindFromPublication.publish('services.structure', function servicesStructure() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const userStructure = Meteor.users.findOne(this.userId).structure;
  if (userStructure) {
    return Services.find(
      { structure: userStructure },
      { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 },
    );
  }
  return this.ready();
});

FindFromPublication.publish('services.structure.ids', function servicesStructureIds({ structureIds = [] }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }

  return Services.find(
    {
      structure: {
        $in: structureIds,
      },
    },
    {
      fields: Services.publicFields,
      sort: { title: 1 },
      limit: 1000,
    },
  );
});

FindFromPublication.publish('services.one.admin', function servicesOne({ _id }) {
  try {
    new SimpleSchema({
      _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ _id });
  } catch (err) {
    logServer(
      `SERVICES - PUBLICATION - ERROR - services.one.admin, publish services.one.admin : ${err}`,
      levels.ERROR,
      scopes.SYSTEM,
      { _id },
    );
    this.error(err);
  }
  const service = Services.findOne(_id);
  const isStructureAdmin =
    service.structure && hasAdminRightOnStructure({ userId: this.userId, structureId: service.structure });
  if (isActive(this.userId) && (Roles.userIsInRole(this.userId, 'admin') || isStructureAdmin)) {
    return Services.find({ _id }, { fields: Services.allPublicFields, sort: { title: 1 }, limit: 1 });
  }
  return this.ready();
});

FindFromPublication.publish('services.group', function servicesGroup({ ids }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  return Services.find({ _id: { $in: ids } }, { fields: Services.allPublicFields, sort: { title: 1 }, limit: 100 });
});

Meteor.publish('services.one', function publishServicesOne({ slug, structure }) {
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.services.labels.slug'),
      },
      structure: {
        type: String,
        label: getLabel('api.services.labels.structure'),
      },
    }).validate({ slug, structure });
  } catch (err) {
    logServer(
      `SERVICES - PUBLICATION - ERROR - services.one, publish services.one : ${err}`,
      levels.ERROR,
      scopes.SYSTEM,
      {
        slug,
      },
    );
    this.error(err);
  }

  // Find top ten highest scoring posts
  const servicesCursor = Services.find(
    { slug, structure },
    { fields: Services.allPublicFields, sort: { title: 1 }, limit: 1 },
  );
  const services = servicesCursor.fetch();

  if (!services.length) {
    return this.ready();
  }

  const { categories } = services[0];

  // Find top two comments on post
  const categoriesCursor = Categories.find(
    { _id: { $in: categories } },
    { fields: Categories.publicFields, sort: { name: 1 }, limit: 1000 },
  );

  return [servicesCursor, categoriesCursor];
});

Meteor.publish('services.offline', function servicesOffline() {
  return Services.find({ offline: true, state: 0 }, { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 });
});
