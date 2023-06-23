import React, { useEffect, useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import i18n from 'meteor/universe:i18n';
// eslint-disable-next-line no-restricted-imports
import { Chip, Paper } from '@mui/material';

import { useAppContext } from '../contexts/context';

export const NewIntroductionPage = () => {
  const [messages, setMessages] = useState([]);
  const [{ language }] = useAppContext();

  useEffect(() => {
    Meteor.call('globalInfos.getGlobalInfoByLanguageAndNotExpired', { language, date: new Date() }, (error, res) => {
      if (!error) return setMessages(res);
      return console.log('error', error);
    });
  }, []);

  if (!messages.length) return <p>{i18n.__('components.AdminMesssage.no_message')}</p>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxHeight: '',
        overflow: 'hidden',
        overflowX: 'hidden',
        gap: '1vh',
      }}
    >
      {messages
        ?.sort((a, b) => b.updatedAt - a.updatedAt)
        .map((message) => (
          <Paper
            key={message._id}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '60vw',
              marginBottom: '1vh',
              padding: '1vh 2vw',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '20px',
              justifyContent: 'space-between',
            }}
          >
            {/* <p style={{ textAlign: 'end', height: '1vh' }}>Crée le : {message?.createdAt?.toLocaleDateString()}</p> */}
            {message.structureId.length ? (
              <Chip style={{ width: '40%' }} label="Ma super structure" color="primary" />
            ) : null}
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(message?.content) }} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: '5.5vw',
                border: '2px solid blue',
                borderRadius: '15px',
                padding: '1vh 1vw',
                maxHeight: '5vh',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span>{message?.updatedAt?.toLocaleDateString()}</span>
            </div>
          </Paper>
        ))}
    </div>
  );
};

export default NewIntroductionPage;
