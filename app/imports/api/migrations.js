import { Migrations } from 'meteor/percolate:migrations';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import Articles from './articles/articles';
import Services from './services/services';
import Groups from './groups/groups';
import Structures, { defaultIntroduction } from './structures/structures';
import Tags from './tags/tags';
import logServer from './logging';
import AppSettings from './appsettings/appsettings';
import { addItem } from './personalspaces/methods';
import PersonalSpaces from './personalspaces/personalspaces';

Migrations.add({
  version: 1,
  name: 'Add state field to services',
  up: () => {
    Services.update({ state: null }, { $set: { state: 0 } }, { multi: true });
  },
  down: () => {
    Services.rawCollection().updateMany({}, { $unset: { state: true } });
  },
});

Migrations.add({
  version: 2,
  name: 'Add articles count and last publication date to users',
  up: () => {
    let updateInfos = {};
    Meteor.users
      .find()
      .fetch()
      .forEach((user) => {
        updateInfos = {
          articlesCount: Articles.find({ userId: user._id }).count(),
        };
        if (updateInfos.articlesCount > 0) {
          updateInfos.lastArticle = Articles.findOne({ userId: user._id }, { $sort: { updateAt: -1 } }).updatedAt;
        }
        Meteor.users.update({ _id: user._id }, { $set: updateInfos });
      });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { articlesCount: true, lastArticle: true } });
  },
});

Migrations.add({
  version: 3,
  name: 'Add candidates count to groups',
  up: () => {
    Groups.find()
      .fetch()
      .forEach((group) => {
        const numCandidates = group.candidates.length;
        Groups.update({ _id: group._id }, { $set: { numCandidates } });
      });
  },
  down: () => {
    Groups.rawCollection().updateMany({}, { $unset: { numCandidates: true } });
  },
});

Migrations.add({
  version: 4,
  name: 'Add visit count to articles',
  up: () => {
    Articles.update({}, { $set: { visits: 0 } }, { multi: true });
  },
  down: () => {
    Articles.rawCollection().updateMany({}, { $unset: { visits: true } });
  },
});

Migrations.add({
  version: 5,
  name: 'Add nextcloud setting to groups',
  up: () => {
    if (Groups.schema._schemaKeys.includes('nextcloud')) {
      Groups.update({}, { $set: { nextcloud: false } }, { multi: true });
    }
  },
  down: () => {
    Groups.rawCollection().updateMany({}, { $unset: { nextcloud: true } });
  },
});

Migrations.add({
  version: 6,
  name: 'Add plugins setting to groups and remove nextcloud',
  up: () => {
    Groups.update({}, { $set: { plugins: {} } }, { multi: true });
    Groups.update(
      { nextcloud: true },
      { $set: { plugins: { nextcloud: { enable: true } } }, $unset: { nextcloud: true } },
      { multi: true },
    );
  },
  down: () => {
    Groups.rawCollection().updateMany({ plugins: { nextcloud: { enable: true } } }, { $set: { nextcloud: true } });
    Groups.rawCollection().updateMany({}, { $unset: { plugins: true } });
  },
});

Migrations.add({
  version: 7,
  name: 'Add tags list to articles',
  up: () => {
    Articles.update({}, { $set: { tags: [] } }, { multi: true });
  },
  down: () => {
    Articles.rawCollection().updateMany({}, { $unset: { tags: true } });
  },
});

Migrations.add({
  version: 8,
  name: 'No update here (kept for compatibility)',
  up: () => {
    // nothing to do here, wrong code previsouly added by mistake
    // Articles.update({}, { $set: { tags: [] } }, { multi: true });
  },
  down: () => {
    // nothing to do here, wrong code previsouly added by mistake
    // Articles.rawCollection().updateMany({}, { $unset: { tags: true } });
  },
});

