import React, { useEffect, useState } from 'react';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { ListOfMessages, MessageForm } from '../../layouts/Test';

const AdminGlobalInfos = () => {
  const [messages, setMessages] = useState([]);
  const [messageToUpdate, setMessageToUpdate] = useState();
  const [isOnUpdateMessage, setIsOnUpdateMessage] = useState(false);

  const keysOfMessageToUpdate = {
    content: messageToUpdate?.content,
    language: messageToUpdate?.language,
    expirationDate: messageToUpdate?.expirationDate?.toISOString().slice(0, 10),
  };

  useEffect(() => {
    Meteor.call('globalInfos.getAllGlobalInfo', {}, (error, res) => {
      if (!error) return setMessages(res);
      return console.log('error', error);
    });
  }, []);

  const selectMessageLanguage = (language) => {
    if (language === 'all') {
      Meteor.call('globalInfos.getAllGlobalInfo', {}, (error, res) => {
        if (!error) setMessages(res);
      });
    } else {
      Meteor.call('globalInfos.getAllGlobalInfoByLanguage', { language }, (error, res) => {
        if (!error) setMessages(res);
      });
    }
  };

  const createMessage = (newMessage) => {
    Meteor.call('globalInfos.createGlobalInfo', { ...newMessage }, (error, res) => {
      if (!error) return setMessages([...messages, res]);
      return console.log('error', error);
    });
  };

  const deleteMessage = (messageId) => {
    Meteor.call('globalInfos.deleteGlobalInfo', { messageId }, (error) => {
      if (!error) {
        const restMessages = messages.filter((message) => message._id !== messageId);
        return setMessages(restMessages);
      }
      return console.log('error', error);
    });
  };

  const updateMessage = (updatedMessage) => {
    const messageUpdated = {
      ...messageToUpdate,
      content: updatedMessage.content,
      language: updatedMessage.language,
      expirationDate: new Date(updatedMessage.expirationDate),
    };

    Meteor.call(
      'globalInfos.updateGlobalInfo',
      {
        id: messageUpdated._id,
        content: messageUpdated.content,
        language: messageUpdated.language,
        expirationDate: messageUpdated.expirationDate,
      },
      (error, res) => {
        if (!error) {
          const newListOfMessage = messages.map((message) => (message._id === res._id ? res : message));
          return setMessages(newListOfMessage);
        }
        return console.log('error', error);
      },
    );

    setMessageToUpdate({});
    setIsOnUpdateMessage(false);
  };

  const selectMessageToUpdate = (messageId) => {
    const messageOnUpdate = messages.find((message) => message._id === messageId);
    setMessageToUpdate(messageOnUpdate);
    setIsOnUpdateMessage(true);
  };

  return (
    <Paper
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: '2vh 2vw',
        margin: '0 5vw',
        justifyContent: 'space-between',
      }}
    >
      <MessageForm
        createMessage={createMessage}
        initialMessage={keysOfMessageToUpdate}
        isOnUpdateMessage={isOnUpdateMessage}
        updateMessage={updateMessage}
      />
      <Divider orientation="vertical" flexItem />
      <ListOfMessages
        messages={messages}
        deleteMessage={deleteMessage}
        selectMessageLanguage={selectMessageLanguage}
        selectMessageToUpdate={selectMessageToUpdate}
      />
    </Paper>
  );
};

export default AdminGlobalInfos;
