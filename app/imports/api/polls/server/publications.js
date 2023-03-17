import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { Roles } from 'meteor/alanning:roles';
import Polls from '../polls';
import Groups from '../../groups/groups';

import { checkPaginationParams, isActive } from '../../utils';
import logServer, { levels, scopes } from '../../logging';

// build query for all users from group
const queryGroupPolls = ({ search, group, onlyPublic }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['title', 'description'];
  const searchQuery = fieldsToSearch.map((field) => ({
    [field]: { $regex: regex },
    groups: group._id,
    active: true,
  }));
  if (onlyPublic)
    return {
      $or: searchQuery,
      public: true,
    };
  return {
    $or: searchQuery,
  };
};

Meteor.methods({
  'get_groups.polls_count': function getPollsAllCount({ search, slug }) {
    try {
      const group = Groups.findOne({ slug });

      let query = {};
      if (group.type !== 0 && !Roles.userIsInRole(this.userId, ['admin', 'animator', 'member'], group._id)) {
        query = queryGroupPolls({ search, group, onlyPublic: true });
      } else query = queryGroupPolls({ search, group, onlyPublic: false });

      return Polls.find(query).count();
    } catch (error) {
      return 0;
    }
  },
});

// publish all existing polls for one group
FindFromPublication.publish('groups.polls', function groupsPolls({ page, search, slug, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    // logServer(`publish groups.polls : ${err}`);
    logServer(`POLLS - PUBLICATION - groups.polls, publish groups.polls : ${err}`, levels.ERROR, scopes.SYSTEM, {
      page,
      search,
      slug,
      itemPerPage,
    });
    this.error(err);
  }
  const group = Groups.findOne({ slug });
  try {
    // for protected/private groups, publish only public polls for non member users
    let query = {};
    if (group.type !== 0 && !Roles.userIsInRole(this.userId, ['admin', 'animator', 'member'], group._id)) {
      query = queryGroupPolls({ search, group, onlyPublic: true });
    } else query = queryGroupPolls({ search, group, onlyPublic: false });

    const res = Polls.find(query, {
      fields: Polls.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { updatedAt: -1 },
      ...rest,
    });
    return res;
  } catch (error) {
    return this.ready();
  }
});
