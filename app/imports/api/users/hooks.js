import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

export const useAwaitingUsers = ({ structureId = null }) => {
  return useTracker(() => {
    const handle = Meteor.subscribe('users.awaitingForStructure', { structureId });
    const data = Meteor.users.find({ awaitingStructure: structureId }).fetch();
    return { data, loading: !handle.ready(), nbAwaiting: data.length };
  }, []);
};
