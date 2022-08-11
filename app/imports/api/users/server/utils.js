// Keep this as pure constant out of the function
export const DEFAULT_FIELDS_TO_SEARCH_ON_ADMIN = ['firstName', 'lastName', 'emails.address', 'username', 'structure'];

export const makeCreateSearchQuery =
  (fieldsToSearch = []) =>
  ({ search }) => {
    const regex = new RegExp(search.split(' ').join('|'), 'i');
    const searchQuery = fieldsToSearch.map((field) => ({ [field]: { $regex: regex } }));

    return { $or: searchQuery };
  };

// build query for all users from group
export const queryUsersAdmin = makeCreateSearchQuery(DEFAULT_FIELDS_TO_SEARCH_ON_ADMIN);
