export const getServiceInternalUrl = ({ service }) => {
  const isAddressBook = service._id === 'addressbook';
  const isEvents = service._id === 'events';
  const isPoll = service._id === 'polls';
  const isBookmark = service._id === 'bookmarks';
  const isArticles = service._id === 'articles';
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
    : `/services/${service.slug}`;
};
