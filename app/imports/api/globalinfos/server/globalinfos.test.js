/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import '../../../startup/i18n/en.i18n.json';
import { faker } from '@faker-js/faker';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import {
  createGlobalInfo,
  getAllGlobalInfo,
  getAllGlobalInfoByLanguage,
  getGlobalInfoByLanguageAndNotExpired,
  deleteGlobalInfo,
  updateGlobalInfo,
} from './methods';

import GlobalInfos from '../globalInfo';
import '../../structures/server/factories';

describe('globalinfos', function () {
  describe('methods', function () {
    let userId;
    let adminId;
    let admin2Id;
    let defaultInfo;
    let newInfo;
    let structAdminId;
    let structInfo;
    let subStructInfo;

    const DEFAULT_VALIDITY_MESSAGE_IN_DAYS = 10;
    const today = new Date();
    const defaultExpiration = new Date(today.setDate(today.getDate() + DEFAULT_VALIDITY_MESSAGE_IN_DAYS));
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      GlobalInfos.remove({});

      // FIXME : find a way to reset roles collection ?
      Roles.createRole('admin', { unlessExists: true });
      Roles.createRole('adminStructure', { unlessExists: true });

      // Generate structures
      structAdminId = Factory.create('structure')._id;
      const subStructId = Factory.create('structure', { ancestorsIds: [structAdminId] })._id;
      const structAdmin2Id = Factory.create('structure')._id;
      // Generate 'users'
      const email = faker.internet.email();
      userId = Accounts.createUser({
        email,
        username: email,
        password: 'toto',
        structure: structAdminId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      const emailAdmin = faker.internet.email();
      adminId = Accounts.createUser({
        email: emailAdmin,
        username: emailAdmin,
        password: 'toto',
        structure: subStructId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      const emailAdmin2 = faker.internet.email();
      admin2Id = Accounts.createUser({
        email: emailAdmin2,
        username: emailAdmin2,
        password: 'toto',
        structure: structAdmin2Id,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });

      defaultInfo = {
        content: 'default globalinfos',
        language: 'fr',
        expirationDate: defaultExpiration,
      };
      newInfo = {
        content: 'premier test',
        language: 'en',
        expirationDate: defaultExpiration,
      };
      structInfo = {
        content: 'test structure',
        language: 'fr',
        expirationDate: defaultExpiration,
      };
      subStructInfo = {
        content: 'test sous structure',
        language: 'fr',
        expirationDate: defaultExpiration,
      };

      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
      Roles.addUsersToRoles(adminId, 'adminStructure', subStructId);
      Roles.addUsersToRoles(admin2Id, 'adminStructure', structAdmin2Id);
      // set users as active
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });
    });
    describe('createGlobalInfo', function () {
      it('does create a new globalinfo with admin user ', function () {
        const info = createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        assert.typeOf(info, 'object');
      });
      it("does not create globalInfo if you're not admin", function () {
        // Throws if non admin user, or logged out user, tries to delete the info
        assert.throws(
          () => {
            createGlobalInfo._execute({ userId }, { ...defaultInfo });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
        assert.throws(
          () => {
            createGlobalInfo._execute({}, { ...defaultInfo });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
      });
    });
    describe('createStructureInfo', function () {
      it('does create a new structure globalinfo with adminStructure user ', function () {
        const info = createGlobalInfo._execute({ userId: admin2Id }, { ...structInfo, structure: true });
        assert.typeOf(info, 'object');
      });
      it("does not create globalInfo if you're not adminStructure", function () {
        // Throws if non admin user, or logged out user, tries to delete the info
        assert.throws(
          () => {
            createGlobalInfo._execute({ userId }, { ...structInfo, structure: true });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
        assert.throws(
          () => {
            createGlobalInfo._execute({}, { ...structInfo, structure: true });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
      });
    });
    describe('getAllGlobalInfo', function () {
      it('does return all infos ', function () {
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        createGlobalInfo._execute({ userId: adminId }, { ...newInfo });
        const allInfos = getAllGlobalInfo._execute({ userId }, {});
        assert.equal(allInfos.length, 2);
      });
    });

    describe('getAllGlobalInfoByLanguage', function () {
      it('does return all infos in a language choose ', function () {
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        createGlobalInfo._execute({ userId: adminId }, { ...newInfo });
        const FrenchInfos = getAllGlobalInfoByLanguage._execute({}, { language: 'fr' });
        const EnglishInfos = getAllGlobalInfoByLanguage._execute({}, { language: 'en' });
        assert.equal(FrenchInfos.length, 1);
        assert.equal(EnglishInfos.length, 1);
      });
    });

    describe('getGlobalInfoByLanguageAndNotExpired', function () {
      it('does return all infos in a language choose and not expired ', function () {
        Roles.addUsersToRoles(userId, 'adminStructure', structAdminId);
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        createGlobalInfo._execute({ userId }, { ...structInfo, structure: true });
        createGlobalInfo._execute({ userId: adminId }, { ...subStructInfo, structure: true });
        const oldMessageDate = new Date('December 17, 2022 03:24:00');
        const oldMessageExpirationDate = new Date(
          oldMessageDate.setDate(oldMessageDate.getDate() + DEFAULT_VALIDITY_MESSAGE_IN_DAYS),
        );
        const newglobalInfo = {
          ...newInfo,
          expirationDate: oldMessageExpirationDate,
        };
        createGlobalInfo._execute({ userId: adminId }, { ...newglobalInfo });

        // users should not receive info from other structures than theirs (except from parent structures)
        const frenchInfosNotExpired = getGlobalInfoByLanguageAndNotExpired._execute(
          { userId: adminId },
          { language: 'fr', date: new Date() },
        );
        assert.equal(frenchInfosNotExpired.length, 3); // messages from user structure and ancestor
        const frenchInfosNotExpired2 = getGlobalInfoByLanguageAndNotExpired._execute(
          { userId },
          { language: 'fr', date: new Date() },
        );
        assert.equal(frenchInfosNotExpired2.length, 2); // messages from user structure
        const frenchInfosNotExpired3 = getGlobalInfoByLanguageAndNotExpired._execute(
          { userId: admin2Id },
          { language: 'fr', date: new Date() },
        );
        assert.equal(frenchInfosNotExpired3.length, 1); // no structure messages
      });
    });

    describe('deleteGlobalInfo', function () {
      it('does deleteinfo with admin user', function () {
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        const newglobalInfo = {
          ...newInfo,
          language: 'fr',
        };
        const messageToDelete = createGlobalInfo._execute({ userId: adminId }, { ...newglobalInfo });
        deleteGlobalInfo._execute({ userId: adminId }, { messageId: messageToDelete._id });
        const allInfos = getAllGlobalInfo._execute({}, {});
        assert.equal(allInfos.length, 1);
      });

      it("does not delete a tag if you're not admin", function () {
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        const messageToDelete = createGlobalInfo._execute({ userId: adminId }, { ...newInfo });

        // Throws if non admin user, or logged out user, tries to delete the info
        assert.throws(
          () => {
            deleteGlobalInfo._execute({ userId }, { messageId: messageToDelete._id });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
        assert.throws(
          () => {
            deleteGlobalInfo._execute({}, { messageId: messageToDelete._id });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
      });
    });

    describe('deleteStructureInfo', function () {
      it('does deleteinfo with adminStructure user', function () {
        createGlobalInfo._execute({ userId: admin2Id }, { ...structInfo, structure: true });
        const newglobalInfo = {
          ...newInfo,
          language: 'fr',
        };
        const messageToDelete = createGlobalInfo._execute({ userId: admin2Id }, { ...newglobalInfo, structure: true });
        const allInfosBefore = getAllGlobalInfo._execute({}, { structure: true });
        assert.equal(allInfosBefore.length, 2);
        deleteGlobalInfo._execute({ userId: admin2Id }, { messageId: messageToDelete._id, structure: true });
        const allInfos = getAllGlobalInfo._execute({}, { structure: true });
        assert.equal(allInfos.length, 1);
      });

      it("does not delete a structure message if you're not adminStructure", function () {
        createGlobalInfo._execute({ userId: admin2Id }, { ...defaultInfo, structure: true });
        const messageToDelete = createGlobalInfo._execute({ userId: admin2Id }, { ...newInfo, structure: true });

        // Throws if non adminStructure user, or logged out user, tries to delete the structure info
        assert.throws(
          () => {
            deleteGlobalInfo._execute({ userId }, { messageId: messageToDelete._id, structure: true });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
        assert.throws(
          () => {
            deleteGlobalInfo._execute({}, { messageId: messageToDelete._id, structure: true });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
      });
    });

    describe('updateGlobalInfos', function () {
      it('does update info with admin user', function () {
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        const messageToUpdate = createGlobalInfo._execute({ userId: adminId }, { ...newInfo });
        const { updatedAt } = messageToUpdate;
        const newglobalInfo = {
          language: messageToUpdate.language,
          content: 'updated Message',
          expirationDate: messageToUpdate.expirationDate,
          id: messageToUpdate._id,
        };
        const updatedInfo = updateGlobalInfo._execute({ userId: adminId }, { ...newglobalInfo });
        assert.equal(updatedInfo.content, newglobalInfo.content);
        assert.equal(updatedInfo.updatedAt.getTime(), updatedAt.getTime());
        const publishedInfo = updateGlobalInfo._execute({ userId: adminId }, { ...newglobalInfo, publish: true });
        assert.notEqual(publishedInfo.updatedAt.getTime(), updatedAt.getTime());
      });
      it("does not update a globalinfo if you're not admin", function () {
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        const messageToUpdate = createGlobalInfo._execute({ userId: adminId }, { ...newInfo });
        const newglobalInfo = {
          language: messageToUpdate.language,
          content: 'updated Message',
          expirationDate: messageToUpdate.expirationDate,
          id: messageToUpdate._id,
        };

        assert.throws(
          () => {
            updateGlobalInfo._execute({ userId }, { ...newglobalInfo });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
        assert.throws(
          () => {
            updateGlobalInfo._execute({}, { ...newglobalInfo });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
      });
    });

    describe('updateStructureInfos', function () {
      it('does update info with adminStructure user', function () {
        createGlobalInfo._execute({ userId: admin2Id }, { ...structInfo, structure: true });
        const messageToUpdate = createGlobalInfo._execute({ userId: admin2Id }, { ...newInfo, structure: true });
        const newglobalInfo = {
          language: messageToUpdate.language,
          content: 'updated Message',
          expirationDate: messageToUpdate.expirationDate,
          id: messageToUpdate._id,
        };
        const updatedInfo = updateGlobalInfo._execute({ userId: admin2Id }, { ...newglobalInfo, structure: true });
        assert.equal(updatedInfo.content, newglobalInfo.content);
      });
      it("does not update a structure info if you're not adminStructure", function () {
        createGlobalInfo._execute({ userId: admin2Id }, { ...defaultInfo, structure: true });
        const messageToUpdate = createGlobalInfo._execute({ userId: admin2Id }, { ...newInfo, structure: true });
        const newglobalInfo = {
          language: messageToUpdate.language,
          content: 'updated Message',
          expirationDate: messageToUpdate.expirationDate,
          id: messageToUpdate._id,
        };

        assert.throws(
          () => {
            updateGlobalInfo._execute({ userId }, { ...newglobalInfo, structure: true });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
        assert.throws(
          () => {
            updateGlobalInfo._execute({}, { ...newglobalInfo, structure: true });
          },
          Meteor.Error,
          /api.appsettings.updateIntroductionLanguage.notPermitted/,
        );
      });
    });
  });
});
