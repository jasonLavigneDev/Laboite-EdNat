import { isActive } from '../../utils';
import PersonalSpaces from '../personalspaces';
import Services from '../../services/services';
import Groups from '../../groups/groups';
import UserBookmarks from '../../userBookmarks/userBookmarks';
import Bookmarks from '../../bookmarks/bookmarks';

// publish personalspace for the connected user
Meteor.publish('personalspaces.self', () => {
  // Find top ten highest scoring posts
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const personalSpacesCursor = PersonalSpaces.find(
    { userId: this.userId },
    { fields: PersonalSpaces.publicFields, limit: 1 },
  );
  const personalSpaces = personalSpacesCursor.fetch();

  if (!personalSpaces.length) {
    return this.ready();
  }

  const pSpace = personalSpaces[0];

  const { services, groups, links, groupLinks } = [...pSpace.unsorted, ...pSpace.sorted].reduce(
    (acc, element) => {
      acc[`${element.type}s`].push(element.element_id);

      return acc;
    },
    {
      services: [],
      groups: [],
      links: [],
      groupLinks: [],
    },
  );

  // fetch services associated to personalSpace
  const servicesCursor = Services.find(
    { _id: { $in: services } },
    { fields: Services.publicFields, sort: { title: 1 }, limit: 1000 },
  );

  // fetch groups associated to personalSpace
  const groupsCursor = Groups.find(
    { _id: { $in: groups } },
    { fields: Groups.publicFields, sort: { title: 1 }, limit: 1000 },
  );

  // fetch bookmarks associated to personalSpace
  const userBookmarksCursor = UserBookmarks.find(
    { _id: { $in: links } },
    { fields: UserBookmarks.publicFields, sort: { title: 1 }, limit: 1000 },
  );

  // fetch bookmarks associated to personalSpace
  const groupBookmarksCursor = Bookmarks.find(
    { _id: { $in: groupLinks } },
    { fields: Bookmarks.publicFields, sort: { title: 1 }, limit: 1000 },
  );

  return [personalSpacesCursor, servicesCursor, groupsCursor, userBookmarksCursor, groupBookmarksCursor];
});
