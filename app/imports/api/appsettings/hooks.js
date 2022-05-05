import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import AppSettings from './appsettings';
import { getCurrentIntroduction } from '../utils';

export const useCurrentIntroduction = () =>
  useTracker(() => {
    const handle = Meteor.subscribe('appsettings.introduction');
    const loading = !handle.ready();

    const appsettings = AppSettings.findOne() || {};
    const { introduction = [] } = appsettings;
    const data = getCurrentIntroduction({ introduction });

    return { data, loading };
  });
