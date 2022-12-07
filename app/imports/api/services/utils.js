export const presetServiceIds = ['addressbook', 'events', 'polls', 'bookmarks', 'articles'];
/**
 * The serviceInternalUrlPath global var
 * need to be defined into the /config/settings.development.json or /config/settings.json file
 * in the public field
 * { "public": { "serviceInternalUrlPath": ...
 */
export const serviceInternalUrlPath = Meteor.settings.public?.serviceInternalUrlPath || 'services';

export const getServiceInternalUrl = ({ service }) => {
  if (presetServiceIds.includes(service._id)) {
    return service.url;
  }

  return `/${serviceInternalUrlPath}/${service.slug}`;
};
