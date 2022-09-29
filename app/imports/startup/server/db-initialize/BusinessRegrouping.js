import { Meteor } from 'meteor/meteor';
import BusinessReGrouping from '../../../api/businessReGrouping/businessReGrouping';
import fakeData from './fakeData.json';
import logServer from '../../../api/logging';

function createBusinessReGrouping(businessReGrouping) {
  logServer(`  Creating businessReGrouping ${businessReGrouping.name}.`);
  BusinessReGrouping.insert(businessReGrouping);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (BusinessReGrouping.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer('Creating the default businessReGrouping');
    fakeData.defaultBusinessRegrouping.map((businessReGrouping) => createBusinessReGrouping(businessReGrouping));
  } else {
    logServer('No default business regrouping to create !  Please invoke meteor with a settings file.');
  }
}
