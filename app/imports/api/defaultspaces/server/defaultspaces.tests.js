/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import '../../../startup/i18n/en.i18n.json';
import { faker } from '@faker-js/faker';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { updateStructureSpace, applyDefaultSpaceToAllUsers } from '../methods';
import DefaultSpaces from '../defaultspaces';
import './publications';
import './factories';
import '../../structures/server/factories';
import Structures from '../../structures/structures';
import PersonalSpaces from '../../personalspaces/personalspaces';

describe('DefaultSpaces', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const defaultspace = Factory.create('defaultspace');
      assert.typeOf(defaultspace, 'object');
    });
  });
  describe('publications', function () {
    let userId;
    let structureId;
    before(function () {
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      Meteor.users.remove({});
      Structures.remove({});
      DefaultSpaces.remove({});
      Roles.createRole('adminStructure');

      // create a structure
      structureId = Factory.create('structure')._id;

      // create a user
      userId = Accounts.createUser({
        username: 'yo',
        password: 'toto',
        email: faker.internet.email(),
        structure: structureId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      Meteor.users.update(userId, {
        $set: {
          isActive: true,
        },
      });
      // set the user as admin of his structure
      Roles.addUsersToRoles(userId, 'adminStructure', structureId);
      DefaultSpaces.remove({});
      Factory.create('defaultspace', { structureId });
    });
    describe('defaultspaces.one', function () {
      it('sends current structure defaultspace', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('defaultspaces.one', { structureId }, (collections) => {
          assert.equal(collections.defaultspaces.length, 1);
          done();
        });
      });
      it('sends service datas of current structure defaultspace', function (done) {
        const serviceId = Factory.create('service', { title: 'myService' })._id;
        const sorted = [
          {
            zone_id: Random.id(),
            name: faker.lorem.word(),
            elements: [
              {
                element_id: serviceId,
                type: 'service',
              },
            ],
          },
        ];
        const newDefaultSpace = { structureId, sorted };
        updateStructureSpace._execute({ userId }, { data: newDefaultSpace });
        const collector = new PublicationCollector({ userId });
        collector.collect('defaultspaces.one', { structureId }, (collections) => {
          assert.equal(collections.defaultspaces.length, 1);
          assert.equal(collections.services.length, 1);
          assert.equal(collections.services[0].title, 'myService');
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let adminUserId;
    let normalUserId;
    let emptyDS;
    let structureId;
    before(function () {
      Meteor.roleAssignment.remove({});
      Meteor.roles.remove({});
      Meteor.users.remove({});
      Structures.remove({});
      DefaultSpaces.remove({});
      Roles.createRole('adminStructure');

      // create a structure
      structureId = Factory.create('structure')._id;

      // create a user admin
      adminUserId = Accounts.createUser({
        username: 'admin',
        password: 'admin',
        email: faker.internet.email(),
        structure: structureId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      Meteor.users.update(adminUserId, {
        $set: {
          isActive: true,
        },
      });
      // set the user as admin of his structure
      Roles.addUsersToRoles(adminUserId, 'adminStructure', structureId);

      // create a normal user in the same structure
      normalUserId = Accounts.createUser({
        username: 'user',
        password: 'user',
        email: faker.internet.email(),
        structure: structureId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      Meteor.users.update(normalUserId, {
        $set: {
          isActive: true,
        },
      });

      // create the defaultSpace for the structure
      DefaultSpaces.remove({});
      Factory.create('defaultspace', { structureId });

      emptyDS = { structureId, sorted: [] };
    });

    describe('updateStructureSpace', function () {
      it('does create a empty defaultSpace for the current structure', function () {
        updateStructureSpace._execute({ userId: adminUserId }, { data: emptyDS });
        const ps = DefaultSpaces.findOne({ structureId });
        assert.typeOf(ps, 'object');
        assert.typeOf(ps.sorted, 'array');
        assert.lengthOf(ps.sorted, 0);
      });

      it('does update the current structure defaultspace with a new zone', function () {
        updateStructureSpace._execute({ userId: adminUserId }, { data: emptyDS });
        const sorted = [
          {
            zone_id: Random.id(),
            name: 'zone',
            elements: [],
          },
        ];
        updateStructureSpace._execute({ userId: adminUserId }, { data: { structureId, sorted } });
        const ps = DefaultSpaces.findOne({ structureId });
        assert.typeOf(ps.sorted, 'array');
        assert.lengthOf(ps.sorted, 1);
        assert.equal(ps.sorted[0].name, 'zone');
        assert.typeOf(ps.sorted[0].elements, 'array');
        assert.lengthOf(ps.sorted[0].elements, 0);
      });
      it('does update the current structure defaultspace with a zone and a new service', function () {
        updateStructureSpace._execute({ userId: adminUserId }, { data: emptyDS });
        const serviceId = Factory.create('service', { title: 'myService' })._id;
        const sorted = [
          {
            zone_id: Random.id(),
            name: faker.lorem.word(),
            elements: [
              {
                element_id: serviceId,
                type: 'service',
              },
            ],
          },
        ];
        updateStructureSpace._execute({ userId: adminUserId }, { data: { structureId, sorted } });
        const ps = DefaultSpaces.findOne({ structureId });
        assert.typeOf(ps.sorted, 'array');
        assert.lengthOf(ps.sorted, 1);
        assert.lengthOf(ps.sorted[0].elements, 1);
        assert.equal(ps.sorted[0].elements[0].type, 'service');
      });
    });

    describe('applyDefaultSpaceToAllUsers', function () {
      it('does apply default space to all structure users', function () {
        updateStructureSpace._execute({ userId: adminUserId }, { data: emptyDS });
        const serviceId = Factory.create('service', { title: 'myService' })._id;
        const sorted = [
          {
            zone_id: Random.id(),
            name: faker.lorem.word(),
            elements: [
              {
                element_id: serviceId,
                type: 'service',
              },
            ],
          },
        ];
        updateStructureSpace._execute({ userId: adminUserId }, { data: { structureId, sorted } });
        const ds = DefaultSpaces.findOne({ structureId });
        applyDefaultSpaceToAllUsers._execute({ userId: adminUserId }, { structureId });
        const ps = PersonalSpaces.findOne({ userId: normalUserId });
        assert.typeOf(ps, 'object');
        assert.typeOf(ps.sorted, 'array');
        assert.lengthOf(ps.sorted, 1);
        assert.equal(ps.sorted[0].zone_id, ds.sorted[0].zone_id);
        assert.lengthOf(ps.sorted[0].elements, 1);
        assert.equal(ps.sorted[0].elements[0].element_id, ds.sorted[0].elements[0].element_id);
      });
      it('does not apply default space to users from other structures', function () {
        updateStructureSpace._execute({ userId: adminUserId }, { data: emptyDS });
        const serviceId = Factory.create('service', { title: 'myService' })._id;
        const sorted = [
          {
            zone_id: Random.id(),
            name: faker.lorem.word(),
            elements: [
              {
                element_id: serviceId,
                type: 'service',
              },
            ],
          },
        ];
        updateStructureSpace._execute({ userId: adminUserId }, { data: { structureId, sorted } });
        const otherStructureUserId = Accounts.createUser({
          username: 'user2',
          password: 'user2',
          email: faker.internet.email(),
          structure: Random.id(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        });
        Factory.create('personalspace', { userId: otherStructureUserId });

        applyDefaultSpaceToAllUsers._execute({ userId: adminUserId }, { structureId });
        const ps = PersonalSpaces.findOne({ userId: otherStructureUserId });
        assert.typeOf(ps, 'object');
        assert.typeOf(ps.sorted, 'array');
        assert.lengthOf(ps.sorted, 0);
      });
    });
  });
});
