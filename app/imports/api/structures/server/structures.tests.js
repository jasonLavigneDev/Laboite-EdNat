/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import faker from 'faker';
import { assert } from 'chai';
import { Factory } from 'meteor/dburles:factory';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import {
  createStructure,
  getAllChilds,
  removeStructure,
  updateStructure,
  getContactURL,
  updateStructureContactEmail,
} from '../methods';
import './publications';
import './factories';
import Structures from '../structures';
import Groups from '../../groups/groups';
import '../../groups/server/factories';

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
      Roles.createRole('adminStructure', { unlessExists: true });

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
        const _id = createStructure._execute({ userId: adminId }, { name: `${structureName}WithAdminUser` });
        const structure = Structures.findOne({ _id });
        assert.typeOf(structure, 'object');

        const group = Groups.findOne({ name: `${_id}_${structureName}WithAdminUser` });
        assert.typeOf(group, 'object');
        assert.equal(group._id, structure.groupId);
      });
      it('does create a structure with structure admin user of parent', function () {
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

      it('does remove groups limited to this structure only', function () {
        const group = Factory.create('group', {
          name: 'limitedGroup',
          structureIds: [structureId],
          owner: Random.id(),
        });
        assert.equal(Groups.findOne(group._id).structureIds.includes(structureId), true);
        removeStructure._execute(
          { userId: adminId },
          {
            structureId,
          },
        );
        const structure = Structures.findOne(structureId);
        assert.equal(structure, undefined);
        assert.equal(Groups.findOne(group._id), undefined);
      });
      it('does remove group limitations for this structure', function () {
        const group = Factory.create('group', {
          name: 'limitedGroup',
          structureIds: [structureId, Random.id()],
          owner: Random.id(),
        });
        assert.equal(Groups.findOne(group._id).structureIds.includes(structureId), true);
        removeStructure._execute(
          { userId: adminId },
          {
            structureId,
          },
        );
        const structure = Structures.findOne(structureId);
        assert.equal(structure, undefined);
        assert.equal(Groups.findOne(group._id).structureIds.includes(structureId), false);
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
    describe('getContactURL', function () {
      it("does get contact URL of user's structure", function () {
        const struc1Id = createStructure._execute({ userId: adminId }, { name: `Struc1` });
        const struc2Id = createStructure._execute({ userId: adminId }, { name: `Struc2` });
        Roles.addUsersToRoles(adminId, 'adminStructure', struc2Id);

        updateStructureContactEmail._execute(
          { userId: adminId },
          {
            structureId: struc2Id,
            contactEmail: '',
            externalUrl: 'https://contact.gouv.fr',
            sendMailToParent: false,
            sendMailToStructureAdmin: false,
          },
        );
        const struc3Id = createStructure._execute({ userId: adminId }, { name: `Struc3`, parentId: struc2Id });
        Roles.addUsersToRoles(adminId, 'adminStructure', struc3Id);
        updateStructureContactEmail._execute(
          { userId: adminId },
          {
            structureId: struc3Id,
            contactEmail: '',
            externalUrl: '',
            sendMailToParent: true,
            sendMailToStructureAdmin: false,
          },
        );
        const email1 = faker.internet.email();
        const user1Id = Accounts.createUser({
          email: email1,
          username: email1,
          password: 'toto',
          structure: struc1Id,
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        });
        const email3 = faker.internet.email();
        const user3Id = Accounts.createUser({
          email: email3,
          username: email3,
          password: 'toto',
          structure: struc3Id,
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        });
        const URL1 = getContactURL._execute({ userId: user1Id }, {});
        assert.equal(URL1, null);
        const URL3 = getContactURL._execute({ userId: user3Id }, {});
        assert.equal(URL3, 'https://contact.gouv.fr');
      });
    });
  });
});
