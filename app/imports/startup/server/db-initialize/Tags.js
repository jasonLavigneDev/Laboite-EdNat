import { Meteor } from 'meteor/meteor';
import Tags from '../../../api/tags/tags';
import fakeData from './fakeData.json';
import logServer, { levels, scopes } from '../../../api/logging';

function createTag(tag) {
  logServer(`STARTUP - TAGS - INSERT - createTag - Creating tag ${tag.name}. `, levels.INFO, scopes.SYSTEM, {
    tag,
  });
  Tags.insert(tag);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Tags.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    logServer(`STARTUP - TAGS - CREATE - createTag - Creating the default tags `, levels.INFO, scopes.SYSTEM);
    if (fakeData.defaultTags !== undefined) {
      fakeData.defaultTags.map((tag) => createTag(tag));
    }
  } else {
    logServer(
      `STARTUP - TAGS - ERROR - No default tags to create !  Please invoke meteor with a settings file.`,
      levels.ERROR,
      scopes.SYSTEM,
    );
  }
}