Migrations.add({
  version: 9,
  name: 'Add author structure to articles',
  up: () => {
    Articles.find({})
      .fetch()
      .forEach((article) => {
        const updateData = {};
        // set article structure when possible
        if (article.structure === undefined || article.structure === '') {
          const author = Meteor.users.findOne({ _id: article.userId }, { fields: { structure: 1 } });
          if (author) {
            updateData.structure = author.structure || '';
          } else {
            logServer(`Migration: could not find author ${article.userId} for article ${article._id}`);
          }
        }
        // store tag name in articles instead of _id
        const newTags = [];
        if (article.tags) {
          article.tags.forEach((tagId) => {
            const tag = Tags.findOne(tagId);
            if (tag && !newTags.includes(tag.name.toLowerCase())) {
              // add and force tag to lower case
              newTags.push(tag.name.toLowerCase());
            }
          });
          updateData.tags = newTags;
        }
        if (Object.keys(updateData).length > 0) {
          Articles.update({ _id: article._id }, { $set: updateData });
        }
      });
    // update Tags collection to be lowercase only
    Tags.find({})
      .fetch()
      .forEach((tag) => {
        const tagName = tag.name.toLowerCase();
        if (tag.name !== tagName) {
          if (Tags.findOne({ name: tagName })) {
            // tag names are unique, remove if lowercase version exists
            Tags.remove({ _id: tag._id });
          } else {
            // otherwise, update tag
            Tags.update({ _id: tag._id }, { $set: { name: tagName } });
          }
        }
      });
  },
  down: () => {
    Articles.rawCollection().updateMany({}, { $unset: { structure: true } });
    Articles.find({})
      .fetch()
      .forEach((article) => {
        // store back tag _id (unknown tags are removed to prevent schema check errors)
        const newTags = [];
        if (article.tags) {
          article.tags.forEach((tagName) => {
            const tag = Tags.findOne({ name: tagName });
            if (tag) newTags.push(tag._id);
          });
        }
        Articles.update({ _id: article._id }, { $set: { tags: newTags } });
      });
  },
});

Migrations.add({
  version: 10,
  name: 'Add articles boolean to groups with articles',
  up: () => {
    const articles = Articles.find({ groups: { $exists: true } }).fetch();
    articles.forEach(({ groups }) => {
      groups.forEach(({ _id }) => {
        Groups.update({ _id }, { $set: { articles: true } });
      });
    });
  },
  down: () => {
    Groups.rawCollection().updateMany({}, { $unset: { articles: true } });
  },
});

Migrations.add({
  version: 11,
  name: 'Add structure to services',
  up: () => {
    Services.update({}, { $set: { structure: '' } }, { multi: true });
  },
  down: () => {
    Services.rawCollection().updateMany({}, { $unset: { structure: true } });
  },
});

Migrations.add({
  version: 12,
  name: 'Update group count and quota on users',
  up: () => {
    let updateInfos = {};
    Meteor.users
      .find()
      .fetch()
      .forEach((user) => {
        updateInfos = {
          groupCount: Groups.find({ owner: user._id }).count(),
        };
        if (user.groupQuota === undefined) {
          updateInfos.groupQuota = Meteor.users.schema._schema.groupQuota.defaultValue;
        }
        Meteor.users.update({ _id: user._id }, { $set: updateInfos });
      });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { groupQuota: true, groupCount: true } });
  },
});

Migrations.add({
  version: 13,
  name: 'Update articles boolean on groups if not set in step 10',
  up: () => {
    Groups.update({ articles: null }, { $set: { articles: false } }, { multi: true });
  },
  down: () => {
    // no rollback on this step
  },
});

Migrations.add({
  version: 14,
  name: 'Add nclocator url to users',
  up: () => {
    Meteor.users
      .find()
      .fetch()
      .forEach((user) => {
        Meteor.users.rawCollection().updateOne({ _id: user._id }, { $set: { ncloud: '' } });
      });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { ncloud: true } });
  },
});

Migrations.add({
  version: 15,
  name: 'Add advancedPersonalPage to users',
  up: () => {
    Meteor.users
      .find()
      .fetch()
      .forEach((user) => {
        Meteor.users.update({ _id: user._id }, { $set: { advancedPersonalPage: false } });
      });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { advancedPersonalPage: true } });
  },
});

