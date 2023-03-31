import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import i18n from 'meteor/universe:i18n';

import { isActive, validateString } from '../utils';
import PersonalSpaces from './personalspaces';
import Groups from '../groups/groups';
import Services from '../services/services';

import UserBookmarks from '../userBookmarks/userBookmarks';
import DefaultSpaces from '../defaultspaces/defaultspaces';
import logServer, { levels, scopes } from '../logging';

export const addItem = (userId, item) => {
  const currentPersonalSpace = PersonalSpaces.findOne({ userId });
  let alreadyExists = false;
  if (currentPersonalSpace === undefined) {
    // create personalSpace if not existing
    PersonalSpaces.insert({ userId, unsorted: [], sorted: [] });
  } else {
    // check that item is not already present
    alreadyExists =
      PersonalSpaces.findOne({
        $and: [
          { userId },
          {
            $or: [
              {
                unsorted: { $elemMatch: { type: item.type, element_id: item.element_id } },
              },
              { 'sorted.elements': { $elemMatch: { type: item.type, element_id: item.element_id } } },
            ],
          },
        ],
      }) !== undefined;
  }
  if (!alreadyExists) PersonalSpaces.update({ userId }, { $push: { unsorted: item } });
};

export const removeElement = new ValidatedMethod({
  name: 'personalspaces.removeElement',
  validate: new SimpleSchema({
    elementId: { type: String, regEx: SimpleSchema.RegEx.Id },
    type: String,
  }).validator(),

  run({ elementId, type }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.addService.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // remove all entries matching item type and element_id
    PersonalSpaces.update(
      { userId: this.userId },
      {
        $pull: {
          unsorted: { type, element_id: elementId },
          'sorted.$[].elements': { type, element_id: elementId },
        },
      },
    );
  },
});

export const addService = new ValidatedMethod({
  name: 'personalspaces.addService',
  validate: new SimpleSchema({
    serviceId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ serviceId }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.addService.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const service = Services.findOne(serviceId);
    if (service === undefined) {
      throw new Meteor.Error('api.personalspaces.addService.unknownService', i18n.__('api.services.unknownService'));
    }
    addItem(this.userId, { type: 'service', element_id: serviceId });
  },
});

export const addGroup = new ValidatedMethod({
  name: 'personalspaces.addGroup',
  validate: new SimpleSchema({
    groupId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ groupId }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.addGroup.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const group = Groups.findOne(groupId);
    if (group === undefined) {
      throw new Meteor.Error('api.personalspaces.addGroup.unknownGroup', i18n.__('api.groups.unknownGroup'));
    }
    addItem(this.userId, { type: 'group', element_id: groupId });
  },
});

export const addUserBookmark = new ValidatedMethod({
  name: 'personalspaces.addBookmark',
  validate: new SimpleSchema({
    bookmarkId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ bookmarkId }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.addBookmark.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const bookmark = UserBookmarks.findOne(bookmarkId);
    if (bookmark === undefined) {
      throw new Meteor.Error(
        'api.personalspaces.addBookmark.unknownBookmark',
        i18n.__('api.bookmarks.unknownBookmark'),
      );
    }
    addItem(this.userId, { type: 'link', element_id: bookmarkId });
  },
});

export const checkPersonalSpaceData = (data) => {
  const checkElement = (element) => {
    if (element.title) validateString(element.title);
    if (element.url) validateString(element.url);
  };
  if (data.unsorted) {
    data.unsorted.forEach((elem) => checkElement(elem));
  }
  if (data.sorted) {
    data.sorted.forEach((zone) => {
      validateString(zone.name);
      zone.elements.forEach((elem) => checkElement(elem));
    });
  }
};

export const updatePersonalSpace = new ValidatedMethod({
  name: 'personalspaces.updatePersonalSpace',
  validate: new SimpleSchema({
    data: PersonalSpaces.schema.omit('userId'),
  }).validator({ clean: true }),

  run({ data }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.updatePersonalSpace.notPermitted', i18n.__('api.users.notPermitted'));
    }
    checkPersonalSpaceData(data);
    const currentPersonalSpace = PersonalSpaces.findOne({ userId: this.userId });
    if (currentPersonalSpace === undefined) {
      // create personalSpace if not existing
      PersonalSpaces.insert({ ...data, userId: this.userId });
    } else {
      PersonalSpaces.update({ _id: currentPersonalSpace._id }, { $set: data });
    }
  },
});

