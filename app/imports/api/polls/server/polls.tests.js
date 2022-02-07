/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import './factories';
import './publications';
import Polls from '../polls';
import Groups from '../../groups/groups';
import { setMemberOf } from '../../users/server/methods';

describe('polls', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const poll = Factory.create('poll');
      assert.typeOf(poll, 'object');
    });
  });

  describe('publications', function () {
    let userId;
    let adminId;
    let memberId;
    let group;
    let group2;
    let groupId;
    let group2Id;
    before(function () {
      Polls.remove({});
      Meteor.users.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      Groups.remove({});
      Roles.createRole('admin');
      Roles.createRole('member');

      userId = Accounts.createUser({
        username: 'randomguy',
        password: 'toto',
        email: faker.internet.email(),
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });
      adminId = Accounts.createUser({
        email: faker.internet.email(),
        username: 'admin',
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });
      memberId = Accounts.createUser({
        email: faker.internet.email(),
        username: 'member',
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        groupCount: 0,
        groupQuota: 10,
      });
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      Roles.addUsersToRoles(adminId, 'admin');
      group = Factory.create('group', { owner: adminId, trype: 0 });
      groupId = group._id;
      group2 = Factory.create('group', { owner: adminId, type: 5 });
      group2Id = group2._id;
      setMemberOf._execute({ userId: memberId }, { userId: memberId, groupId });
      setMemberOf._execute({ userId: adminId }, { userId: memberId, groupId: group2Id });

      new Array(3).fill(0).forEach(() => {
        Factory.create('poll', { groups: [groupId, group2Id], public: false });
      });
      Factory.create('poll', { groups: [groupId, group2Id], public: true });
    });

    describe('groups.polls', function () {
      it('does send polls from a public group when not member', function groupPollsPub(done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('groups.polls', { page: 1, search: '', slug: group.slug, itemPerPage: 10 }, (collections) => {
          assert.equal(collections.polls.length, 4);
          done();
        });
      });
      it('does not send private polls from a protected group when not member', function groupPollsProtected(done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'groups.polls',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.polls.length, 1);
            done();
          },
        );
      });
      it('does send polls from a protected group when admin', function groupPollsProtectedAdmin(done) {
        const collector = new PublicationCollector({ userId: adminId });
        collector.collect(
          'groups.polls',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.polls.length, 4);
            done();
          },
        );
      });
      it('does send polls from a protected group when member', function groupPollsProtectedMember(done) {
        const collector = new PublicationCollector({ userId: memberId });
        collector.collect(
          'groups.polls',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.polls.length, 4);
            done();
          },
        );
      });
    });
  });
});
