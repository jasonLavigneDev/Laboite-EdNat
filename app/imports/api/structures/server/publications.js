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
Meteor.publish('structures.one', function structuresOne() {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  const user = Meteor.users.findOne({ _id: this.userId });
  return Structures.find({ _id: user.structure }, { fields: Structures.publicFields, sort: { name: 1 }, limit: 1 });
});

// publish structures from a list ids
Meteor.publish('structures.ids', function structuresids({ ids } = { ids: [] }) {
  // if (!isActive(this.userId)) {
  //   return this.ready();
  // }
  return Structures.find({ _id: { $in: ids } }, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 });
});

// publish top level structure and possibly childs
FindFromPublication.publish(
  'structures.top.with.childs',
  function structuresTopWithChilds({ parentIds, searchText } = { parentIds: [], searchText: '' }) {
    if (!isActive(this.userId)) {
      return this.ready();
    }

    const query = {};

    if (searchText.length > 2) {
      const regex = new RegExp(searchText, 'i');
      const searchResult = Structures.find({ name: { $regex: regex } }).fetch();

      const ids = searchResult.reduce((acc, struct) => {
        acc.push(...struct.ancestorsIds, struct._id);
        return acc;
      }, []);

      searchResult.forEach((res) => ids.push(...res.ancestorsIds, res._id, ...res.childrenIds));
      query._id = { $in: ids };
    } else {
      query.$or = [{ parentId: null }, { parentId: { $in: parentIds } }];
    }

    return Structures.find(query, {
      fields: Structures.publicFields,
      sort: { name: 1 },
      limit: 10000,
    });
  },
);
