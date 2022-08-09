// Keep this as pure constant out of the function
const DEFAULT_FIELDS_TO_SEARCH = ['firstName', 'lastName', 'emails.address', 'username', 'structure'];

// build query for all users from group
export const queryUsersAdmin = ({ search, fieldsToSearch = DEFAULT_FIELDS_TO_SEARCH }) => {
  const regex = new RegExp(search.split(' ').join('|'), 'i');
  const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));

  return { $or: searchQuery };
};
