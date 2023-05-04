import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { useEffect } from 'react';
import i18n from 'meteor/universe:i18n';
import Structures from './structures';
import { useAppContext } from '../../ui/contexts/context';
import { getCurrentIntroduction } from '../utils';
import { useMethod } from '../../ui/utils/hooks/hooks.meteor';

export const useStructureCall = (_id = '') => {
  const [
    {
      user: { structure },
    },
  ] = useAppContext();

  const [call, { loading, result, error }] = useMethod('structures.getOneStructure');

  useEffect(() => {
    call({ _id: _id || structure });
  }, [structure, _id]);

  return { loading, structure: result, error };
};

export const useAdminSelectedStructureCall = ({
  /** Should be a state */
  selectedStructureId,
  /** Trigger all the structures or not */
  allStructures = false,
}) => {
  const [call, { loading, result, error }] = useMethod('structures.getStructureAndAllChilds');
  useEffect(() => {
    call({
      structureId: selectedStructureId,
      allStructures,
    });
  }, [allStructures, selectedStructureId]);

  return { loading, structures: result, error };
};

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

export const getStructure = (_id) => Structures.findOne({ _id }) || {};

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
  /** Trigger all the structures or not */
  isStructureAdminMode = true,
}) => {
  const subName = !isStructureAdminMode ? 'structures.all' : 'structures.with.all.childs';

  // Grab current user structure
  const currentUserStructure = useStructure();

  // Use this as a starting point and update it when user change structure
  useEffect(() => {
    if (currentUserStructure && currentUserStructure._id && isStructureAdminMode)
      setSelectedStructureId(currentUserStructure._id);
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

export const useStructuresOfUserWithIntroductions = () => {
  const [{ structure }] = useAppContext();
  /**
   * - Grab current user structure with the ancestors
   *
   * - This is used to get all services from top level to current one
   */
  const currentStructureWithAncestors = [];

  if (structure && structure._id) {
    currentStructureWithAncestors.push(structure._id, ...structure.ancestorsIds);
  }
  return useTracker(() => {
    const handle = Meteor.subscribe('structures.ids', { ids: currentStructureWithAncestors });
    const loading = !handle.ready();
    const data = Structures.find({ _id: { $in: currentStructureWithAncestors } }, { sort: { name: 1 } }).fetch();

    const parsedData = data.map((struct) => {
      const indexOfStructure = currentStructureWithAncestors.indexOf(struct._id);
      const introduction = getCurrentIntroduction({ introduction: struct.introduction });
      const introductionTitle =
        introduction.title || `${i18n.__('pages.IntroductionPage.informationsOf')} ${struct.name}`;
      const introductionContent = introduction.content || null;

      return {
        ...struct,
        introduction: {
          ...introduction,
          title: introductionTitle,
          content: introductionContent,
        },
        level: indexOfStructure,
      };
    });

    const sortedData = parsedData.sort((a, b) => a.level - b.level);

    return {
      data: sortedData,
      loading,
    };
  });
};

export const useAwaitingStructure = () => {
  const [
    {
      user: { awaitingStructure },
    },
  ] = useAppContext();
  return useTracker(() => {
    const handle = Meteor.subscribe('structures.one', { _id: awaitingStructure });
    const data = Structures.findOne({ _id: awaitingStructure });

    return { awaitingStructure: data, ready: handle.ready() };
  }, [awaitingStructure]);
};
