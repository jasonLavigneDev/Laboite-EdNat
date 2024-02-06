/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import '../../../startup/i18n/en.i18n.json';
import { faker } from '@faker-js/faker';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import Groups from '../../groups/groups';
import '../../groups/server/factories';
import { setMemberOf } from '../../users/server/methods';

import Articles from '../articles';
import {
  createArticle,
  removeArticle,
  updateArticle,
  visitArticle,
  downloadBackupPublications,
  uploadBackupPublications,
} from '../methods';
import './publications';
import './factories';
import '../../structures/server/factories';

describe('articles', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const article = Factory.create('article');
      assert.typeOf(article, 'object');
    });
  });
  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: Random.id(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      Articles.remove({});
      _.times(3, () => {
        Factory.create('article', { userId });
      });
      _.times(1, () => {
        Factory.create('article', { userId, title: 'coucou' });
      });
      _.times(2, () => {
        Factory.create('article', { userId: Random.id() });
      });
    });
    describe('articles.all', function () {
      it('sends all articles', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.all', { userId, page: 1, search: '', itemPerPage: 10 }, (collections) => {
          assert.equal(collections.articles.length, 4);
          done();
        });
        const nbArticles = Meteor.call('get_articles.all_count', { userId });
        assert.equal(nbArticles, 4);
      });
      it('sends all articles with pagination', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.all', { userId, page: 2, search: '', itemPerPage: 2 }, (collections) => {
          assert.equal(collections.articles.length, 2);
          done();
        });
      });
      it('sends all articles with search', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.all', { userId, page: 1, search: 'coucou', itemPerPage: 10 }, (collections) => {
          assert.equal(collections.articles.length, 1);
          done();
        });
      });
    });
    describe('articles.one', function () {
      it('sends one article', function (done) {
        const artFound = Articles.findOne({ userId, title: 'coucou' });
        const collector = new PublicationCollector({ userId });
        collector.collect('articles.one', { slug: artFound.slug }, (collections) => {
          assert.equal(collections.articles.length, 1);
          const art = collections.articles[0];
          assert.typeOf(art, 'object');
          assert.equal(art.title, 'coucou');
          done();
        });
      });
    });
  });
  describe('group publications', function eventPublications() {
    let userId;
    let adminId;
    let memberId;
    let group;
    let group2;
    let groupId;
    let group2Id;
    beforeEach(function beforeTesting() {
      Groups.remove({});
      Articles.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      Meteor.users.remove({});
      Roles.createRole('admin');
      Roles.createRole('member');

      userId = Accounts.createUser({
        username: 'randomguy',
        password: 'toto',
        email: faker.internet.email(),
        structure: faker.company.name(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });
      adminId = Accounts.createUser({
        email: faker.internet.email(),
        username: 'admin',
        password: 'toto',
        structure: faker.company.name(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });
      memberId = Accounts.createUser({
        email: faker.internet.email(),
        username: 'member',
        password: 'toto',
        structure: faker.company.name(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      Roles.addUsersToRoles(adminId, 'admin');
      group = Factory.create('group', { owner: adminId, type: 0 });
      groupId = group._id;
      group2 = Factory.create('group', { owner: adminId, type: 5 });
      group2Id = group2._id;
      setMemberOf._execute({ userId: memberId }, { userId: memberId, groupId });
      setMemberOf._execute({ userId: adminId }, { userId: memberId, groupId: group2Id });

      _.times(3, () => {
        Factory.create('article', {
          _id: Random.id(),
          userId: adminId,
          groups: [
            { _id: groupId, name: 'group', type: 0 },
            { _id: group2Id, name: 'group2', type: 5 },
          ],
        });
      });
    });
    describe('groups.articles', function eventsForUserPub() {
      it('does send articles from a public group when not member', function groupArticlesPub(done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'groups.articles',
          { page: 1, search: '', slug: group.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.articles.length, 3);
            done();
          },
        );
      });
      it('does not send articles from a protected group when not member', function groupArticlesProtected(done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'groups.articles',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.articles, undefined);
            done();
          },
        );
      });
      it('does send articles from a protected group when admin', function groupArticlesProtectedAdmin(done) {
        const collector = new PublicationCollector({ userId: adminId });
        collector.collect(
          'groups.articles',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.articles.length, 3);
            done();
          },
        );
      });
      it('does send articles from a protected group when member', function groupArticlesProtectedMember(done) {
        const collector = new PublicationCollector({ userId: memberId });
        collector.collect(
          'groups.articles',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.articles.length, 3);
            done();
          },
        );
      });
    });
  });
  describe('methods', function () {
    let userId;
    let userStructure;
    let otherUserId;
    let articleId;
    let articleData;
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      // Generate 'users'
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: `userId_${Random.id()}`,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      otherUserId = Accounts.createUser({
        email: faker.internet.email(),
        username: 'otherUser',
        password: 'toto',
        structure: Random.id(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      userStructure = Meteor.users.findOne(userId).structure;
      Articles.remove({});
      articleData = {
        title: 'Chat sur un nuage de licorne',
        description: "Chevaucher un dragon rose à pois. C'est en fait une fée pour piéger Peter Pan",
        content: "<div>c'est un article de fou</div>",
      };
      articleId = Factory.create('article', { userId, structure: 'la troisième dimension' })._id;
      _.times(3, () => {
        Factory.create('article', { userId, structure: 'la troisième dimension' });
      });
    });
    describe('createArticle', function () {
      it('does create an article with basic user', function () {
        createArticle._execute({ userId }, { data: articleData });
        const article = Articles.findOne({ title: articleData.title, userId });
        assert.typeOf(article, 'object');
        assert.equal(article.slug.search('chat-sur-un-nuage-de-licorne') !== -1, true);
        assert.equal(article.structure, userStructure);
      });
      it("does not create an article if you're not logged in", function () {
        // Throws if logged out user, tries to create an article
        assert.throws(
          () => {
            createArticle._execute({}, { data: articleData });
          },
          Meteor.Error,
          /api.articles.createArticle.notLoggedIn/,
        );
      });
    });
    describe('removeArticle', function () {
      it('does delete an article belonging to user', function () {
        removeArticle._execute({ userId }, { articleId });
        assert.equal(Articles.findOne(articleId), undefined);
      });
      it("does not delete a service you're not autor of", function () {
        // Throws if non author, or logged out user, tries to delete an article
        assert.throws(
          () => {
            removeArticle._execute({ userId: otherUserId }, { articleId });
          },
          Meteor.Error,
          /api.articles.removeArticle.notPermitted/,
        );
        assert.throws(
          () => {
            removeArticle._execute({}, { articleId });
          },
          Meteor.Error,
          /api.articles.removeArticle.notLoggedIn/,
        );
      });
    });
    describe('updateArticle', function () {
      const data = {
        title: 'Chat sur MIMOSA',
        description: 'article modifié',
        content: "<div>c'est toujours un article de fou</div>",
      };
      it('does update an article with author user', function () {
        const oldDate = Articles.findOne(articleId).updatedAt;
        updateArticle._execute({ userId }, { articleId, data });
        const article = Articles.findOne(articleId);
        assert.equal(article.title, data.title);
        assert.equal(article.description, data.description);
        assert.equal(article.content, data.content);
        assert.equal(article.structure, 'la troisième dimension');
        assert.notEqual(oldDate, article.updatedAt);
      });
      it("does update an article's structure if asked with author user", function () {
        const oldDate = Articles.findOne(articleId).updatedAt;
        updateArticle._execute({ userId }, { articleId, data, updateStructure: true });
        const article = Articles.findOne(articleId);
        assert.equal(article.title, data.title);
        assert.equal(article.description, data.description);
        assert.equal(article.content, data.content);
        assert.equal(article.structure, userStructure);
        assert.notEqual(oldDate, article.updatedAt);
      });
      it("does not update an article if you're not author", function () {
        // Throws if non author user, or logged out user, tries to update the article
        assert.throws(
          () => {
            updateArticle._execute({ otherUserId }, { articleId, data });
          },
          Meteor.Error,
          /api.articles.updateArticle.notPermitted/,
        );
        assert.throws(
          () => {
            updateArticle._execute({}, { articleId, data });
          },
          Meteor.Error,
          /api.articles.updateArticle.notPermitted/,
        );
      });
    });
    describe('visitArticle', function () {
      it('does visit an article incrementing visits', function () {
        let article = Articles.findOne(articleId);
        assert.equal(article.visits, 0);
        visitArticle._execute({}, { articleId });
        article = Articles.findOne(articleId);
        assert.equal(article.visits, 1);
      });
      it('does not increment visits on undefined article', function () {
        assert.throws(
          () => {
            visitArticle._execute({}, { articleId: Random.id() });
          },
          Meteor.Error,
          /api.articles.visitArticle.unknownArticle/,
        );
      });
    });
    describe('downloadBackupPublications', function () {
      it('does send all articles', function () {
        const allart = downloadBackupPublications._execute({ userId });
        assert.typeOf(allart, 'array');
        assert.lengthOf(allart, 4);
      });
      it('does not send all articles if not logged in', function () {
        assert.throws(
          () => {
            downloadBackupPublications._execute({});
          },
          Meteor.Error,
          /api.articles.downloadBackupPublications.notLoggedIn/,
        );
      });
    });
    describe('uploadBackupPublications', function () {
      const articles = [
        {
          title: 'Chat sur un nuage de licorne',
          description: "Chevaucher un dragon rose à pois. C'est en fait une fée pour piéger Peter Pan",
          content: "<div>c'est un article de fou</div>",
          structure: 'la troisième dimension',
        },
        {
          title: 'Chat sur MIMOSA',
          description: 'article modifié',
          content: "<div>c'est toujours un article de fou</div>",
          structure: 'la troisième dimension',
        },
      ];
      it('does upload articles from table', function () {
        Articles.remove({});
        assert.equal(Articles.find({ userId }).count(), 0);
        uploadBackupPublications._execute({ userId }, { articles });
        assert.equal(Articles.find({ userId }).count(), 2);
      });
      it('does reupload downloaded articles', function () {
        const downart = downloadBackupPublications._execute({ userId });
        assert.typeOf(downart, 'array');
        assert.lengthOf(downart, 4);
        Articles.remove({});
        assert.equal(Articles.find({ userId }).count(), 0);
        uploadBackupPublications._execute({ userId }, { articles: downart });
        const uploaded = Articles.find({ userId });
        assert.equal(uploaded.count(), 4);
        // by default, articles original structure should be restored
        uploaded.fetch().forEach((article) => assert.equal(article.structure, 'la troisième dimension'));
      });
      it('does reupload downloaded articles and update structure if asked', function () {
        const downart = downloadBackupPublications._execute({ userId });
        assert.typeOf(downart, 'array');
        assert.lengthOf(downart, 4);
        Articles.remove({});
        assert.equal(Articles.find({ userId }).count(), 0);
        uploadBackupPublications._execute({ userId }, { articles: downart, updateStructure: true });
        const uploaded = Articles.find({ userId });
        assert.equal(uploaded.count(), 4);
        uploaded.fetch().forEach((article) => assert.equal(article.structure, userStructure));
      });
      it('does not upload articles if not logged in', function () {
        assert.throws(
          () => {
            uploadBackupPublications._execute({}, { articles });
          },
          Meteor.Error,
          /api.articles.uploadBackupPublications.notLoggedIn/,
        );
      });
    });
  });
});
