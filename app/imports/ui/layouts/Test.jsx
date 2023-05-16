import React, { useState } from 'react';
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
      <div>
        <h1>Liste des messages en base</h1>
        {messages.map((info) => (
          <div key={info._id} style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <p>Crée le : {info.createdAt.toLocaleDateString()}</p>
            <p>Message : {info.content}</p>
            <p>Expire le :{info.expirationDate.toLocaleDateString()}</p>
            <button style={{ height: '30px' }} type="button">
              Modifier le message
            </button>
            <button style={{ height: '30px' }} type="button" onClick={() => deleteMessage(info._id)}>
              Supprimer le message
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalInfoTest;
