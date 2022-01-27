/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import faker from 'faker';
import { assert } from 'chai';
import { Factory } from 'meteor/dburles:factory';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { createStructure, removeStructure, updateStructure } from '../methods';
import './publications';
import './factories';
import Structures from '../structures';

describe('structures', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const structure = Factory.create('structure');
      assert.typeOf(structure, 'object');
    });
  });
  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      const email = faker.internet.email();
      const struct = Factory.create('structure');
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: struct._id,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      Structures.remove({});
      _.times(4, () => {
        Factory.create('structure');
      });
    });
    describe('structures.all', function () {
      it('send all structures', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('structures.all', (collections) => {
          assert.equal(collections.structures.length, 4);
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let structureName;
    let structureId;

    beforeEach(function () {
      // clear
      Meteor.users.remove({});
      Roles.createRole('admin', { unlessExists: true });

      const email = faker.internet.email();
      const struct = Factory.create('structure');
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: struct._id,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });

      const structAdmin = Factory.create('structure');
      const emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: structAdmin._id,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });

      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');

      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });

      const theStructure = Factory.create('structure');
      structureId = theStructure._id;
      structureName = theStructure.name;
    });

    describe('createStructure', function () {
      it('does create a structure with admin user', function () {
        // logServer('User admin:', adminId);
        createStructure._execute({ userId: adminId }, { name: structureName });
        const structure = Structures.findOne({ _id: structureId });
        assert.typeOf(structure, 'object');
      });
      it('does not create a structure with a non admin user', function () {
        assert.throws(
          () => {
            createStructure._execute({ userId }, { name: structureName });
          },
          Meteor.Error,
          /api.structures.createStructure.notPermitted/,
        );
      });
    });

    describe('updateStructure', function () {
      it('does update a structure with admin user', function () {
        const data = {
          name: 'UneSuperStructureModifiee',
        };
        updateStructure._execute(
          { userId: adminId },
          {
            structureId,
            data,
          },
        );
        const structure = Structures.findOne(structureId);
        assert.equal(structure.name, data.name);
      });
      it('does not update a structure with non admin user', function () {
        const data = {
          name: 'UneSuperStructureModifiee',
        };
        assert.throws(
          () => {
            updateStructure._execute(
              { userId },
              {
                structureId,
                data,
              },
            );
          },
          Meteor.Error,
          /api.structures.updateStructure.notPermitted/,
        );
      });
    });

    describe('removeStructure', function () {
      it('does remove a structure with admin user', function () {
        removeStructure._execute(
          { userId: adminId },
          {
            structureId,
          },
        );
        const structure = Structures.findOne(structureId);
        assert.equal(structure, undefined);
      });

      it('does not remove a structure with non admin user', function () {
        assert.throws(
          () => {
            removeStructure._execute(
              { userId },
              {
                structureId,
              },
            );
          },
          Meteor.Error,
          /api.structures.removeStructure.notPermitted/,
        );
        assert.throws(
          () => removeStructure._execute({}, { structureId }),
          Meteor.Error,
          /api.structures.removeStructure.notPermitted/,
        );
      });
    });
  });
});
