import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/context';
import Spinner from './Spinner';
import CardMessage from './CardMessage';

const AwaitingStructureMessage = () => {
  const [{ user, loadingUser }] = useAppContext();
  if (loadingUser) return <Spinner />;

  const [structure, setStructure] = useState({});

  useEffect(() => {
    Meteor.call('structures.getOneStructure', { structureId: user.awaitingStructure }, (err, res) => {
      if (res) {
        setStructure(res);
      }
    });
  }, [user]);

  return (
    <>
      {loadingUser && structure ? (
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
