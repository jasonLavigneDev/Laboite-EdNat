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
import { createStructure, getAllChilds, removeStructure, updateStructure } from '../methods';
import './publications';
import './factories';
import Structures from '../structures';
import Groups from '../../groups/groups';

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
      Structures.remove({});
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
      Meteor.users.update(userId, { $set: { isActive: true, articlesCount: 2, lastArticle: new Date() } });
      _.times(4, () => {
        Factory.create('structure');
      });
    });
    describe('structures.all', function () {
      it('send all structures', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('structures.all', (collections) => {
          assert.equal(collections.structures.length, 5);
          done();
        });
      });
    });
    describe('structures.publishers', function () {
      it('sends all structures whith at least one blog author', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('structures.publishers', (collections) => {
          assert.equal(collections.structures.length, 1);
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
      Roles.createRole('animator', { unlessExists: true });

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
        const _id = createStructure._execute({ userId: adminId }, { name: `${structureName}WithAdminUser` });
        const structure = Structures.findOne({ _id });
        assert.typeOf(structure, 'object');

        const group = Groups.findOne({ name: `${_id}_${structureName}WithAdminUser` });
        assert.typeOf(group, 'object');
        assert.equal(group._id, structure.groupId);
      });
      it('does create a structure with structure admin user of parent', function () {
        // logServer('User admin:', adminId);
        const parentWithAdminRightId = createStructure._execute(
          { userId: adminId },
          { name: `${structureName}ParentWithAdminRight` },
        );
        Roles.addUsersToRoles(userId, 'adminStructure', parentWithAdminRightId);
        const _id = createStructure._execute(
          { userId },
          { name: `${structureName}WithStructureAdminUser`, parentId: parentWithAdminRightId },
        );
        const structure = Structures.findOne({ _id });
        assert.typeOf(structure, 'object');

        const group = Groups.findOne({ name: `${_id}_${structureName}WithStructureAdminUser` });
        assert.typeOf(group, 'object');
        assert.equal(group._id, structure.groupId);
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
      it('does not create a structure with same name with same parent (no parent here)', function () {
        assert.throws(
          () => {
            createStructure._execute({ userId: adminId }, { name: structureName });
          },
          Meteor.Error,
          /api.structures.createStructure.nameAlreadyTaken/,
        );
      });
      it('does not create a structure with same name with same parent', function () {
        assert.throws(
          () => {
            createStructure._execute({ userId: adminId }, { name: structureName, parentId: structureId });
            createStructure._execute({ userId: adminId }, { name: structureName, parentId: structureId });
          },
          Meteor.Error,
          /api.structures.createStructure.nameAlreadyTaken/,
        );
      });
      it('does create a structure with different name with same parent', function () {
        createStructure._execute({ userId: adminId }, { name: `${structureName}One`, parentId: structureId });
        const structureTwoId = createStructure._execute(
          { userId: adminId },
          { name: `${structureName}Two`, parentId: structureId },
        );
        const structureTwo = Structures.findOne({ _id: structureTwoId });
        assert.typeOf(structureTwo, 'object');
      });
    });

    describe('updateStructure', function () {
      it('does not update a structure name when another structure exist with same name and same parent', function () {
        createStructure._execute({ userId: adminId }, { name: `${structureName}UpdateOne`, parentId: structureId });
        createStructure._execute({ userId: adminId }, { name: `${structureName}UpdateTwo`, parentId: structureId });
        const structure = Structures.findOne({ name: `${structureName}UpdateTwo` });
        const data = {
          structureId: structure._id,
          name: `${structureName}UpdateOne`,
        };

        assert.throws(
          () => {
            updateStructure._execute({ userId: adminId }, { ...data });
          },
          Meteor.Error,
          /api.structures.updateStructure.notPermitted/,
        );
      });
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
          name: 'UneSuperStructureModifiee2',
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
      it('does update group linked to the structure', function () {
        const _id = createStructure._execute({ userId: adminId }, { name: `${structureName}ForEdition` });
        const structure = Structures.findOne({ _id });
        const { groupId } = structure;
        assert.typeOf(structure, 'object');

        const group = Groups.findOne({ _id: groupId });
        assert.typeOf(group, 'object');

        updateStructure._execute({ userId: adminId }, { structureId: _id, name: `StructureWithNewName` });
        const structureEdited = Structures.findOne({ _id });
        assert.typeOf(structureEdited, 'object');
        assert.equal(structureEdited.name, 'StructureWithNewName');

        const groupEdited = Groups.findOne({ _id: groupId });
        assert.typeOf(groupEdited, 'object');
        assert.equal(groupEdited.name, `${_id}_StructureWithNewName`);
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

      it('does remove a structure with structure admin user', function () {
        Roles.addUsersToRoles(userId, 'adminStructure', structureId);
        removeStructure._execute({ userId }, { structureId });
        const structure = Structures.findOne(structureId);
        assert.equal(structure, undefined);
      });

      it('does remove group linked to the structure', function () {
        const _id = createStructure._execute({ userId: adminId }, { name: `${structureName}ForRemoval` });
        const structure = Structures.findOne({ _id });
        const { groupId } = structure;
        assert.typeOf(structure, 'object');

        const group = Groups.findOne({ _id: groupId });
        assert.typeOf(group, 'object');

        removeStructure._execute({ userId: adminId }, { structureId: _id });
        const structureRemoved = Structures.findOne({ _id });
        assert.equal(structureRemoved, undefined);

        const groupRemoved = Groups.findOne({ _id: groupId });
        assert.equal(groupRemoved, undefined);
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
      });
    });

    describe('getAllChilds', function () {
      it('does get all childs of structure', function () {
        const parentId = createStructure._execute({ userId: adminId }, { name: `${structureName}ParentOfChilds` });

        const directChildsIdsCollector = [];

        // Create 5 direct childs
        for (let i = 0; i < 5; i += 1) {
          const id = createStructure._execute(
            { userId: adminId },
            { name: `${structureName}ChildOfParent-${i.toString()}`, parentId },
          );
          directChildsIdsCollector.push(id);
        }

        // Create 1 direct child for each direct child created above
        for (let i = 0; i < 5; i += 1) {
          createStructure._execute(
            { userId: adminId },
            { name: `${structureName}ChildOfDirectChild-${i}`, parentId: directChildsIdsCollector[i] },
          );
        }

        const allChilds = getAllChilds._execute({ userId: adminId }, { structureId: parentId });
        assert.equal(allChilds.length, 10);
      });
    });
  });
});