Migrations.add({
  version: 16,
  name: 'Add favUserBookmarks to users',
  up: () => {
    Meteor.users.update({}, { $set: { favUserBookmarks: [] } }, { multi: true });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { favUserBookmarks: true } });
  },
});

Migrations.add({
  version: 17,
  name: 'Rename nclocator field for users',
  up: () => {
    Meteor.users.rawCollection().updateMany({}, { $rename: { ncloud: 'nclocator' } });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $rename: { nclocator: 'ncloud' } });
  },
});

Migrations.add({
  version: 18,
  name: 'Add articlesEnable field for users',
  up: () => {
    Meteor.users
      .find()
      .fetch()
      .forEach((user) => {
        Meteor.users.update({ _id: user._id }, { $set: { articlesEnable: false } });
      });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { articlesEnable: true } });
  },
});

Migrations.add({
  version: 19,
  name: 'Add maintenance and textMaintenance field for appsettings',
  up: () => {
    AppSettings.find()
      .fetch()
      .forEach((setting) => {
        AppSettings.update({ _id: setting._id }, { $set: { maintenance: false, textMaintenance: '' } });
      });
  },
  down: () => {
    AppSettings.rawCollection().updateMany({}, { $unset: { maintenance: true, textMaintenance: true } });
  },
});

const structureOptions = [
  'Ministère Education',
  'Éducation',
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Guadeloupe',
  'Guyane',
  'Hauts-de-France',
  'Île-de-France',
  'Martinique',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  "Provence-Alpes-Côte d'Azur",
  'La Réunion',
  'Collectivité',
  'Autre',
];

Migrations.add({
  version: 20,
  name: 'Attach users to their structure',
  up: () => {
    const isStructuresSet = Meteor.users.findOne({ structure: { $exists: true } });
    if (isStructuresSet) {
      structureOptions.forEach((label) => {
        const structureDB = Structures.findOne({ name: label });
        let structureId = structureDB && structureDB._id;
        if (!structureId) {
          structureId = Structures.insert({ name: label });
        }
        Meteor.users.rawCollection().updateMany({ structure: label }, { $set: { structure: structureId } });
      });
    }
  },
  down: () => {
    Structures.find()
      .fetch()
      .forEach(({ name, _id }) => {
        Meteor.users.rawCollection().updateMany({ structure: _id }, { $set: { structure: name } });
      });
  },
});

Migrations.add({
  version: 21,
  name: 'Attach services to their structure if needed',
  up: () => {
    const allStructures = Structures.find({}).fetch();
    const structIds = allStructures.map((struct) => struct._id);
    const structuresInfo = {};
    allStructures.forEach((struct) => {
      structuresInfo[struct.name] = struct._id;
    });
    // check if we find services with structure set and not matching any structure id
    Services.find({ structure: { $nin: ['', ...structIds] } })
      .fetch()
      .forEach((serv) => {
        // if service structure matches any known structure name, replace by structure id
        if (structuresInfo[serv.structure])
          Services.update(serv._id, { $set: { structure: structuresInfo[serv.structure] } });
      });
  },
  down: () => {
    Structures.find()
      .fetch()
      .forEach(({ name, _id }) => {
        Services.rawCollection().updateMany({ structure: _id }, { $set: { structure: name } });
      });
  },
});

Migrations.add({
  version: 22,
  name: 'Attach structure admins to their structure',
  up: () => {
    const allStructures = Structures.find({}).fetch();
    const structuresInfo = {};
    allStructures.forEach((struct) => {
      structuresInfo[struct.name] = struct._id;
    });
    // check if we find services with structure set and not matching any structure id
    Meteor.roleAssignment
      .find({ 'role._id': 'adminStructure', scope: { $ne: null } })
      .fetch()
      .forEach((assignment) => {
        // if user structure matches any known structure name, replace by structure id
        if (structuresInfo[assignment.scope])
          Meteor.roleAssignment.update(assignment._id, { $set: { scope: structuresInfo[assignment.scope] } });
      });
  },
  down: () => {
    Structures.find()
      .fetch()
      .forEach(({ name, _id }) => {
        Meteor.roleAssignment.rawCollection().updateMany({ scope: _id }, { $set: { scope: name } });
      });
  },
});

