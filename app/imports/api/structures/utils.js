import { useTracker } from 'meteor/react-meteor-data';
import Structures from './structures';
import { useAppContext } from '../../ui/contexts/context';

export const useStructure = () => {
  const [
    {
      user: { structure },
    },
  ] = useAppContext();
  return useTracker(() => {
    Meteor.subscribe('structures.one');
    return Structures.findOne({ _id: structure });
  }, [structure]);
};

export const getStructure = (_id) => Structures.findOne({ _id });
