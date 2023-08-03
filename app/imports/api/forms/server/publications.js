import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { Roles } from 'meteor/alanning:roles';
import Forms from '../forms';
import { checkPaginationParams, isActive } from '../../utils';
import logServer from '../../logging';
import Groups from '../../groups/groups';

// build query for all users from group
const queryGroupForms = ({ search, group }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['title', 'description'];

  const searchQuery = fieldsToSearch.map((field) => ({
    [field]: { $regex: regex },
    groups: { $in: [group._id] },
    active: true,
  }));
  return {
    $or: searchQuery,
  };
};

Meteor.methods({
  'get_groups.forms_count': function getFormsAllCount({ search, slug }) {
    try {
      const form = Groups.findOne(
        { slug },
        {
          fields: Groups.allPublicFields,
          limit: 1,
          sort: { createdAt: -1 },
        },
      );
      const query = queryGroupForms({ search, form });
      return Forms.find(query).count();
    } catch (error) {
      return 0;
    }
  },
});

// publish all existing events for specific group
FindFromPublication.publish('groups.forms', function groupForms({ page, search, slug, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish groups.forms : ${err}`);
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
    const query = queryGroupForms({ search, group });
    const res = Forms.find(query, {
      fields: Forms.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { createdAt: -1 },
      ...rest,
    });

    return res;
  } catch (error) {
    return this.ready();
  }
});
