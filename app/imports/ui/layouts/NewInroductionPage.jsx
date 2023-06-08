import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Button, Input, Typography } from '@mui/material';

import { useAppContext } from '../contexts/context';

import { AdminMessagesList } from '../components/admin/AdminMessagesList';

export const OnlyForTestRedirect = () => {
  const [{ user }] = useAppContext();

  const [userDateOfLastMessage, setUserDateOfLastMessage] = useState();

  const modifyLastMessageRead = () => {
    Meteor.call('users.setLastGlobalInfoRead', { lastGlobalInfoReadDate: new Date(userDateOfLastMessage) });
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', margin: '2vh', gap: '2vh' }}
    >
      <Typography>INFOS USER : dernier message lu : {user?.lastGlobalInfoReadDate?.toLocaleDateString()}</Typography>
      <Typography>Definir la date du dernier message lu</Typography>
      <Input
        type="date"
        name=""
        id=""
        value={userDateOfLastMessage}
        onChange={(e) => setUserDateOfLastMessage(e.target.value)}
      />
      <Button style={{ height: '30px' }} type="button" onClick={modifyLastMessageRead}>
        Definir la date du dernier message lu
      </Button>
    </div>
  );
};

export const NewIntroductionPage = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    Meteor.call('globalInfos.getAllGlobalInfo', {}, (error, res) => {
      if (!error) return setMessages(res);
      return console.log('error', error);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1vh' }}>
      <AdminMessagesList messages={messages} user isNotInAdminPanel />
    </div>
  );
};

export default NewIntroductionPage;
