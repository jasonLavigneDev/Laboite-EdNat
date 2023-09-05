import { Meteor } from 'meteor/meteor';
import { Settings } from '../settings';

Meteor.publish(function PublishSettings() {
  return Settings.find({}, { fields: { public: 1 } });
});

Meteor.startup(() => {
  if (!Settings.findOne()) {
    Settings.insert({
      public: Meteor.settings.public,
    });
  }
});
