export const defaultErrorMessages = {
  unauthorized: `[UN-AUTHORIZED] You are not allowed to perform this action.`,
};

export const unauthorized = (msg = defaultErrorMessages.unauthorized) => {
  return new Meteor.Error(msg);
};