export const checkPersonalSpace = new ValidatedMethod({
  name: 'personalspaces.checkPersonalSpace',
  validate: null,

  run() {
    // check integrity of personal space datas (no duplicate card and check if groups still exists)

    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.updatePersonalSpace.notPermitted', i18n.__('api.users.notPermitted'));
    }
    const currentPersonalSpace = PersonalSpaces.findOne({ userId: this.userId });
    const u = Meteor.users.findOne(
      { _id: this.userId },
      { fields: { username: 1, favServices: 1, favGroups: 1, favUserBookmarks: 1 } },
    );
    if (currentPersonalSpace === undefined) {
      if (u.favServices && u.favGroups && u.favUserBookmarks) {
        // logServer(`Regen Personalspace (not found) for ${u.username}...`);
        logServer(
          `PERSONALSPACES - METHODS - checkPersonalSpace, Regen Personalspace (not found) for ${u.username}...`,
          levels.ERROR,
          scopes.SYSTEM,
          { u },
        );
        const unsorted = [];
        u.favServices.forEach((s) => {
          unsorted.push({
            element_id: s,
            type: 'service',
          });
        });
        u.favGroups.forEach((g) => {
          unsorted.push({
            element_id: g,
            type: 'group',
          });
        });
        u.favUserBookmarks.forEach((b) => {
          unsorted.push({
            element_id: b,
            type: 'link',
          });
        });
        updatePersonalSpace._execute({ userId: this.userId }, { data: { userId: this.userId, unsorted, sorted: [] } });
      }
      return; // No need to go further
    }
    let changeMade = false;
    const elementIds = { service: [], group: [], link: [] };

    const checkZone = (zone) => {
      // Loop zone elements backward so we can delete items by index
      for (let index = zone.length - 1; index >= 0; index -= 1) {
        const elem = zone[index];
        if (elementIds[elem.type].indexOf(elem.element_id) !== -1) {
          // We have a duplicate card to delete
          zone.splice(index, 1);
          changeMade = true;
          // eslint-disable-next-line
          continue; // continue to next element
        }
        if (elem.type === 'group') {
          // Check if group still exists
          const group = Groups.findOne(elem.element_id);
          if (group === undefined) {
            // group no more exists so delete element
            zone.splice(index, 1);
            changeMade = true;
            // eslint-disable-next-line
            continue; // continue to next element
          }
        } else if (elem.type === 'link') {
          // Check if link still exists
          const link = UserBookmarks.findOne(elem.element_id);
          if (link === undefined) {
            // link no more exists so delete element
            zone.splice(index, 1);
            changeMade = true;
            // eslint-disable-next-line
            continue; // continue to next element
          }
        } else if (elem.type === 'service') {
          // Check if service still exists
          const service = Services.findOne(elem.element_id);
          if (service === undefined) {
            // service no more exists so delete element
            zone.splice(index, 1);
            changeMade = true;
            // eslint-disable-next-line
            continue; // continue to next element
          }
        }
        elementIds[elem.type].push(elem.element_id);
      }
    };

    currentPersonalSpace.sorted.forEach((zone) => {
      checkZone(zone.elements);
    });
    checkZone(currentPersonalSpace.unsorted);

    // Save modified PS if necessary
    if (changeMade) {
      updatePersonalSpace._execute({ userId: this.userId }, { data: currentPersonalSpace }, (err) => {
        if (err) {
          // logServer(err.reason, 'error');
          logServer(`PERSONALSPACES - METHODS - checkPersonalSpace`, levels.ERROR, scopes.SYSTEM, {
            error: err.reason,
          });
        }
      });
    }
  },
});

export const backToDefaultElement = new ValidatedMethod({
  name: 'personalspaces.backToDefaultElement',
  validate: new SimpleSchema({
    elementId: { type: String, regEx: SimpleSchema.RegEx.Id },
    type: String,
  }).validator(),

  run({ elementId, type }) {
    // check if active and logged in
    if (!isActive(this.userId)) {
      throw new Meteor.Error('api.personalspaces.backToDefaultElement.notPermitted', i18n.__('api.users.notPermitted'));
    }
    // remove all entries matching item type and element_id
    PersonalSpaces.update(
      { userId: this.userId },
      {
        $pull: {
          unsorted: { type, element_id: elementId },
          'sorted.$[].elements': { type, element_id: elementId },
        },
      },
    );
    // add element in default zone according to element type
    switch (type) {
      case 'service':
        addService._execute({ userId: this.userId }, { serviceId: elementId });
        break;

      case 'group':
        addGroup._execute({ userId: this.userId }, { groupId: elementId });
        break;

      case 'link':
        addUserBookmark._execute({ userId: this.userId }, { bookmarkId: elementId });
        break;

      default:
        throw new Meteor.Error('api.personalspaces.backToDefaultElement.unknownType');
    }
  },
});

export const generateDefaultPersonalSpace = new ValidatedMethod({
  name: 'personalspaces.generateDefaultPersonalSpace',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),

  run({ userId }) {
    // check if active and logged in
    if (!isActive(userId)) {
      throw new Meteor.Error(
        'api.personalspaces.generateDefaultPersonalSpace.notPermitted',
        i18n.__('api.users.notPermitted'),
      );
    }

    const user = Meteor.users.findOne({ _id: userId });
    const { structure } = user;
    const defaultSpace = DefaultSpaces.findOne({ structureId: structure });
    const currentSpace = PersonalSpaces.findOne({ userId }) || {};
    const { unsorted = [] } = currentSpace;

    // add all services to favorites in user schema
    let servicesAdded = [...unsorted];

    if (defaultSpace && defaultSpace.sorted) {
      defaultSpace.sorted.forEach(({ elements = [] }) => {
        if (elements) {
          servicesAdded = [
            ...servicesAdded,
            ...elements.filter((item) => item.type === 'service').map((service) => service.element_id),
          ];
        }
      });
    }
    Meteor.users.update(userId, {
      $set: { favServices: servicesAdded },
    });

    // Copy the personal space from the default structure one
    return PersonalSpaces.update(
      { userId },
      {
        $set: {
          sorted: defaultSpace ? defaultSpace.sorted : [],
        },
      },
      { upsert: true },
    );
  },
});

// Get list of all method names on User
const LISTS_METHODS = _.pluck(
  [
    updatePersonalSpace,
    removeElement,
    addService,
    addGroup,
    addUserBookmark,
    checkPersonalSpace,
    backToDefaultElement,
    generateDefaultPersonalSpace,
  ],
  'name',
);

if (Meteor.isServer) {
  // Only allow 5 list operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000,
  );
}
