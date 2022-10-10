/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import '../../../startup/i18n/en.i18n.json';

import {
  setAdmin,
  unsetAdmin,
  setAdminStructure,
  unsetAdminStructure,
  setStructure,
  setUsername,
  setName,
  setEmail,
  setLanguage,
  setLogoutType,
  setActive,
  unsetActive,
  findUsers,
  findUser,
  removeUser,
  setAdminOf,
  setAnimatorOf,
  setMemberOf,
  setKeycloakId,
  setAvatar,
  setNcloudUrlAll,
  toggleAdvancedPersonalPage,
  setArticlesEnable,
  resetAuthToken,
  removeUserFromStructure,
  acceptAwaitingStructure,
} from './methods';
import Groups from '../../groups/groups';
import PersonalSpaces from '../../personalspaces/personalspaces';
import Nextcloud from '../../nextcloud/nextcloud';
import './publications';
import { getStructureIds } from '../structures';
import AppSettings from '../../appsettings/appsettings';

let allowedStructures = [];
const testSettingsId = 'settings';
const setValidationMandatory = (state) => {
  AppSettings.update(
    { _id: testSettingsId },
    {
      $set: {
        userStructureValidationMandatory: state,
      },
    },
  );
};

describe('users', function () {
  before(function () {
    allowedStructures = getStructureIds();
    AppSettings.remove({});
    const appSettings = Factory.create('appsettings');
    AppSettings.insert({ ...appSettings, _id: testSettingsId });
  });
  describe('publications', function () {
    let userId;
    let otherUserId;
    let email;
    let group;
    let group2;
    let group3;
    let group4;
    const lastName = `test${faker.name.lastName()}`;
    const firstName = `test${faker.name.firstName()}`;
    before(function () {
      Meteor.roleAssignment.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Roles.createRole('admin');
      Roles.createRole('animator');
      Roles.createRole('member');
      Roles.createRole('adminStructure');
      _.times(3, () => {
        // prefix email with 'test' to make sure it won't match
        // with 'user@ac-test.fr' when testing filtered search
        email = `test${faker.internet.email()}`;
        Accounts.createUser({
          email,
          username: email,
          password: 'toto',
          structure: faker.company.companyName(),
          firstName: `test${faker.name.firstName()}`,
          lastName: `test${faker.name.lastName()}`,
          nclocator: 'toto',
        });
      });
      // spécific users for userData publication and search filter test
      email = 'user@ac-test.fr';
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'titi',
        structure: faker.company.companyName(),
        firstName,
        lastName,
      });
      email = `test${faker.internet.email()}`;
      otherUserId = Accounts.createUser({
        email,
        username: email,
        password: 'titi',
        structure: faker.company.companyName(),
        firstName: 'BobLeFilou',
        lastName: `test${faker.name.lastName()}`,
      });

      Meteor.users.update(userId, { $set: { isActive: true, isRequest: false, articlesCount: 1 } });
      Meteor.users.update(otherUserId, { $set: { isActive: true, isRequest: false, articlesCount: 1 } });
      group = Factory.create('group', { owner: userId });
      Roles.addUsersToRoles(userId, 'admin', group._id);
      group2 = Factory.create('group', { type: 5, owner: otherUserId });
      Roles.addUsersToRoles(otherUserId, 'admin', group2._id);
      group3 = Factory.create('group', { type: 5, owner: otherUserId });
      Roles.addUsersToRoles(otherUserId, 'admin', group3._id);
      group4 = Factory.create('group', { owner: otherUserId, type: 0 });
      Roles.addUsersToRoles(otherUserId, 'admin', group4._id);
      setMemberOf._execute({ userId }, { userId, groupId: group._id });
      setMemberOf._execute({ userId: otherUserId }, { userId, groupId: group2._id });
      setMemberOf._execute({ userId: otherUserId }, { userId: otherUserId, groupId: group._id });
      setMemberOf._execute({ userId: otherUserId }, { userId: otherUserId, groupId: group2._id });
      setMemberOf._execute({ userId: otherUserId }, { userId: otherUserId, groupId: group4._id });
    });
    describe('users.request', function () {
      it('does not send data to non admin users', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('users.request', (collections) => {
          assert.equal(collections.users, undefined);
          done();
        });
      });
      it('sends users awaiting for activation to admin user', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('users.request', (collections) => {
          assert.equal(collections.users.length, 3);
          done();
        });
        Roles.removeUsersFromRoles(userId, 'admin');
      });
    });
    describe('users.byStructure', function () {
      it('does not send data to non adminStructure users', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('users.byStructure', { page: 1, itemPerPage: 5, search: '' }, (collections) => {
          assert.equal(collections.users, undefined);
          done();
        });
      });
      it('sends users with same structure to adminStructure user', function (done) {
        Roles.addUsersToRoles(userId, 'adminStructure', 'Struct');
        Meteor.users.update(userId, { $set: { structure: 'Struct' } });
        Meteor.users.update(otherUserId, { $set: { structure: 'Struct' } });
        const collector = new PublicationCollector({ userId });
        collector.collect('users.byStructure', { page: 1, itemPerPage: 5, search: '' }, (collections) => {
          assert.equal(collections.users.length, 2);
          done();
        });
        Roles.removeUsersFromRoles(userId, 'adminStructure', 'Struct');
      });
    });
    describe('userData', function () {
      it('sends additional fields for current user', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('userData', (collections) => {
          assert.equal(collections.users.length, 1);
          const user = collections.users[0];
          assert.property(user, 'favServices');
          done();
        });
      });
    });
    describe('users.findUsers method', function () {
      it('fetches a page of users as normal user', function () {
        const { data, page, totalCount } = findUsers._execute({ userId }, { pageSize: 2 });
        assert.equal(data.length, 2);
        assert.equal(page, 1);
        assert.equal(totalCount, 5);
      });
      it('fetches a page of users as normal user with a filter', function () {
        const { data, page, totalCount } = findUsers._execute({ userId }, { filter: 'user@ac-test.fr' });
        assert.equal(data.length, 1);
        assert.equal(page, 1);
        assert.equal(totalCount, 1);
        assert.notProperty(data[0], 'createdAt');
        assert.equal(data[0].emails[0].address, 'user@ac-test.fr');
      });
      it('fetches a page of users as admin user', function () {
        Roles.addUsersToRoles(userId, 'admin');
        let results = findUsers._execute({ userId }, { pageSize: 3 });
        assert.equal(results.data.length, 3);
        assert.equal(results.page, 1);
        assert.equal(results.totalCount, 5);
        assert.property(results.data[0], 'createdAt');
        // fetch page 2
        results = findUsers._execute({ userId }, { pageSize: 3, page: 2 });
        assert.equal(results.data.length, 2);
        assert.equal(results.page, 2);
        assert.equal(results.totalCount, 5);
      });
    });
    describe('users.findUser method', function () {
      it('fetches basic info of a specific user (firstname, lastname)', function () {
        const userData = findUser._execute({ userId }, { userId });
        assert.equal(userData._id, userId);
        assert.equal(userData.lastName, lastName);
        assert.equal(userData.firstName, firstName);
      });
    });
    describe('roles.admin', function () {
      it('sends all global admin users', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('roles.admin', (collections) => {
          assert.equal(collections['role-assignment'].length, 1);
          const assignment = collections['role-assignment'][0];
          assert.equal(assignment.user._id, userId);
          assert.equal(assignment.role._id, 'admin');
          done();
        });
        Roles.removeUsersFromRoles(userId, 'admin');
      });
    });
    describe('roles.adminStructure', function () {
      it('sends all structure admin users', function (done) {
        Meteor.users.update(userId, { $set: { structure: 'toto' } });
        Roles.addUsersToRoles(userId, 'adminStructure', 'toto');
        const collector = new PublicationCollector({ userId });
        collector.collect('roles.adminStructure', (collections) => {
          assert.equal(collections['role-assignment'].length, 1);
          const assignment = collections['role-assignment'][0];
          assert.equal(assignment.user._id, userId);
          assert.equal(assignment.role._id, 'adminStructure');
          done();
        });
        Roles.removeUsersFromRoles(userId, 'adminStructure', 'toto');
      });
    });
    describe('roles.adminStructureAll', function () {
      it('sends all structure admin users', function (done) {
        const structure1 = allowedStructures[1];
        const structure2 = allowedStructures[2];
        Meteor.users.update(userId, { $set: { structure: structure1 } });
        Roles.addUsersToRoles(userId, 'adminStructure', structure1);
        Meteor.users.update(otherUserId, { $set: { structure: structure2 } });
        Roles.addUsersToRoles(otherUserId, 'adminStructure', structure2);
        const collector = new PublicationCollector({ userId });
        collector.collect('roles.adminStructureAll', (collections) => {
          assert.equal(collections['role-assignment'].length, 2);
          const assignment = collections['role-assignment'][0];
          assert.equal(assignment.user._id, userId);
          assert.equal(assignment.role._id, 'adminStructure');
        });
        Roles.removeUsersFromRoles(userId, 'adminStructure', structure1);
        Roles.removeUsersFromRoles(otherUserId, 'adminStructure', structure2);
        done();
      });
    });
    describe('users.group', function () {
      it('sends all users from a public group', function (done) {
        setAdminOf._execute({ userId }, { userId, groupId: group._id });
        setAnimatorOf._execute({ userId }, { userId: otherUserId, groupId: group._id });
        const collector = new PublicationCollector({ userId: otherUserId });
        collector.collect(
          'users.group',
          { page: 1, itemPerPage: 5, slug: group.slug, search: '', userType: 'all' },
          (collections) => {
            assert.equal(collections.users.length, 2);
            assert.equal(
              collections.users.filter((user) => [firstName, 'BobLeFilou'].includes(user.firstName)).length,
              2,
            );
            done();
          },
        );
      });
      it('sends all admins from a public group', function (done) {
        setAdminOf._execute({ userId }, { userId, groupId: group._id });
        setAnimatorOf._execute({ userId }, { userId: otherUserId, groupId: group._id });
        const collector = new PublicationCollector({ userId: otherUserId });
        collector.collect(
          'users.group',
          { page: 1, itemPerPage: 5, slug: group.slug, search: '', userType: 'admins' },
          (collections) => {
            assert.equal(collections.users.length, 1);
            assert.equal(collections.users[0].emails[0].address, 'user@ac-test.fr');
            done();
          },
        );
      });
      it('sends all animators from a public group', function (done) {
        setAdminOf._execute({ userId }, { userId, groupId: group._id });
        setAnimatorOf._execute({ userId }, { userId: otherUserId, groupId: group._id });
        const collector = new PublicationCollector({ userId: otherUserId });
        collector.collect(
          'users.group',
          { page: 1, itemPerPage: 5, slug: group.slug, search: '', userType: 'animators' },
          (collections) => {
            assert.equal(collections.users.length, 1);
            assert.equal(collections.users[0].firstName, 'BobLeFilou');
            done();
          },
        );
      });
      it('sends all users from a public group with filter', function (done) {
        const collector = new PublicationCollector({ userId: otherUserId });
        collector.collect(
          'users.group',
          { page: 1, itemPerPage: 5, slug: group.slug, search: 'BobLeFilou', userType: 'all' },
          (collections) => {
            assert.equal(collections.users.length, 1);
            assert.equal(collections.users[0].firstName, 'BobLeFilou');
            done();
          },
        );
      });
      it('does send users from a public group when not member', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'users.group',
          { page: 1, itemPerPage: 5, slug: group4.slug, search: '', userType: 'all' },
          (collections) => {
            assert.equal(collections.users.length, 1);
            assert.equal(collections.users[0].firstName, 'BobLeFilou');
            done();
          },
        );
      });
      it('does not send users from a protected group when not member', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'users.group',
          { page: 1, itemPerPage: 5, slug: group3.slug, search: '', userType: 'all' },
          (collections) => {
            assert.equal(collections.user, undefined);
            done();
          },
        );
      });
      it('does send users from a protected group when member', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect(
          'users.group',
          { page: 1, itemPerPage: 5, slug: group2.slug, search: '', userType: 'all' },
          (collections) => {
            assert.equal(collections.users.length, 2);
            assert.equal(
              collections.users.filter((user) => [firstName, 'BobLeFilou'].includes(user.firstName)).length,
              2,
            );
            done();
          },
        );
      });
    });
    describe('users.publishers', function () {
      it('sends all users who published an article', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('users.publishers', { page: 1, itemPerPage: 5, search: '' }, (collections) => {
          assert.equal(collections.users.length, 2);
          const user = collections.users[0];
          assert.equal(user._id, userId);
          done();
        });
      });
      it('sends all users who published an article with filter', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('users.publishers', { page: 1, itemPerPage: 5, search: 'BobLeFilou' }, (collections) => {
          assert.equal(collections.users.length, 1);
          const user = collections.users[0];
          assert.equal(user._id, otherUserId);
          done();
        });
      });
    });
    describe('users.admin', function () {
      it('sends all users including admin restricted fields', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('users.admin', { page: 1, itemPerPage: 5, search: '' }, (collections) => {
          assert.equal(collections.users.length, 5);
          const user = collections.users[0];
          assert.property(user, 'createdAt');
          done();
        });
      });
      it('sends a specific page of users including admin restricted fields', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('users.admin', { page: 2, itemPerPage: 3, search: '' }, (collections) => {
          assert.equal(collections.users.length, 2);
          done();
        });
      });
      it('sends all users including admin restricted fields matching a filter', function (done) {
        Roles.addUsersToRoles(userId, 'admin');
        const collector = new PublicationCollector({ userId });
        collector.collect('users.admin', { page: 1, itemPerPage: 5, search: 'user@ac-test.fr' }, (collections) => {
          assert.equal(collections.users.length, 1);
          assert.equal(collections.users[0].emails[0].address, 'user@ac-test.fr');
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let email;
    let emailAdmin;
    let groupId;
    beforeEach(function () {
      // Clear
      Meteor.roleAssignment.remove({});
      Meteor.users.remove({});
      Meteor.roles.remove({});
      Groups.remove({});
      PersonalSpaces.remove({});
      Roles.createRole('admin');
      Roles.createRole('adminStructure');
      Roles.createRole('member');
      // Generate 'users'
      email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      // create a group and set userId as member
      groupId = Factory.create('group', { owner: adminId })._id;
      setMemberOf._execute({ userId: adminId }, { userId, groupId });
    });
    describe('(un)setAdmin', function () {
      it('global admin can set/unset a user as admin', function () {
        assert.equal(Roles.userIsInRole(userId, 'admin'), false);
        setAdmin._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'admin'), true);
        unsetAdmin._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'admin'), false);
      });
      it('last admin user can not unset himself as admin', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            unsetAdmin._execute({ userId: adminId }, { userId: adminId });
          },
          Meteor.Error,
          /api.users.unsetAdmin.lastAdmin/,
        );
      });
      it('only global admin can set/unset a user as admin', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            setAdmin._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.setAdmin.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAdmin._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.unsetAdmin.notPermitted/,
        );
        assert.throws(
          () => {
            setAdmin._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.setAdmin.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAdmin._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.unsetAdmin.notPermitted/,
        );
      });
    });
    describe('(un)setAdminStructure', function () {
      it('global admin can set/unset a user as structure admin', function () {
        Meteor.users.update(userId, { $set: { structure: 'test' } });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', 'test'), false);
        setAdminStructure._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', 'test'), true);
        unsetAdminStructure._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', 'test'), false);
      });
      it('structure admin can set/unset a user as structure admin', function () {
        const email2 = faker.internet.email();
        const userId2 = Accounts.createUser({
          email2,
          username: email2,
          password: 'toto',
          structure: 'test',
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        });

        Meteor.users.update(userId, { $set: { structure: 'test' } });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', 'test'), false);
        setAdminStructure._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', 'test'), true);

        assert.equal(Roles.userIsInRole(userId2, 'adminStructure', 'test'), false);
        setAdminStructure._execute({ userId }, { userId: userId2 });
        assert.equal(Roles.userIsInRole(userId2, 'adminStructure', 'test'), true);
        unsetAdminStructure._execute({ userId }, { userId: userId2 });
        assert.equal(Roles.userIsInRole(userId2, 'adminStructure', 'test'), false);
        Roles.removeUsersFromRoles(userId, 'adminStructure', 'test');
      });
      it('only admin and structure admin can set/unset a user as admin structure', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            setAdminStructure._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.setAdminStructure.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAdminStructure._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.unsetAdminStructure.notPermitted/,
        );
        assert.throws(
          () => {
            setAdminStructure._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.setAdminStructure.notPermitted/,
        );
        assert.throws(
          () => {
            unsetAdminStructure._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.unsetAdminStructure.notPermitted/,
        );
      });
    });

    describe('setUsername', function () {
      it('users can set their username', function () {
        setUsername._execute({ userId }, { username: 'moi' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.username, 'moi');
      });
      it('users can not set their username to already taken values', function () {
        assert.throws(
          () => {
            setUsername._execute({ userId }, { username: emailAdmin });
          },
          Meteor.Error,
          /Username already exists. \[403\]/,
        );
      });
      it('only logged in users can set their username', function () {
        assert.throws(
          () => {
            setUsername._execute({}, { username: 'moi' });
          },
          Meteor.Error,
          /api.users.setUsername.notLoggedIn/,
        );
      });
    });

    describe('setStructure', function () {
      it('users can ask for a structure (validation structure mandatory)', function () {
        const newStructure = allowedStructures[0];
        setValidationMandatory(true);
        setStructure._execute({ userId }, { structure: newStructure });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.awaitingStructure, newStructure);
      });

      it('users loses structure admin role when structure changes (validation structure mandatory)', function () {
        const newStructure = allowedStructures[0];
        setValidationMandatory(true);
        setStructure._execute({ userId }, { structure: newStructure });
        acceptAwaitingStructure._execute({ userId: adminId }, { targetUserId: userId });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.structure, newStructure);
        setAdminStructure._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', allowedStructures[0]), true);
        setStructure._execute({ userId }, { structure: allowedStructures[0] });
        acceptAwaitingStructure._execute({ userId: adminId }, { targetUserId: userId });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', allowedStructures[0]), true);
        setStructure._execute({ userId }, { structure: allowedStructures[1] });
        acceptAwaitingStructure._execute({ userId: adminId }, { targetUserId: userId });

        assert.equal(Roles.userIsInRole(userId, 'adminStructure', allowedStructures[1]), false);
      });
      it('users can set their structure (validation structure not mandatory)', function () {
        const newStructure = allowedStructures[0];

        setValidationMandatory(false);
        setStructure._execute({ userId }, { structure: newStructure });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.structure, newStructure);
      });

      it('users loses structure admin role when structure changes (validation structure not mandatory)', function () {
        const newStructure = allowedStructures[0];

        setValidationMandatory(false);
        setStructure._execute({ userId }, { structure: newStructure });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.structure, newStructure);
        setAdminStructure._execute({ userId: adminId }, { userId });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', allowedStructures[0]), true);
        setStructure._execute({ userId }, { structure: allowedStructures[0] });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', allowedStructures[0]), true);
        setStructure._execute({ userId }, { structure: allowedStructures[1] });
        assert.equal(Roles.userIsInRole(userId, 'adminStructure', allowedStructures[1]), false);
      });
      // }
      it('users can only set their structure to allowed values', function () {
        assert.throws(
          () => {
            setStructure._execute({ userId }, { structure: 'toto' });
          },
          Meteor.ClientError,
          /toto is not an allowed value/,
        );
      });
      it('only logged in users can set their structure', function () {
        const newStructure = allowedStructures[0];
        assert.throws(
          () => {
            setStructure._execute({}, { structure: newStructure });
          },
          Meteor.Error,
          /api.users.setStructure.notLoggedIn/,
        );
      });
    });
    describe('acceptAwaitingStructure', function () {
      it('admin user can accept awaiting structure of an user', function () {
        const newStructure = allowedStructures[0];
        setValidationMandatory(true);
        setStructure._execute({ userId }, { structure: newStructure });
        acceptAwaitingStructure._execute({ userId: adminId }, { targetUserId: userId });

        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.structure, newStructure);
      });
      it('structure admin can accept awaiting structure of an user of same structure', function () {
        const newStructure = allowedStructures[0];
        setValidationMandatory(true);
        setStructure._execute({ userId }, { structure: newStructure });
        const adminStructureId = Accounts.createUser({
          email: 'adminStructure@mail.com',
          username: 'adminStructure@mail.com',
          password: 'titi',
          structure: newStructure,
          firstName: 'adminStructureUserFirstName',
          lastName: 'adminStructureUserLastName',
        });
        Roles.addUsersToRoles(adminStructureId, 'adminStructure', newStructure);

        acceptAwaitingStructure._execute({ userId: adminStructureId }, { targetUserId: userId });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.structure, newStructure);
      });
      it('structure admin can not accept awaiting structure of an user with different structure', function () {
        const newStructure = allowedStructures[0];
        setValidationMandatory(true);
        setStructure._execute({ userId }, { structure: newStructure });
        const adminStructureId = Accounts.createUser({
          email: 'adminStructure1@mail.com',
          username: 'adminStructure1@mail.com',
          password: 'titi',
          structure: allowedStructures[1],
          firstName: 'adminStructureUserFirstName2',
          lastName: 'adminStructureUserLastName2',
        });
        Roles.addUsersToRoles(adminStructureId, 'adminStructure', allowedStructures[1]);

        assert.throws(
          () => {
            acceptAwaitingStructure._execute({ userId: adminStructureId }, { targetUserId: userId });
          },
          Meteor.Error,
          'api.users.acceptAwaitingStructure.notPermitted',
        );
      });
    });
    describe('setName', function () {
      it('users can set their firstname and lastname', function () {
        setName._execute({ userId }, { firstName: 'newFirstname', lastName: 'newLastname' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.firstName, 'newFirstname');
        assert.equal(user.lastName, 'newLastname');
      });
      it('only logged in users can set their name', function () {
        assert.throws(
          () => {
            setName._execute({}, { firstName: 'newFirstname', lastName: 'newLastname' });
          },
          Meteor.Error,
          /api.users.setName.notLoggedIn/,
        );
      });
    });
    describe('setEmail', function () {
      it('users can set their email address', function () {
        setEmail._execute({ userId }, { email: 'toto@test.org' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.emails[0].address, 'toto@test.org');
        assert.equal(user.emails[0].verified, false);
      });
      it('users can not use an already existing email address', function () {
        assert.throws(
          () => {
            setEmail._execute({ userId }, { email: emailAdmin });
          },
          Meteor.Error,
          /Email already exists. \[403\]/,
        );
      });
      it('only logged in users can set their email address', function () {
        assert.throws(
          () => {
            setEmail._execute({}, { email: 'toto@test.org' });
          },
          Meteor.Error,
          /api.users.setEmail.notLoggedIn/,
        );
      });
    });
    describe('setLanguage', function () {
      it('users can set their preferred language', function () {
        setLanguage._execute({ userId }, { language: 'fr' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.language, 'fr');
      });
      it('only logged in users can set their language', function () {
        assert.throws(
          () => {
            setLanguage._execute({}, { language: 'fr' });
          },
          Meteor.Error,
          /api.users.setLanguage.notPermitted/,
        );
      });
    });
    describe('setLogoutType', function () {
      it('users can set their preferred logout method', function () {
        setLogoutType._execute({ userId }, { logoutType: 'local' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.logoutType, 'local');
      });
      it('only logged in users can set their language', function () {
        assert.throws(
          () => {
            setLogoutType._execute({}, { logoutType: 'local' });
          },
          Meteor.Error,
          /api.users.setLogoutType.notPermitted/,
        );
      });
    });
    describe('setKeycloakId', function () {
      it('admin users can set Keycloak Id of an existing user', function () {
        setKeycloakId._execute({ userId: adminId }, { email, keycloakId: 'f213b75d-9133-4ca7-9499-e43f15e254b6' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.services.keycloak.id, 'f213b75d-9133-4ca7-9499-e43f15e254b6');
      });
      it('only admin users can set keycloak Id of an existing user', function () {
        assert.throws(
          () => {
            setKeycloakId._execute({ userId }, { email, keycloakId: 'f213b75d-9133-4ca7-9499-e43f15e254b6' });
          },
          Meteor.Error,
          /api.users.setKeycloakId.notPermitted/,
        );
      });
    });
    describe('setAvatar', function () {
      it('users can set their avatar image URL', function () {
        setAvatar._execute({ userId }, { avatar: 'http://perdu.com/monavatar.png' });
        const user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.avatar, 'http://perdu.com/monavatar.png');
      });
      it('only logged in users can set their avatar', function () {
        assert.throws(
          () => {
            setAvatar._execute({}, { avatar: 'http://perdu.com/monavatar.png' });
          },
          Meteor.Error,
          /api.users.setAvatar.notPermitted/,
        );
      });
    });
    describe('removeUser', function () {
      it('global admin can remove an existing user and associated data', function () {
        // check that user data exists before deletion
        let pspace = PersonalSpaces.findOne({ userId });
        assert.property(pspace, 'unsorted');
        let group = Groups.findOne(groupId);
        assert.include(group.members, userId);
        assert.equal(Roles.userIsInRole(userId, 'member', groupId), true);
        removeUser._execute({ userId: adminId }, { userId });
        const user = Meteor.users.findOne(userId);
        // check that personalspace, roles and group entries are removed
        assert.equal(user, undefined);
        group = Groups.findOne(groupId);
        assert.notInclude(group.members, userId);
        assert.equal(Roles.userIsInRole(userId, 'member', groupId), false);
        pspace = PersonalSpaces.findOne({ userId });
        assert.equal(pspace, undefined);
      });
      it('non admin users can remove their own account and associated data', function () {
        let user = Meteor.users.findOne(userId);
        removeUser._execute({ userId }, { userId });
        user = Meteor.users.findOne(userId);
        assert.equal(user, undefined);
        // check that personalspace, roles and group entries are removed
      });
      it('only global admin can remove another user', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            removeUser._execute({ userId }, { userId: adminId });
          },
          Meteor.Error,
          /api.users.removeUser.notPermitted/,
        );
        assert.throws(
          () => {
            removeUser._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.removeUser.notPermitted/,
        );
      });
    });
    describe('removeUserFromStructure', function () {
      it('structure admin can remove an existing user and associated data', function () {
        // set admin as a structure admin
        Meteor.users.update({ _id: userId }, { $set: { structure: 'test' } });
        Meteor.users.update({ _id: adminId }, { $set: { structure: 'test' } });
        setAdminStructure._execute({ userId: adminId }, { userId: adminId });
        // check that user data exists before deletion
        removeUserFromStructure._execute({ userId: adminId }, { userId });
        const user = Meteor.users.findOne(userId);
        // check that personalspace, roles and group entries are removed
        assert.equal(user.structure, null);
      });
      it('only structure admin can remove another user from structure', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            removeUserFromStructure._execute({ userId }, { userId: adminId });
          },
          Meteor.Error,
          /api.users.removeUserFromStructure.notPermitted/,
        );
        assert.throws(
          () => {
            removeUserFromStructure._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.removeUserFromStructure.notPermitted/,
        );
      });
    });
    describe('(un)setActive', function () {
      it('global admin can set a user as active/not active', function () {
        let user = Meteor.users.findOne(userId);
        assert.equal(user.isActive, true);
        unsetActive._execute({ userId: adminId }, { userId });
        user = Meteor.users.findOne(userId);
        assert.equal(user.isActive, false);
        setActive._execute({ userId: adminId }, { userId });
        user = Meteor.users.findOne(userId);
        assert.equal(user.isActive, true);
      });
      it('only global admin can set a user as active/not active', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            setActive._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.setActive.notPermitted/,
        );
        assert.throws(
          () => {
            setActive._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.setActive.notPermitted/,
        );
        assert.throws(
          () => {
            unsetActive._execute({ userId }, { userId });
          },
          Meteor.Error,
          /api.users.unsetActive.notPermitted/,
        );
        assert.throws(
          () => {
            unsetActive._execute({}, { userId });
          },
          Meteor.Error,
          /api.users.unsetActive.notPermitted/,
        );
      });
    });
    describe('setNcloudUrlAll', function () {
      it('global admin can set nextcloud url for all users', function () {
        Nextcloud.remove({});
        for (let nb = 0; nb < 10; nb += 1) {
          const mm = faker.internet.email();
          Accounts.createUser({
            email: mm,
            username: mm,
            password: 'toto',
            structure: faker.company.companyName(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
          });
        }

        Meteor.users.update({}, { $set: { isActive: true, nclocator: '' } }, { multi: true });
        const nbUsers = Meteor.users.find({}).count();
        assert.equal(nbUsers, 12);

        Nextcloud.insert({ url: 'url0', active: false, count: 0 });
        Nextcloud.insert({ url: 'url1', active: true, count: 0 });
        Nextcloud.insert({ url: 'url2', active: true, count: 0 });
        Nextcloud.insert({ url: 'url3', active: true, count: 0 });
        const nbActiveUrls = Nextcloud.find({ active: true }).count();
        assert.equal(nbActiveUrls, 3);

        let cpt = setNcloudUrlAll._execute({ userId: adminId }, {});
        assert.equal(cpt, 12);

        const url0 = Nextcloud.findOne({ url: 'url0' });
        assert.equal(url0.count, 0);
        const url1 = Nextcloud.findOne({ url: 'url1' });
        assert.equal(url1.count, 4);
        const url2 = Nextcloud.findOne({ url: 'url2' });
        assert.equal(url2.count, 4);
        const url3 = Nextcloud.findOne({ url: 'url3' });
        assert.equal(url3.count, 4);

        cpt = setNcloudUrlAll._execute({ userId: adminId }, {});
        assert.equal(cpt, 0);
      });
      it('only global admin can set nextcloud url for all users', function () {
        // Throws if non admin user, or logged out user
        assert.throws(
          () => {
            setNcloudUrlAll._execute({ userId }, {});
          },
          Meteor.Error,
          /api.users.setNcloudUrlAll.notPermitted/,
        );
        assert.throws(
          () => {
            setNcloudUrlAll._execute({}, {});
          },
          Meteor.Error,
          /api.users.setNcloudUrlAll.notLoggedIn/,
        );
      });
    });
    describe('toggleAdvancedPersonalPage', function () {
      it('users can toggle their advancedPersonalPage option', function () {
        let user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.advancedPersonalPage, false);
        toggleAdvancedPersonalPage._execute({ userId }, {});
        user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.advancedPersonalPage, true);
        toggleAdvancedPersonalPage._execute({ userId }, {});
        user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.advancedPersonalPage, false);
      });
      it('only logged in users can set their advancedPersonalPage', function () {
        assert.throws(
          () => {
            toggleAdvancedPersonalPage._execute({}, {});
          },
          Meteor.Error,
          /api.users.toggleAdvancedPersonalPage.notPermitted/,
        );
      });
    });
    describe('setArticlesEnable', function () {
      it('users can toggle their articles option', function () {
        let user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.articlesEnable, false);
        setArticlesEnable._execute({ userId }, {});
        user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.articlesEnable, true);
        setArticlesEnable._execute({ userId }, {});
        user = Meteor.users.findOne({ _id: userId });
        assert.equal(user.articlesEnable, false);
      });
      it('only logged in users can set their articles option', function () {
        assert.throws(
          () => {
            setArticlesEnable._execute({}, {});
          },
          Meteor.Error,
          /api.users.toggleAdvancedPersonalPage.notPermitted/,
        );
      });
    });
    describe('resetAuthToken', function () {
      it('reset the auth token for a specific user', function () {
        const user = Meteor.users.findOne({ _id: userId });
        resetAuthToken._execute({ userId }, {});
        const newToken = Meteor.users.findOne({ _id: userId }).authToken;
        assert.notEqual(user.authToken, newToken);
      });
    });
  });
});
