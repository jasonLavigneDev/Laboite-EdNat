/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import '../../../startup/i18n/en.i18n.json';
import faker from 'faker';
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

describe('globalinfos', function () {
  describe('methods', function () {
    let userId;
    let adminId;
    let defaultInfo;
    let newInfo;

    const DEFAULT_VALIDITY_MESSAGE_IN_DAYS = 10;
    const today = new Date();
    const defaultExpiration = new Date(today.setDate(today.getDate() + DEFAULT_VALIDITY_MESSAGE_IN_DAYS));
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      GlobalInfos.remove({});

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

      // set this user as global admin
      Roles.addUsersToRoles(adminId, 'admin');
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
    describe('getAllGlobalInfo', function () {
      it('does return all infos ', function () {
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        createGlobalInfo._execute({ userId: adminId }, { ...newInfo });
        const allInfos = getAllGlobalInfo._execute({}, {});
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
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        const oldMessageDate = new Date('December 17, 2022 03:24:00');
        const oldMessageExpirationDate = new Date(
          oldMessageDate.setDate(oldMessageDate.getDate() + DEFAULT_VALIDITY_MESSAGE_IN_DAYS),
        );
        const newglobalInfo = {
          ...newInfo,
          expirationDate: oldMessageExpirationDate,
        };
        createGlobalInfo._execute({ userId: adminId }, { ...newglobalInfo });
        const frenchInfosNotExpired = getGlobalInfoByLanguageAndNotExpired._execute(
          {},
          { language: 'fr', date: new Date() },
        );
        assert.equal(frenchInfosNotExpired.length, 1);
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

    describe('updateGlobalInfos', function () {
      it('does update info with admin user', function () {
        createGlobalInfo._execute({ userId: adminId }, { ...defaultInfo });
        const messageToUpdate = createGlobalInfo._execute({ userId: adminId }, { ...newInfo });
        const newglobalInfo = {
          language: messageToUpdate.language,
          content: 'updated Message',
          expirationDate: messageToUpdate.expirationDate,
          id: messageToUpdate._id,
        };
        const updatedInfo = updateGlobalInfo._execute({ userId: adminId }, { ...newglobalInfo });
        assert.equal(updatedInfo.content, newglobalInfo.content);
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
  });
});
