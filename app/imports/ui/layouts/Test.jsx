import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { useAppContext } from '../contexts/context';

export const GlobalInfoTest = () => {
  const [messages, setMessages] = useState([]);
  const [{ language }] = useAppContext();

  const createMessage = () => {
    const newMessage = {
      language,
      content: 'test 3',
      expirationDays: '10',
    };

    Meteor.call('globalInfos.createGlobalInfo', { ...newMessage }, (error, res) => {
      if (error) {
        console.log('error', error);
        return;
      }
      console.log('create success');
      const oldMessages = [...messages];
      oldMessages.push(res);
      setMessages(oldMessages);
    });
  };

  const getAllMessagesInUserLanguage = () => {
    Meteor.call('globalInfos.getAllGlobalInfoByLanguage', { language }, (error, res) => {
      if (error) {
        console.log('error', error);
        return;
      }
      setMessages(res);
    });
  };

  const getMessageNotExpiredInUserLanguage = () => {
    const test = new Date('2023-05-18T09:57:55.632+00:00');

    Meteor.call('globalInfos.getGlobalInfoByLanguageAndNotExpired', { language, date: test }, (error, res) => {
      if (error) {
        console.log('error', error);
        return;
      }
      setMessages(res);
    });
  };

  const deleteMessage = (messageId) => {
    Meteor.call('globalInfos.deleteGlobalInfo', { messageId }, (error) => {
      if (error) {
        console.log('error', error);
      }
      const test = messages.filter((message) => message._id !== messageId);
      setMessages(test);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '2vh' }}>
        <button style={{ height: '30px' }} type="button" onClick={createMessage}>
          Creer un fake message
        </button>
        <button style={{ height: '30px' }} type="button" onClick={getAllMessagesInUserLanguage}>
          Recuperez tous les messages ( langue navigateur )
        </button>
        <button style={{ height: '30px' }} type="button" onClick={getMessageNotExpiredInUserLanguage}>
          Recuperer les messages dans le langage navigateur et non expiré
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '99vw',
        }}
      >
        <h1>Liste des messages en base</h1>
        {messages.map((info) => (
          <Paper
            key={info._id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '80%',
              alignItems: 'start',
              marginBottom: '1vh',
              padding: '2vh 10vw',
            }}
          >
            <p style={{ height: '1vh' }}>Crée le : {info.createdAt.toLocaleDateString()}</p>
            <p>Expire le :{info.expirationDate.toLocaleDateString()}</p>
            <Chip label="Ma super structure" color="primary" />
            <p>Message : {info.content}</p>
            <div style={{ display: 'flex', alignSelf: 'center', justifyContent: 'space-between', width: '30%' }}>
              <button style={{ height: '30px' }} type="button">
                Modifier le message
              </button>
              <button style={{ height: '30px' }} type="button" onClick={() => deleteMessage(info._id)}>
                Supprimer le message
              </button>
            </div>
          </Paper>
        ))}
      </div>
    </div>
  );
};

export default GlobalInfoTest;