Migrations.add({
  version: 23,
  name: 'add authToken to users',
  up: () => {
    Meteor.users
      .find()
      .fetch()
      .forEach(({ _id }) => {
        Meteor.users.update({ _id }, { $set: { authToken: Random.secret(150) } });
      });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { authToken: true } });
  },
});

Migrations.add({
  version: 24,
  name: 'Add parentId, childrenIds and ancestorsIds to structures',
  up: () => {
    Structures.find({})
      .fetch()
      .forEach((structure) => {
        Structures.update(
          { _id: structure._id },
          {
            $set: {
              childrenIds: structure.childrenIds || [],
              parentId: structure.parentId || null,
              ancestorsIds: structure.ancestorsIds || [],
            },
          },
        );
      });
  },
  down: () => {
    Structures.rawCollection().updateMany(
      {},
      { $unset: { childrenIds: 1, parentId: 1, ancestorsIds: 1 } },
      { multi: true },
    );
  },
});

Migrations.add({
  version: 25,
  name: 'Add introduction to structures',
  up: () => {
    Structures.find({})
      .fetch()
      .forEach((structure) => {
        const introduction = structure.introduction || defaultIntroduction;
        Structures.update({ _id: structure._id }, { $set: { introduction } });
      });
  },
  down: () => {
    Structures.rawCollection().updateMany({}, { $unset: { introduction: 1 } }, { multi: true });
  },
});

Migrations.add({
  version: 26,
  name: 'Add licence to articles',
  up: () => {
    Articles.find({})
      .fetch()
      .forEach((article) => {
        Articles.update({ _id: article._id }, { $set: { licence: '' } });
      });
  },
  down: () => {
    Articles.rawCollection().updateMany({}, { $unset: { licence: 1 } }, { multi: true });
  },
});

Migrations.add({
  version: 27,
  name: 'Add awaitingStructure to users',
  up: () => {
    // Add awaitingStructure prop to manage structure application validation
    Meteor.users.rawCollection().updateMany({}, { $set: { awaitingStructure: null } });
    // set initial value in appsettings (userStructureValidationMandatory)
    AppSettings.update({}, { $set: { userStructureValidationMandatory: false } });
  },
  down: () => {
    Meteor.users.rawCollection().updateMany({}, { $unset: { awaitingStructure: 1 } });
    AppSettings.rawCollection().updateMany({}, { $unset: { userStructureValidationMandatory: 1 } });
  },
});

Migrations.add({
  version: 28,
  name: 'Add general informations to appsettings',
  up: () => {
    AppSettings.update({}, { $set: { globalInfo: [] } });
  },
  down: () => {
    AppSettings.rawCollection().updateMany({}, { $unset: { globalInfo: 1 } });
  },
});

