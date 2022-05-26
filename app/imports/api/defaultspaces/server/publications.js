import { publishComposite } from 'meteor/reywood:publish-composite';
import { Roles } from 'meteor/alanning:roles';
import { isActive } from '../../utils';
import DefaultSpaces from '../defaultspaces';
import Services from '../../services/services';
import Groups from '../../groups/groups';

// publish personalspace for the connected user
publishComposite('defaultspaces.one', ({ structureId }) => ({
  find() {
    // Find top ten highest scoring posts
    if (!isActive(this.userId) || !Roles.userIsInRole(this.userId, 'admin') || !structureId) {
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
    {
      find(sSpace) {
        // fetch groups associated to personalSpace
        let groups = [];
        sSpace.sorted.forEach((zone) => {
          groups = groups.concat(
            zone.elements.filter((item) => item.type === 'group').map((group) => group.element_id),
          );
        });
        return Groups.find({ _id: { $in: groups } }, { fields: Groups.publicFields, sort: { title: 1 }, limit: 1000 });
      },
    },
  ],
}));
