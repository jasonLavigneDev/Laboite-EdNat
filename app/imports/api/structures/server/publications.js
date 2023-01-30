import { Meteor } from 'meteor/meteor';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { isActive } from '../../utils';
import Structures from '../structures';

// publish all structures
Meteor.publish('structures.all', function structuresAll() {
  // if (!isActive(this.userId)) {
  //   return this.ready();
  // }
  return Structures.find({}, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 });
});

// publish user  structure
Meteor.publish('structures.one', function structuresOne({ _id } = { _id: null }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const user = Meteor.users.findOne({ _id: this.userId });
  return Structures.find(
    { _id: _id || user.structure },
    { fields: Structures.publicFields, sort: { name: 1 }, limit: 1 },
  );
});

Meteor.publish('structures.publishers', function structuresAll() {
  // returns all structures whose users have at least 1 publication
  const structIds = Meteor.users
    .find({ articlesCount: { $gt: 0 } }, { fields: { structure: 1 } })
    .fetch()
    .map((user) => user.structure);
  return Structures.find(
    { _id: { $in: structIds } },
    { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 },
  );
});

// publish structures from a list ids
Meteor.publish('structures.ids', function structuresids({ ids } = { ids: [] }) {
  return Structures.find({ _id: { $in: ids } }, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 });
});

FindFromPublication.publish(
  'structures.top.with.childs',
  function structuresTopWithChilds(
    { parentIds, searchText, getTopLevelStructures } = { parentIds: [], searchText: '', getTopLevelStructures: true },
  ) {
    if (!isActive(this.userId)) {
      return this.ready();
    }

    const query = {};

    if (searchText.length > 2) {
      const regex = new RegExp(searchText, 'i');
      const searchResult = Structures.find({ name: { $regex: regex } }).fetch();

      const ids = searchResult.reduce((acc, struct) => {
        acc.push(...struct.ancestorsIds, struct._id, ...struct.childrenIds);
        return acc;
      }, []);
      query._id = { $in: ids };
    } else {
      query.$or = getTopLevelStructures
        ? [{ parentId: null }, { parentId: { $in: parentIds } }]
        : [{ parentId: { $in: parentIds } }];
    }

    return Structures.find(query, {
      fields: Structures.publicFields,
      sort: { name: 1 },
      limit: 10000,
    });
  },
);

FindFromPublication.publish(
  'structures.top.with.direct.parent',
  function structuresTopWithDirectParent({ searchText } = { searchText: '' }) {
    if (!isActive(this.userId)) {
      return this.ready();
    }

    const regex = new RegExp(searchText, 'i');
    const searchResult = Structures.find({ name: { $regex: regex } }).fetch();

    const ids = searchResult.reduce((acc, struct) => {
      acc.push(struct._id);
      if (struct.parentId) acc.push(struct.parentId);
      return acc;
    }, []);

    const query = { _id: { $in: ids } };

    return Structures.find(query, {
      fields: Structures.publicFields,
      sort: { _id: 1 },
    });
  },
);

FindFromPublication.publish('structures.with.all.childs', function structuresWithAllChilds({ structureId }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }

  return Structures.find(
    { $or: [{ ancestorsIds: structureId || '' }, { _id: structureId || '' }] },
    {
      fields: Structures.publicFields,
      sort: { name: 1 },
      limit: 10000,
    },
  );
});
