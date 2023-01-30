import { Meteor } from 'meteor/meteor';
import AsamExtensions from '../asamextensions';

Meteor.publish('asamextensions.all', function getAllAsam() {
  const searchResult = AsamExtensions.find(
    {},
    {
      fields: AsamExtensions.publicFields,
      sort: { extension: 1 },
      limit: 10000,
    },
  );

  return searchResult;
});
