/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import { Random } from 'meteor/random';
import faker from 'faker';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import '../../../../i18n/en.i18n.json';

// this file also includes tests on users/permissions
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import Groups from '../groups';
import { createGroup, removeGroup, updateGroup } from '../methods';
import './publications';
import {
  setAdminOf, unsetAdminOf, setMemberOf, unsetMemberOf,
} from '../../users/methods';

describe('groups', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const group = Factory.create('group', { owner: Random.id() });
      assert.typeOf(group, 'object');
      assert.equal(group.active, true);
    });
  });
  describe('publications', function () {
    before(function () {
      Groups.remove({});
      _.times(4, () => Factory.create('group', { owner: Random.id() }));
    });
    describe('groups.all', function () {
      it('sends all groups', function (done) {
        const collector = new PublicationCollector();
        collector.collect('groups.all', (collections) => {
          chai.assert.equal(collections.groups.length, 4);
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let groupId;
    let group2Id;
    let group3Id;
    let userId;
    let adminId;
    let otherUserId;
    beforeEach(function () {
      // Clear
      Groups.remove({});
      Meteor.users.remove({});
      // FIXME : find a way to reset roles collection ?
      Roles.createRole('admin', { unlessExists: true });
      Roles.createRole('member', { unlessExists: true });
      // Generate 'users'
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      const emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      const emailOtherUser = faker.internet.email();
      otherUserId = Accounts.createUser({
        email: emailOtherUser,
        username: emailOtherUser,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
      // Create a group owned by userId
      groupId = Factory.create('group', { owner: userId })._id;
      // Create a group owned by random user and set userId as admin
      group2Id = Factory.create('group', { owner: Random.id() })._id;
      setAdminOf._execute({ userId: adminId }, { userId, groupId: group2Id });
      group3Id = Factory.create('group', { owner: Random.id() })._id;
      group4Id = Factory.create('group', { name: 'group4', owner: userId })._id;
    });
    describe('(un)setAdminOf', function () {
      it('global admin can set/unset a user as admin of a group', function () {
        setAdminOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        let group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'admin', group3Id), true);
        assert.include(group.admins, userId, 'group admins list contains userId');
        unsetAdminOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'admin', group3Id), false);
        assert.notInclude(group.admins, userId, "group admins list shouldn't contain userId");
      });
      it('group admin can set/unset a user as admin of a group', function () {
        setAdminOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        let group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'admin', group2Id), true);
        assert.include(group.admins, otherUserId, 'group admins list contains otherUserId');
        unsetAdminOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'admin', group2Id), false);
        assert.notInclude(group.admins, otherUserId, "group admins list shouldn't contain otherUserId");
      });
      it('only global or group admin/owner can set/unset a user as admin of a group', function () {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            setAdminOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.setAdminOf.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAdminOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.unsetAdminOf.notPermitted/,
        );
      });
    });
    describe('(un)setMemberOf', function () {
      it('global admin can set/unset a user as member of a group', function () {
        setMemberOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        let group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'member', group3Id), true);
        assert.include(group.members, userId, 'group members list contains userId');
        unsetMemberOf._execute({ userId: adminId }, { userId, groupId: group3Id });
        group = Groups.findOne(group3Id);
        assert.equal(Roles.userIsInRole(userId, 'member', group3Id), false);
        assert.notInclude(group.members, userId, "group members list shouldn't contain userId");
      });
      it('group admin can set/unset a user as member of a group', function () {
        setMemberOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        let group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'member', group2Id), true);
        assert.include(group.members, otherUserId, 'group members list contains otherUserId');
        unsetMemberOf._execute({ userId }, { userId: otherUserId, groupId: group2Id });
        group = Groups.findOne(group2Id);
        assert.equal(Roles.userIsInRole(otherUserId, 'member', group2Id), false);
        assert.notInclude(group.members, otherUserId, "group members list shouldn't contain otherUserId");
      });
      it('only global or group admin can set/unset a user as member of a group', function () {
        // Throws if non owner/admin user, or logged out user
        assert.throws(
          () => {
            setMemberOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.setMemberOf.notPermitted/,
        );
        assert.throws(
          () => {
            unsetMemberOf._execute({ userId: otherUserId }, { userId, groupId });
          },
          Meteor.Error,
          /api.users.unsetMemberOf.notPermitted/,
        );
      });
    });
    describe('createGroup', function () {
      it('does create a group and set current user as owner', function () {
        createGroup._execute(
          { userId },
          {
            name: 'mongroupe',
            type: 0,
            info: 'une info',
            note: 'une note',
          },
        );
        const group = Groups.findOne({ name: 'mongroupe' });
        assert.typeOf(group, 'object');
        assert.equal(group.active, true);
        assert.equal(group.owner, userId);
      });
      it("does fail to create a group if name already taken", function () {
        assert.throws(
          () => {
            createGroup._execute({ userId }, {
              name: 'group4',
              type: 0,
              info: 'une info',
              note: 'une note',
            });
          },
          Meteor.Error,
          /api.groups.createGroup.notPermitted/,
        );
      });
      it("does not create a group when not logged in", function () {
        assert.throws(
          () => {
            createGroup._execute({}, {
                name: 'mongroupe',
                type: 0,
                info: 'une info',
                note: 'une note',
            });
          },
          Meteor.Error,
          /api.groups.createGroup.notLoggedIn/,
        );
      });
    });
    describe('removeGroup', function () {
      it("does not delete a group you don't own or are admin of", function () {
        // Throws if non owner/admin user, or logged out user, tries to delete the group
        assert.throws(
          () => {
            removeGroup._execute({ userId }, { groupId: group3Id });
          },
          Meteor.Error,
          /api.groups.removeGroup.notPermitted/,
        );
        assert.throws(
          () => {
            removeGroup._execute({}, { groupId });
          },
          Meteor.Error,
          /api.groups.removeGroup.notPermitted/,
        );
      });
      it('does delete a group you own', function () {
        removeGroup._execute({ userId }, { groupId });
        assert.equal(Groups.findOne(groupId), undefined);
      });
      it('does delete a group you are admin of', function () {
        removeGroup._execute({ userId }, { groupId: group2Id });
        assert.equal(Groups.findOne(group2Id), undefined);
      });
      it('does delete any group when you are global admin', function () {
        removeGroup._execute({ userId: adminId }, { groupId: group3Id });
        assert.equal(Groups.findOne(group3Id), undefined);
      });
    });
    describe('updateGroup', function () {
      it("does not update a group you don't own or are admin of", function () {
        // Throws if non owner/admin user, or logged out user, tries to delete the group
        assert.throws(
          () => {
            updateGroup._execute({ userId }, { groupId: group3Id, data: { info: 'test' } });
          },
          Meteor.Error,
          /api.groups.updateGroup.notPermitted/,
        );
        assert.throws(
          () => {
            updateGroup._execute({}, { groupId, data: { info: 'test' } });
          },
          Meteor.Error,
          /api.groups.updateGroup.notPermitted/,
        );
      });
      it('does update a group you own', function () {
        updateGroup._execute({ userId }, { groupId, data: { info: 'test' } });
        assert.equal(Groups.findOne(groupId).info, 'test');
      });
      it('does update a group you are admin of', function () {
        updateGroup._execute({ userId }, { groupId: group2Id, data: { info: 'test' } });
        assert.equal(Groups.findOne(group2Id).info, 'test');
      });
      it('does update any group when you are global admin', function () {
        updateGroup._execute({ userId: adminId }, { groupId: group3Id, data: { info: 'test' } });
        assert.equal(Groups.findOne(group3Id).info, 'test');
      });
      it('does fail to update group if name already taken', function () {
        assert.throws(
          () => {
            updateGroup._execute({ userId }, { groupId, data: { name: 'group4' } });
          },
          Meteor.ClientError,
          /E11000 duplicate key error collection: meteor.groups index: c2_name dup key: { : "group4" }/,
        );
      });
    });
  });
});