Migrations.add({
  version: 29,
  name: 'Add automatic group for structures',
  up: () => {
    let adminId = '';
    Structures.find({})
      .fetch()
      .forEach((structure) => {
        const strucName = `${structure._id}_${structure.name}`;
        Meteor.users
          .find({})
          .fetch()
          .every((user) => {
            if (Roles.userIsInRole(user._id, 'admin')) {
              adminId = user._id;
              return false;
            }
            return true;
          });
        const groupId = Groups.insert({
          name: strucName,
          type: 15,
          content: '',
          description: '',
          avatar: '',
          owner: adminId,
          animators: [],
          admins: [],
          active: true,
          plugins: {},
        });

        Structures.update({ _id: structure._id }, { $set: { groupId } });
      });

    Meteor.users
      .find({})
      .fetch()
      .forEach((user) => {
        const structure = Structures.findOne({ _id: user.structure });
        if (structure) {
          if (structure.groupId) {
            Groups.update(
              { _id: structure.groupId },
              {
                $push: { members: user._id },
              },
            );

            if (user.favGroups === undefined) {
              Meteor.users.update(user._id, {
                $set: { favGroups: [structure.groupId] },
              });
            } else if (user.favGroups.indexOf(structure.groupId) === -1) {
              Meteor.users.update(user._id, {
                $push: { favGroups: structure.groupId },
              });
            }

            Roles.addUsersToRoles(user._id, 'member', structure.groupId);

            addItem(user._id, { type: 'group', element_id: structure.groupId });

            if (Roles.userIsInRole(user._id, 'adminStructure', user.structure)) {
              Roles.addUsersToRoles(user._id, 'admin', structure.groupId);
              Groups.update(
                { _id: structure.groupId },
                {
                  $push: { admins: user._id },
                },
              );
            }
          }

          Structures.find({ _id: { $in: structure.ancestorsIds } })
            .fetch()
            .forEach((struc) => {
              if (struc.groupId) {
                Groups.update(
                  { _id: struc.groupId },
                  {
                    $push: { members: user._id },
                  },
                );

                if (user.favGroups === undefined) {
                  Meteor.users.update(user._id, {
                    $set: { favGroups: [struc.groupId] },
                  });
                } else if (user.favGroups.indexOf(struc.groupId) === -1) {
                  Meteor.users.update(user._id, {
                    $push: { favGroups: struc.groupId },
                  });
                }
                Roles.addUsersToRoles(user._id, 'member', struc.groupId);
                addItem(user._id, { type: 'group', element_id: struc.groupId });

                if (Roles.userIsInRole(user._id, 'adminStructure', user.structure)) {
                  Roles.addUsersToRoles(user._id, 'admin', struc.groupId);
                  Groups.update(
                    { _id: struc.groupId },
                    {
                      $push: { admins: user._id },
                    },
                  );
                }
              }
            });
        }
      });
  },
  down: () => {
    Meteor.users
      .find({})
      .fetch()
      .forEach((user) => {
        const structure = Structures.findOne({ _id: user.structure });
        if (structure) {
          if (structure.groupId) {
            if (user.favGroups.indexOf(structure.groupId) === -1) {
              Meteor.users.update(
                { _id: user._id },
                {
                  $pull: { favGroups: structure.groupId },
                },
              );

              PersonalSpaces.update(
                { userId: user._id },
                {
                  $pull: {
                    unsorted: { type: 'group', element_id: structure.groupId },
                    'sorted.$[].elements': { type: 'group', element_id: structure.groupId },
                  },
                },
              );

              if (Roles.userIsInRole(user._id, 'member', structure.groupId))
                Roles.removeUsersFromRoles(user._id, 'member', structure.groupId);
              if (Roles.userIsInRole(user._id, 'admin', structure.groupId)) {
                Roles.removeUsersFromRoles(user._id, 'admin', structure.groupId);
              }
            }
          }

          Structures.find({ _id: { $in: structure.ancestorsIds } })
            .fetch()
            .forEach((struc) => {
              if (struc.groupId) {
                if (user.favGroups.indexOf(struc.groupId) === -1) {
                  Meteor.users.update(
                    { _id: user._id },
                    {
                      $pull: { favGroups: struc.groupId },
                    },
                  );

                  PersonalSpaces.update(
                    { userId: user._id },
                    {
                      $pull: {
                        unsorted: { type: 'group', element_id: struc.groupId },
                        'sorted.$[].elements': { type: 'group', element_id: struc.groupId },
                      },
                    },
                  );

                  if (Roles.userIsInRole(user._id, 'member', struc.groupId))
                    Roles.removeUsersFromRoles(user._id, 'member', struc.groupId);
                  if (Roles.userIsInRole(user._id, 'admin', struc.groupId)) {
                    Roles.removeUsersFromRoles(user._id, 'admin', struc.groupId);
                  }
                }
              }
            });
        }
      });

    Structures.find({})
      .fetch()
      .forEach((structure) => {
        Groups.remove({ _id: structure.groupId });
        Structures.update({ _id: structure._id }, { $unset: { groupId: 1 } });
      });
  },
});
