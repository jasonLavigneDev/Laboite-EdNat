import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import Articles from '../../../api/articles/articles';
import logServer, { levels, scopes } from '../../../api/logging';

const users = (number) => {
  const limit = Math.floor(Math.random() * number);
  const skip = Math.floor(Math.random() * 1000);
  return Meteor.users.find({}, { limit, skip, fields: { _id: 1, structure: 1 } }).map(({ _id, structure }) => {
    return {
      userId: _id,
      structure,
    };
  });
};

/** When running app for first time, pass a settings file to set up default groups. */
if (Articles.find().count() === 0) {
  if (Meteor.settings.private.fillWithFakeData && Meteor.isDevelopment) {
    const PUBLISHERS_RANDOM = 100;
    const publishers = users(PUBLISHERS_RANDOM);
    // logServer('Creating the default articles.');
    logServer(`STARTUP - ARTICLES - Creating the default articles.`, levels.INFO, scopes.SYSTEM, {});
    publishers.forEach(({ userId, structure }) => {
      const array = new Array(Math.floor(Math.random() * 30));
      array.fill(0);
      array.forEach(() => {
        const title = faker.lorem.sentence();
        // make sure that description length is limited to 400
        const description = faker.lorem.paragraph().substring(0, 399);
        try {
          Articles.insert({
            userId,
            structure,
            title,
            description,
            content: faker.lorem.paragraphs(),
          });
          Meteor.users.update({ _id: userId }, { $inc: { articlesCount: 1 }, $set: { lastArticle: new Date() } });
        } catch (error) {
          // logServer(`Error creating article: ${error.reason || error.message || error}`);
          logServer(
            `STARTUP - ARTICLES - Error creating article: ${error.reason || error.message || error}`,
            levels.INFO,
            scopes.SYSTEM,
            {},
          );
        }
      });
    });
  }
}
