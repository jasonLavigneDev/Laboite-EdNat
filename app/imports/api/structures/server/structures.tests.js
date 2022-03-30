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
import Articles from '../../articles/articles';
import Services from '../../services/services';

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
        /** Add '2' since we can not create a structure with same name */
        createStructure._execute({ userId: adminId }, { name: `${structureName}2`, parentId: null });
        const structure = Structures.findOne({ _id: structureId });
        assert.typeOf(structure, 'object');
      });
      it('does not create a structure with a non admin user', function () {
        assert.throws(
          () => {
            createStructure._execute({ userId }, { name: structureName, parentId: null });
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
            ...data,
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
                ...data,
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

      it('does not remove a structure if it has at least one user attached to', function () {
        Meteor.users.update({ _id: adminId }, { $set: { structure: structureId } });
        assert.throws(
          () => {
            removeStructure._execute({ userId: adminId }, { structureId });
          },
          Meteor.Error,
          /api.structures.removeStructure.hasUsers/,
        );
      });

      it('does remove attached articles if structure is removed', function () {
        const article = Factory.create('article');
        Articles.update({ _id: article._id }, { $set: { structure: structureId } });
        const article2 = Factory.create('article');
        Articles.update({ _id: article2._id }, { $set: { structure: structureId } });
        removeStructure._execute({ userId: adminId }, { structureId });

        const articlesCursor = Articles.find({ $or: [{ _id: article._id }, { _id: article2._id }] });
        assert.equal(articlesCursor.count(), 0);
      });

      it('does not remove structure if it has at least one service attached to', function () {
        const service = Factory.create('service');
        Services.update({ _id: service._id }, { $set: { structure: structureId } });
        assert.throws(
          () => {
            removeStructure._execute({ userId: adminId }, { structureId });
          },
          Meteor.Error,
          /api.structures.removeStructure.hasServices/,
        );
      });
    });
  });
});
