import { Meteor } from 'meteor/meteor';
import Tags from '../../../api/tags/tags';
import fakeData from './fakeData.json';
import logServer, { levels, scopes } from '../../../api/logging';

function createTag(tag) {
  // logServer(`  Creating tag ${tag.name}.`);
  logServer(`STARTUP - TAGS - createTag - Creating tag ${tag.name}. `, levels.INFO, scopes.SYSTEM, {
    tag,
  });
  Tags.insert(tag);
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Tags.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData) {
    // logServer('Creating the default tags');
    logServer(`STARTUP - TAGS - createTag - Creating the default tags `, levels.INFO, scopes.SYSTEM, {});
    if (fakeData.defaultTags !== undefined) {
      fakeData.defaultTags.map((tag) => createTag(tag));
    }
  } else {
    // logServer('No default tags to create !  Please invoke meteor with a settings file.');
    logServer(
      `No default tags to create !  Please invoke meteor with a settings file. `,
      levels.ERROR,
      scopes.SYSTEM,
      {},
    );
  }
}
