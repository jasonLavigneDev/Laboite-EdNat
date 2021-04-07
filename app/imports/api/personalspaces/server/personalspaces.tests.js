/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import '../../../../i18n/en.i18n.json';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Accounts } from 'meteor/accounts-base';
import { addService, addGroup, updatePersonalSpace, removeElement, checkPersonalSpace } from '../methods';
import PersonalSpaces from '../personalspaces';
import './publications';
import './factories';
import Services from '../../services/services';
import '../../services/server/factories';
import Groups from '../../groups/groups';
import '../../groups/server/factories';

describe('personalspaces', function () {
  describe('mutators', function () {
    it('builds correctly from factory', function () {
      const personalspace = Factory.create('personalspace');
      assert.typeOf(personalspace, 'object');
    });
  });
  describe('publications', function () {
    let userId;
    before(function () {
      Meteor.users.remove({});
      PersonalSpaces.remove({});

      userId = Accounts.createUser({
        username: 'yo',
        password: 'toto',
        email: faker.internet.email(),
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update(userId, { $set: { isActive: true } });
      PersonalSpaces.remove({});
      _.times(1, () => {
        Factory.create('personalspace', { userId });
      });
    });
    describe('personalspaces.self', function () {
      it('sends current user personalspace', function (done) {
        const collector = new PublicationCollector({ userId });
        collector.collect('personalspaces.self', (collections) => {
          assert.equal(collections.personalspaces.length, 1);
          done();
        });
      });
      it('sends service and group datas of current user personalspace', function (done) {
        const serviceId = Factory.create('service', { title: 'myService' })._id;
        const groupId = Factory.create('group', { name: 'myGroup', owner: Random.id() })._id;
        const unsorted = [
          {
            element_id: serviceId,
            type: 'service',
          },
          {
            element_id: groupId,
            type: 'group',
          },
        ];
        const newPS = { userId, unsorted, sorted: [] };
        updatePersonalSpace._execute({ userId }, { data: newPS });
        const collector = new PublicationCollector({ userId });
        collector.collect('personalspaces.self', (collections) => {
          assert.equal(collections.personalspaces.length, 1);
          assert.equal(collections.services.length, 1);
          assert.equal(collections.services[0].title, 'myService');
          assert.equal(collections.groups.length, 1);
          assert.equal(collections.groups[0].name, 'myGroup');
          done();
        });
      });
    });
  });
  describe('methods', function () {
    let userId;
    let emptyPS;
    beforeEach(function () {
      // Clear
      Meteor.users.remove({});
      Services.remove({});
      Groups.remove({});
      PersonalSpaces.remove({});

      // Generate 'user'
      userId = Accounts.createUser({
        username: 'yo',
        password: 'toto',
        email: faker.internet.email(),
        structure: faker.company.companyName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      });
      Meteor.users.update({}, { $set: { isActive: true } }, { multi: true });

      // Empty PersonalSpace for current user
      emptyPS = { userId, unsorted: [], sorted: [] };
    });
    describe('updatePersonalSpace', function () {
      it('does create a empty personalspace for the current user', function () {
        updatePersonalSpace._execute({ userId }, { data: emptyPS });
        const ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps, 'object');
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 0);
        assert.typeOf(ps.sorted, 'array');
        assert.lengthOf(ps.sorted, 0);
      });
      it("does update the current user's personalspace with a new service", function () {
        updatePersonalSpace._execute({ userId }, { data: emptyPS });
        const newPS = {
          ...emptyPS,
          unsorted: [
            {
              element_id: Random.id(),
              type: 'service',
            },
          ],
        };
        updatePersonalSpace._execute({ userId }, { data: newPS });
        const ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 1);
        assert.equal(ps.unsorted[0].type, 'service');
      });
      it("does update the current user's personalspace with a new empty zone", function () {
        updatePersonalSpace._execute({ userId }, { data: emptyPS });
        const newZone = {
          zone_id: Random.id(),
          name: 'zone',
          elements: [],
        };
        const newPS = { ...emptyPS, sorted: [newZone] };
        updatePersonalSpace._execute({ userId }, { data: newPS });
        const ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.sorted, 'array');
        assert.lengthOf(ps.sorted, 1);
        assert.equal(ps.sorted[0].name, 'zone');
        assert.typeOf(ps.sorted[0].elements, 'array');
        assert.lengthOf(ps.sorted[0].elements, 0);
      });
    });
    describe('addService', function () {
      it("does add a service to the current user's personalspace", function () {
        const serviceId = Factory.create('service')._id;
        addService._execute({ userId }, { serviceId });
        const ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 1);
        assert.equal(ps.unsorted[0].type, 'service');
        assert.equal(ps.unsorted[0].element_id, serviceId);
      });
    });
    describe('addGroup', function () {
      it("does add a group to the current user's personalspace", function () {
        const groupId = Factory.create('group', { owner: Random.id() })._id;
        addGroup._execute({ userId }, { groupId });
        const ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 1);
        assert.equal(ps.unsorted[0].type, 'group');
        assert.equal(ps.unsorted[0].element_id, groupId);
      });
    });
    describe('removeElement', function () {
      // add groups and services in sorted and unsorted part of personalspace
      const serviceIdU = Factory.create('service')._id;
      const serviceIdS = Factory.create('service')._id;
      const groupIdU = Factory.create('group', { owner: Random.id() })._id;
      const groupIdS = Factory.create('group', { owner: Random.id() })._id;
      const unsorted = [
        {
          element_id: serviceIdU,
          type: 'service',
        },
        {
          element_id: groupIdU,
          type: 'group',
        },
      ];
      const newZone = {
        zone_id: Random.id(),
        name: 'zone',
        elements: [
          {
            element_id: serviceIdS,
            type: 'service',
          },
          {
            element_id: groupIdS,
            type: 'group',
          },
        ],
      };
      const newPS = { ...emptyPS, unsorted, sorted: [newZone] };

      it("does remove a service from unsorted zone of the current user's personalspace", function () {
        updatePersonalSpace._execute({ userId }, { data: newPS });
        let ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 2);
        removeElement._execute({ userId }, { type: 'service', elementId: serviceIdU });
        ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 1);
      });
      it("does remove a group from unsorted zone of the current user's personalspace", function () {
        updatePersonalSpace._execute({ userId }, { data: newPS });
        let ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 2);
        removeElement._execute({ userId }, { type: 'group', elementId: groupIdU });
        ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 1);
      });
      it("does remove a service from a sorted zone of the current user's personalspace", function () {
        updatePersonalSpace._execute({ userId }, { data: newPS });
        let ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.sorted[0].elements, 'array');
        assert.lengthOf(ps.sorted[0].elements, 2);
        removeElement._execute({ userId }, { type: 'service', elementId: serviceIdS });
        ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.sorted[0].elements, 'array');
        assert.lengthOf(ps.sorted[0].elements, 1);
      });
      it("does remove a group from a sorted zone of the current user's personalspace", function () {
        updatePersonalSpace._execute({ userId }, { data: newPS });
        let ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.sorted[0].elements, 'array');
        assert.lengthOf(ps.sorted[0].elements, 2);
        removeElement._execute({ userId }, { type: 'group', elementId: groupIdS });
        ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.sorted[0].elements, 'array');
        assert.lengthOf(ps.sorted[0].elements, 1);
      });
    });
    describe('checkPersonalSpace', function () {
      it('does ensure that no duplicate entries or missing groups exists in PersonalSpace', function () {
        updatePersonalSpace._execute({ userId }, { data: emptyPS });
      });
      it("does remove deleted groups and duplicates from current user's personalspace", function () {
        const serviceIdS = Factory.create('service')._id;

        const services = [
          {
            element_id: serviceIdS,
            type: 'service',
          },
          {
            element_id: serviceIdS,
            type: 'service',
          },
        ];
        updatePersonalSpace._execute({ userId }, { data: { ...emptyPS, unsorted: services } });
        const groupId = Factory.create('group', { owner: Random.id() })._id;
        addGroup._execute({ userId }, { groupId });
        Groups.remove({ _id: groupId });
        // check that removed group is still present in current PersonalSpace
        // and serviceIds is duplicated
        const ps = PersonalSpaces.findOne({ userId });
        assert.typeOf(ps.unsorted, 'array');
        assert.lengthOf(ps.unsorted, 3);
        assert.equal(ps.unsorted[2].type, 'group');
        assert.equal(ps.unsorted[2].element_id, groupId);
        assert.typeOf(ps.sorted, 'array');
        assert.lengthOf(ps.sorted, 0);
        checkPersonalSpace._execute({ userId });
        // check that removed group is purged from PersonalSpace after check
        const psafter = PersonalSpaces.findOne({ userId });
        assert.typeOf(psafter.unsorted, 'array');
        assert.lengthOf(psafter.unsorted, 1);
        assert.equal(psafter.unsorted[0].element_id, serviceIdS);
      });
    });
  });
});
