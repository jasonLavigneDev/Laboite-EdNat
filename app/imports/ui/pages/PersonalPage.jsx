import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Groups from '../../api/groups/groups';
import Services from '../../api/services/services';
import PersonalSpaces from '../../api/personalspaces/personalspaces';
import UserBookmarks from '../../api/userBookmarks/userBookmarks';
import PersonalZoneUpdater from '../components/users/PersonalZoneUpdater';

export default withTracker(() => {
  const subscription = Meteor.subscribe('personalspaces.self');
  const personalspace = PersonalSpaces.findOne() || { userId: this.userId, unsorted: [], sorted: [] };
  const allServices = Services.find().fetch();
  const allGroups = Groups.find().fetch();
  const allLinks = UserBookmarks.find().fetch();
  return {
    personalspace,
    isLoading: !subscription.ready(),
    allServices,
    allGroups,
    allLinks,
  };
})(PersonalZoneUpdater);
