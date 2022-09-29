/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import '../../../startup/i18n/en.i18n.json';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import BusinessReGrouping from '../businessReGrouping';
import { createBusinessReGrouping, removeBusinessReGrouping, updateBusinessReGrouping } from '../methods';
import './publications';
import './factories';
import Services from '../../services/services';
import '../../services/server/factories';

describe('businessReGrouping', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const businessReGrouping = Factory.create('businessReGrouping');
      assert.typeOf(businessReGrouping, 'object');
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
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      BusinessReGrouping.remove({});
      _.times(4, () => {
        Factory.create('businessReGrouping');
      });
    });
    describe('businessReGrouping.all', function () {
      it('sends all businessReGrouping', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('businessReGrouping.all', (collections) => {
          assert.equal(collections.BusinessReGrouping.length, 4);
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let adminId;
    let businessReGroupingId;
    let chatData;
    let chatData2;
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
      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
      businessReGroupingId = Factory.create('businessReGrouping')._id;
      chatData = {
        name: 'application',
      };
      chatData2 = {
        name: 'application2',
      };
    });
    describe('createBusinessReGrouping', function () {
      it('does create a business reGrouping with admin user', function () {
        createBusinessReGrouping._execute({ userId: adminId }, chatData);
        const businessReGrouping = BusinessReGrouping.findOne({ name: chatData.name });
        assert.typeOf(businessReGrouping, 'object');
      });
      it("does not create a businessReGrouping if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to create a businessReGrouping
        assert.throws(
          () => {
            createBusinessReGrouping._execute({ userId }, chatData2);
          },
          Meteor.Error,
          /api.businessReGrouping.createBusinessReGrouping.notPermitted/,
        );
        assert.throws(
          () => {
            createBusinessReGrouping._execute({}, chatData2);
          },
          Meteor.Error,
          /api.businessReGrouping.createBusinessReGrouping.notPermitted/,
        );
      });
      it('does not create a business reGrouping if name already use', function () {
        // Throws if non admin user, or logged out user, tries to create a businessReGrouping
        assert.throws(
          () => {
            createBusinessReGrouping._execute({ userId: adminId }, chatData);
          },
          Meteor.Error,
          /api.businessReGrouping.createBusinessReGrouping.alreadyExists/,
        );
      });
    });
    describe('removeBusinessReGrouping', function () {
      it('does delete a business reGrouping with admin user', function () {
        removeBusinessReGrouping._execute({ userId: adminId }, { businessReGroupingId });
        assert.equal(BusinessReGrouping.findOne(businessReGroupingId), undefined);
      });
      it('does remove the business reGrouping from a service', function () {
        const oneServiceId = Factory.create('service', {
          title: 'test',
          businessReGrouping: [businessReGroupingId],
        })._id;
        removeBusinessReGrouping._execute({ userId: adminId }, { businessReGroupingId });
        assert.equal(BusinessReGrouping.findOne(businessReGroupingId), undefined);
        assert.equal(Services.findOne(oneServiceId).businessReGrouping.length, 0);
      });
      it("does not delete a business reGrouping if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the businessReGrouping
        assert.throws(
          () => {
            removeBusinessReGrouping._execute({ userId }, { businessReGroupingId });
          },
          Meteor.Error,
          /api.businessReGrouping.removeBusinessReGrouping.notPermitted/,
        );
        assert.throws(
          () => {
            removeBusinessReGrouping._execute({}, { businessReGroupingId });
          },
          Meteor.Error,
          /api.businessReGrouping.removeBusinessReGrouping.notPermitted/,
        );
      });
    });
    describe('updateBusinessReGrouping', function () {
      it('does update a business reGrouping with admin user', function () {
        const data = {
          name: 'businessReGrouping',
        };
        updateBusinessReGrouping._execute({ userId: adminId }, { businessReGroupingId, data });
        const businessReGrouping = BusinessReGrouping.findOne(businessReGroupingId);
        assert.equal(businessReGrouping.name, data.name);
      });
      it("does not update a business reGrouping if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the business reGrouping
        assert.throws(
          () => {
            updateBusinessReGrouping._execute(
              { userId },
              { businessReGroupingId, data: { name: 'businessReGrouping' } },
            );
          },
          Meteor.Error,
          /api.businessReGrouping.updateBusinessReGrouping.notPermitted/,
        );
        assert.throws(
          () => {
            updateBusinessReGrouping._execute({}, { businessReGroupingId, data: { name: 'businessReGrouping' } });
          },
          Meteor.Error,
          /api.businessReGrouping.updateBusinessReGrouping.notPermitted/,
        );
      });
    });
  });
});
