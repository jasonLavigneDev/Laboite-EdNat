import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Button, Chip, Input, Paper, Typography } from '@mui/material';
import sanitizeHtml from 'sanitize-html';

import { useAppContext } from '../contexts/context';

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
  const [{ language }] = useAppContext();

  useEffect(() => {
    Meteor.call('globalInfos.getGlobalInfoByLanguageAndNotExpired', { language, date: new Date() }, (error, res) => {
      if (!error) return setMessages(res);
      return console.log('error', error);
    });
  }, []);

  if (!messages.length) return <p>Aucun message.</p>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '',
        overflow: 'hidden',
        overflowX: 'hidden',
        gap: '1vh',
        width: '80%',
      }}
    >
      {messages
        ?.sort((a, b) => b.updatedAt - a.updatedAt)
        .map((message) => (
          <Paper
            key={message._id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '60vw',
              marginBottom: '1vh',
              padding: '1vh 2vw',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '20px',
            }}
          >
            <p style={{ textAlign: 'end', height: '1vh' }}>Crée le : {message?.createdAt?.toLocaleDateString()}</p>
            {message.structureId.length ? (
              <Chip style={{ width: '40%' }} label="Ma super structure" color="primary" />
            ) : null}
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(message?.content) }} />
          </Paper>
        ))}
    </div>
  );
};

export default NewIntroductionPage;
