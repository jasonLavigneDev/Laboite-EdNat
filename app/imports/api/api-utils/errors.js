export const Unauthorized = (reason = 'Insufficient rights to perform this action', details) => {
  return new Meteor.Error(403, reason, details);
};
