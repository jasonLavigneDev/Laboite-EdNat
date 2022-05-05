import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { useEffect } from 'react';
import Structures from './structures';
import { useAppContext } from '../../ui/contexts/context';

export const useStructure = (_id) => {
  const [
    {
      user: { structure },
    },
  ] = useAppContext();
  return useTracker(() => {
    Meteor.subscribe('structures.one', { _id: _id || structure });
    return Structures.findOne({ _id: _id || structure }) || {};
  }, [structure]);
};

export const getStructure = (_id) => Structures.findOne({ _id });

/**
 * - Hook used to manage a selected structure
 *
 * - Use cases are mainly to be used with `<StructureSelect />` component
 */
export const useAdminSelectedStructure = ({
  /** Should be a state */
  selectedStructureId,
  /** Should be the state mutato */
  setSelectedStructureId,
}) => {
  const subName = 'structures.with.all.childs';

  // Grab current user structure
  const currentUserStructure = useStructure();

  // Use this as a starting point and update it when user change structure
  useEffect(() => {
    if (currentUserStructure && currentUserStructure._id) setSelectedStructureId(currentUserStructure._id);
  }, [currentUserStructure]);

  return useTracker(() => {
    const selectedStructure = getStructure(selectedStructureId);

    const handle = Meteor.subscribe(subName, { structureId: currentUserStructure ? currentUserStructure._id : '' });
    const loading = !handle.ready();
    const data = Structures.findFromPublication(subName).fetch();

    return {
      selectedStructure,
      loading,
      structures: data,
    };
  }, [selectedStructureId]);
};
