import { Meteor } from 'meteor/meteor';
import AppSettings from '../../../api/appsettings/appsettings';

Meteor.startup(() => {
  if (!AppSettings.findOne()) {
    AppSettings.insert({
      _id: 'settings',
      introduction: {
        external: false,
        link: '',
        content: '',
      },
      legal: {
        external: false,
        link: '',
        content: '',
      },
      accessibility: {
        external: false,
        link: '',
        content: '',
      },
      gcu: {
        external: false,
        link: '',
        content: '',
      },
      personalData: {
        external: false,
        link: '',
        content: '',
      },
    });
  }
});
