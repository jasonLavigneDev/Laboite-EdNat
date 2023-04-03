import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { Roles } from 'meteor/alanning:roles';
import EventsAgenda from '../eventsAgenda';
import { checkPaginationParams, isActive } from '../../utils';
import logServer, { levels, scopes } from '../../logging';
import Groups from '../../groups/groups';

// build query for all users from group
const queryGroupEvents = ({ search, group }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['title', 'start', 'end'];
  const searchQuery = fieldsToSearch.map((field) => ({
    [field]: { $regex: regex },
    groups: { $elemMatch: { _id: group._id } },
  }));
  return {
    $or: searchQuery,
  };
};

Meteor.methods({
  'get_groups.events_count': function getArticlesAllCount({ search, slug }) {
    try {
      const group = Groups.findOne(
        { slug },
        {
          fields: Groups.allPublicFields,
          limit: 1,
          sort: { name: -1 },
        },
      );
      const query = queryGroupEvents({ search, group });
      return EventsAgenda.find(query).count();
    } catch (error) {
      return 0;
    }
  },
});

// publish all existing events for specific group
FindFromPublication.publish('groups.events', function groupsEvents({ page, search, slug, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    // logServer(`publish groups.events : ${err}`);
    logServer(
      `EVENTSAGENDA - PUBLICATION - groups.events, publish groups.events : ${err}`,
      levels.ERROR,
      scopes.SYSTEM,
      {
        page,
        search,
        slug,
        itemPerPage,
      },
    );
    this.error(err);
  }
  const group = Groups.findOne(
    { slug },
    {
      fields: Groups.allPublicFields,
      limit: 1,
      sort: { name: -1 },
    },
  );
  // for protected/private groups, publish events only for allowed users
  if (
    group === undefined ||
    (group.type !== 0 && !Roles.userIsInRole(this.userId, ['admin', 'animator', 'member'], group._id))
  ) {
    return this.ready();
  }

  try {
    const query = queryGroupEvents({ search, group });
    const res = EventsAgenda.find(query, {
      fields: EventsAgenda.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { name: -1 },
      ...rest,
    });

    return res;
  } catch (error) {
    return this.ready();
  }
});
