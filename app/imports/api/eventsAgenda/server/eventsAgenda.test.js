/* eslint-env mocha */
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Roles } from 'meteor/alanning:roles';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'chai';
import moment from 'moment';
import faker from 'faker';
import EventsAgenda from '../eventsAgenda';
import './factories';
import './publications';
import Groups from '../../groups/groups';
import '../../groups/server/factories';
import { setMemberOf } from '../../users/server/methods';

describe('eventAgenda', function eventTests() {
  describe('mutators', function eventMutators() {
    it('builds correctly from factory', function eventFactory() {
      const event = Factory.create('eventAgenda');
      assert.typeOf(event, 'object');
    });
  });
  describe('publications', function eventPublications() {
    let userId;
    let adminId;
    let memberId;
    let group;
    let group2;
    let groupId;
    let group2Id;
    beforeEach(function beforeTesting() {
      Groups.remove({});
      EventsAgenda.remove({});
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      Meteor.users.remove({});
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
      group = Factory.create('group', { owner: adminId, type: 0 });
      groupId = group._id;
      group2 = Factory.create('group', { owner: adminId, type: 5 });
      group2Id = group2._id;
      setMemberOf._execute({ userId: memberId }, { userId: memberId, groupId });
      setMemberOf._execute({ userId: adminId }, { userId: memberId, groupId: group2Id });

      [0, 3, 4, 5, 9].forEach((i) => {
        Factory.create('eventAgenda', {
          _id: Random.id(),
          userId: adminId,
          start: moment().add(i, 'days').format(),
          end: moment().add(i, 'days').add(1, 'hour').format(),
          groups: [
            { _id: groupId, name: 'group' },
            { _id: group2Id, name: 'group2' },
          ],
        });
      });
    });
    describe('groups.events', function eventsForUserPub() {
      it('does send events from a public group when not member', function groupEventsPub(done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'groups.events',
          { page: 1, search: '', slug: group.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.eventsAgenda.length, 5);
            done();
          },
        );
      });
      it('does not send events from a protected group when not member', function groupEventsProtected(done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'groups.events',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.eventsAgenda, undefined);
            done();
          },
        );
      });
      it('does send events from a protected group when admin', function groupEventsProtectedAdmin(done) {
        const collector = new PublicationCollector({ userId: adminId });
        collector.collect(
          'groups.events',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.eventsAgenda.length, 5);
            done();
          },
        );
      });
      it('does send events from a protected group when member', function groupEventsProtectedMember(done) {
        const collector = new PublicationCollector({ userId: memberId });
        collector.collect(
          'groups.events',
          { page: 1, search: '', slug: group2.slug, itemPerPage: 10 },
          (collections) => {
            assert.equal(collections.eventsAgenda.length, 5);
            done();
          },
        );
      });
    });
  });
});
