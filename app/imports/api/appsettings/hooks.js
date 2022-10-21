import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import AppSettings from './appsettings';
import { getCurrentIntroduction, getCurrentText } from '../utils';

export const useCurrentIntroduction = () =>
  useTracker(() => {
    const handle = Meteor.subscribe('appsettings.introduction');
    const loading = !handle.ready();

    const appsettings = AppSettings.findOne() || {};
    const { introduction = [] } = appsettings;
    const data = getCurrentIntroduction({ introduction });

    return { data, loading };
  });

export const useCurrentGlobalInfo = () =>
  useTracker(() => {
    const handle = Meteor.subscribe('appsettings.globalInfo');
    const loading = !handle.ready();

    const appsettings = AppSettings.findOne() || {};
    const { globalInfo = [] } = appsettings;
    const data = getCurrentText({ globalInfo });

    return { data, loading };
  });
