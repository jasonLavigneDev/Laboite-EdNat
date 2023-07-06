import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Groups from '../../api/groups/groups';
import Services from '../../api/services/services';
import PersonalSpaces from '../../api/personalspaces/personalspaces';
import UserBookmarks from '../../api/userBookmarks/userBookmarks';
import PersonalZoneUpdater from '../components/users/PersonalZoneUpdater';
import AppSettings from '../../api/appsettings/appsettings';
import Bookmarks from '../../api/bookmarks/bookmarks';

export default withTracker(() => {
  const subscription = Meteor.subscribe('personalspaces.self');
  const personalspace = PersonalSpaces.findOne() || { userId: this.userId, unsorted: [], sorted: [] };
  const allServices = Services.find().fetch();
  const allGroups = Groups.find().fetch();
  const allLinks = UserBookmarks.find().fetch();
  const allGroupLinks = Bookmarks.find().fetch();
  const appSettingsValues = AppSettings.findOne() || {};
  return {
    personalspace,
    isLoading: !subscription.ready(),
    allServices,
    allGroups,
    allLinks,
    allGroupLinks,
    appSettingsValues,
  };
})(PersonalZoneUpdater);
