import React from 'react';
import { useAppContext } from '../../contexts/context';
import Spinner from './Spinner';
import CardMessage from './CardMessage';
import { useStructure } from '../../../api/structures/hooks';

const AwaitingStructureMessage = () => {
  const [{ user, loadingUser }] = useAppContext();
  const structure = useStructure(user.awaitingStructure);
  return (
    <>
      {loadingUser && structure !== undefined ? (
        <Spinner />
      ) : (
        <CardMessage
          title="components.AwaitingStructureMessage.waitingForStructure"
          subtitle="components.AwaitingStructureMessage.structureName"
          subtitleData={structure}
        />
      )}
    </>
  );
};

export default AwaitingStructureMessage;
