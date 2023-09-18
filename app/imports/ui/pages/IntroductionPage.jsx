import React, { useEffect, useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import i18n from 'meteor/universe:i18n';
// eslint-disable-next-line no-restricted-imports
import { Paper, Typography } from '@mui/material';

import { useAppContext } from '../contexts/context';

export const IntroductionPage = () => {
  const [messages, setMessages] = useState([]);
  const [{ isMobile, language }] = useAppContext();

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
              flexDirection: 'column',
              width: isMobile ? '80vw' : '60vw',
              marginBottom: '1vh',
              padding: '1vh 2vw',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '20px',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  // minWidth: '5.5vw',
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
            </div>
            {/* <p style={{ textAlign: 'end', height: '1vh' }}>Crée le : {message?.createdAt?.toLocaleDateString()}</p> */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {message?.structureId?.length ? (
                <Typography variant="subtitle1">
                  {i18n.__('pages.IntroductionPage.structureMessage', { structure: message.structureName })}
                </Typography>
              ) : null}
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(message?.content) }} />
            </div>
          </Paper>
        ))}
    </div>
  );
};

export default IntroductionPage;
