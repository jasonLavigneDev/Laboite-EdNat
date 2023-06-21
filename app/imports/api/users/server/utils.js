import { Roles } from 'meteor/alanning:roles';

// Keep this as pure constant out of the function
const DEFAULT_FIELDS_TO_SEARCH = ['firstName', 'lastName', 'emails.address', 'username'];
const DEFAULT_FIELDS_TO_SEARCH_ADMIN = ['firstName', 'lastName', 'emails.address', 'username', 'structure'];

const getAdminIds = (userType) => {
  let userIds = [];
  if (userType === 'adminStructure')
    userIds = Roles.getUsersInRole('adminStructure', { anyScope: true })
      .fetch()
      .map((user) => user._id);
  if (userType === 'admin')
    userIds = Roles.getUsersInRole('admin')
      .fetch()
      .map((user) => user._id);
  return userIds;
};

const queryUsers = (search, userType, fieldsToSearch, initialQuery) => {
  let query = { ...initialQuery };
  const regexes = search
    .split(' ')
    .filter(Boolean)
    .map((term) => new RegExp(`^.*${term}.*$`, 'i'));

  if (userType !== 'all') {
    const userIds = getAdminIds(userType);
    query = { ...query, _id: { $in: userIds } };
  }
  if (regexes.length) {
    const $and = regexes.map((regex) => ({ $or: fieldsToSearch.map((field) => ({ [field]: regex })) }));
    query = { ...query, $and };
  }
  return query;
};

// build query for all users from group
export const queryUsersAdmin = ({ search, userType, fieldsToSearch = DEFAULT_FIELDS_TO_SEARCH_ADMIN }) => {
  const initialQuery = {};
  return queryUsers(search, userType, fieldsToSearch, initialQuery);
};

// build query for all users with same structure
export const queryUsersByStructure = (
  { search, userType, fieldsToSearch = DEFAULT_FIELDS_TO_SEARCH },
  currentStructure,
) => {
  const initialQuery = { structure: currentStructure };
  return queryUsers(search, userType, fieldsToSearch, initialQuery);
};
