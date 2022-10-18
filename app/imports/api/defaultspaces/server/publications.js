import { publishComposite } from 'meteor/reywood:publish-composite';
import { isActive } from '../../utils';
import DefaultSpaces from '../defaultspaces';
import Services from '../../services/services';
import { hasAdminRightOnStructure } from '../../structures/utils';

// publish personalspace for the connected user
publishComposite('defaultspaces.one', ({ structureId }) => ({
  find() {
    const isAdminStructure = hasAdminRightOnStructure({ userId: this.userId, structureId });
    if (!isActive(this.userId) || !isAdminStructure || !structureId) {
      return this.ready();
    }
    return DefaultSpaces.find({ structureId }, { sort: { structureId: 1 }, limit: 1 });
  },
  children: [
    {
      find(sSpace) {
        // fetch services associated to personalSpace
        let services = [];
        sSpace.sorted.forEach((zone) => {
          services = services.concat(
            zone.elements.filter((item) => item.type === 'service').map((service) => service.element_id),
          );
        });
        return Services.find(
          { _id: { $in: services } },
          { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 },
        );
      },
    },
  ],
}));
