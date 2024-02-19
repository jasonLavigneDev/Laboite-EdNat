/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { faker } from '@faker-js/faker';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { createHelp, removeHelp, updateHelp } from '../methods';
import Helps from '../helps';
import './publications';
import './factories';

describe('helps', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const help = Factory.create('help');
      assert.typeOf(help, 'object');
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
        structure: faker.company.name(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      Helps.remove({});
      _.times(4, () => {
        Factory.create('help');
      });
    });
    describe('helps.all', function () {
      it('sends all helps', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('helps.all', (collections) => {
          assert.equal(collections.helps.length, 4);
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let helpId;
    let helpData;
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      // FIXME : find a way to reset roles collection ?
      Roles.createRole('admin', { unlessExists: true });
      // Generate 'users'
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: faker.company.name(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      const emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: faker.company.name(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      const theTag = Factory.create('help');
      helpId = theTag._id;
      helpData = {
        title: 'application',
        content: theTag.content,
        description: theTag.description,
        category: theTag.category,
        type: theTag.type,
      };
    });
    describe('createHelp', function () {
      it('does create a help with admin user', function () {
        createHelp._execute({ userId }, helpData);
        const help = Helps.findOne({ title: helpData.title });
        assert.typeOf(help, 'object');
      });
    });
    describe('removeHelp', function () {
      it('does delete a help with admin user', function () {
        removeHelp._execute({ userId: adminId }, { helpId });
        assert.equal(Helps.findOne(helpId), undefined);
      });
      it('does not remove the help from an article when deleted', function () {
        removeHelp._execute({ userId: adminId }, { helpId });
        assert.equal(Helps.findOne(helpId), undefined);
      });
      it("does not delete a help if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the help
        assert.throws(
          () => {
            removeHelp._execute({ userId }, { helpId });
          },
          Meteor.Error,
          /api.helps.removeHelp.notPermitted/,
        );
        assert.throws(
          () => {
            removeHelp._execute({}, { helpId });
          },
          Meteor.Error,
          /api.helps.removeHelp.notPermitted/,
        );
      });
    });
    describe('updateHelp', function () {
      const theTag = Factory.create('help');
      const data = {
        title: 'help',
        content: theTag.content,
        description: theTag.description,
        category: theTag.category,
        type: theTag.type,
      };
      it('does update a help with admin user', function () {
        updateHelp._execute({ userId: adminId }, { helpId, data });
        const help = Helps.findOne(helpId);
        assert.equal(help.title, data.title);
      });
      it("does not update a help if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the help
        assert.throws(
          () => {
            updateHelp._execute({ userId }, { helpId, data });
          },
          Meteor.Error,
          /api.helps.updateHelp.notPermitted/,
        );
        assert.throws(
          () => {
            updateHelp._execute({}, { helpId, data });
          },
          Meteor.Error,
          /api.helps.updateHelp.notPermitted/,
        );
      });
    });
  });
});
