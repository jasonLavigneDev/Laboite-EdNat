export const getServiceInternalUrl = ({ service }) => {
  const isAddressBook = service._id === 'addressbook';
  const isEvents = service._id === 'events';
  const isPoll = service._id === 'polls';
  const isBookmark = service._id === 'bookmarks';
  const isArticles = service._id === 'articles';
  const isForms = service._id === 'forms';
  const isStrucService = service.structure !== '';
  return isAddressBook
    ? service.url
    : isEvents
    ? service.url
    : isPoll
    ? service.url
    : isBookmark
    ? service.url
    : isArticles
    ? service.url
    : isForms
    ? service.url
    : isStrucService
    ? `/services/${service.structure}/${service.slug}`
    : `/services/${service.slug}`;
};
