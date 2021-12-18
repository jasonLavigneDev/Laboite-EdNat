import Structures from '../structures/structures';

export const getStructureIds = () => {
  return Structures.find({}, { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 })
    .fetch()
    .map((s) => s._id);
};

export const structureOptions = Structures.find(
  {},
  { fields: Structures.publicFields, sort: { name: 1 }, limit: 10000 },
)
  .fetch()
  .map((opt) => ({
    value: opt.name,
    label: opt.name,
  }));
