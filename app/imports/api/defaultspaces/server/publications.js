import { isActive } from '../../utils';
import DefaultSpaces from '../defaultspaces';
import Services from '../../services/services';
import { hasAdminRightOnStructure } from '../../structures/utils';

// publish personalspace for the connected user
Meteor.publish('defaultspaces.one', function publishDefaultSpaceOne({ structureId }) {
  const isAdminStructure = hasAdminRightOnStructure({ userId: this.userId, structureId });

  if (!isActive(this.userId) || !isAdminStructure || !structureId) {
    return this.ready();
  }

  const defaultSpacesCursor = DefaultSpaces.find({ structureId }, { sort: { structureId: 1 }, limit: 1 });
  const defaultsSpaces = defaultSpacesCursor.fetch();

  if (!defaultsSpaces.length) {
    return this.ready();
  }

  let services = [];
  defaultsSpaces[0].sorted.forEach((zone) => {
    services = services.concat(
      zone.elements.filter((item) => item.type === 'service').map((service) => service.element_id),
    );
  });

  const servicesCursor = Services.find(
    { _id: { $in: services } },
    { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 },
  );

  return [defaultSpacesCursor, servicesCursor];
});
