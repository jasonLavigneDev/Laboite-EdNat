import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Button, Input, InputLabel, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useAppContext } from '../contexts/context';

export const OnlyForTestRedirect = () => {
  const [{ user }] = useAppContext();

  const [userDateOfLastMessage, setUserDateOfLastMessage] = useState();

  const modifyLastMessageRead = () => {
    Meteor.call('users.setLastGlobalInfoRead', { lastGlobalInfoReadDate: new Date(userDateOfLastMessage) });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '2vh' }}>
      <Typography>INFOS USER : dernier message lu : {user?.lastGlobalInfoReadDate?.toLocaleDateString()}</Typography>
      <div>
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
    </div>
  );
};

export const MessageForm = ({ createMessage, initialMessage, isOnUpdateMessage, updateMessage }) => {
  const today = new Date();
  const defaultDaysOfValidity = 10;
  const defaultExpiration = new Date(today.setDate(today.getDate() + defaultDaysOfValidity));

  const [content, setContent] = useState();
  const [expirationDate, setExpirationDate] = useState();
  const [language, setLanguage] = useState();
  const title = isOnUpdateMessage ? 'MODIFIER MESSAGE' : 'CREER MESSAGE';
  const action = isOnUpdateMessage ? 'MODIFIER' : 'CREER ';

  useEffect(() => {
    setContent(initialMessage?.content || '');
    setExpirationDate(initialMessage?.expirationDate || defaultExpiration);
    setLanguage(initialMessage?.language || 'fr');
  }, [initialMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isOnUpdateMessage) {
      const updatedMessage = { ...initialMessage, content, expirationDate, language };
      updateMessage(updatedMessage);
    } else {
      const newMessage = {
        language,
        content,
        expirationDate: new Date(expirationDate),
      };
      createMessage(newMessage);
    }
    setLanguage('fr');
    setContent('');
    setExpirationDate(defaultExpiration);
  };

  return (
    <>
      <h1>{title}</h1>
      <form>
        <InputLabel htmlFor="newMessage">texte du message</InputLabel>
        <TextField id="newMessage" value={content} onChange={(e) => setContent(e.target.value)} name="newMessage" />
        <InputLabel htmlFor="expirationDate">date d expiration</InputLabel>
        <Input
          type="date"
          name=""
          id=""
          value={expirationDate}
          onChange={(e) => {
            console.log(e.target.value);
            setExpirationDate(e.target.value);
          }}
        />
        <InputLabel htmlFor="lang">language</InputLabel>
        <select name="language" id="" onChange={(e) => setLanguage(e.target.value)}>
          <option selected={language === 'fr'} value="fr">
            fr
          </option>
          <option selected={language === 'en'} value="en">
            en
          </option>
        </select>
        <Button type="button" onClick={handleSubmit}>
          {action}
        </Button>
      </form>
    </>
  );
};

MessageForm.propTypes = {
  createMessage: PropTypes.func,
  updateMessage: PropTypes.func,
  isOnUpdateMessage: PropTypes.bool,
  initialMessage: PropTypes.object,
};

MessageForm.defaultProps = {
  createMessage: undefined,
  updateMessage: PropTypes.func,
  isOnUpdateMessage: false,
  initialMessage: {
    content: '',
    expirationDate: undefined,
    language: 'fr',
  },
};

export const ListOfMessages = ({ messages, deleteMessage, selectMessageLanguage, selectMessageToUpdate }) => {
  return (
    <>
      <h1>Liste des messages en base</h1>
      <InputLabel htmlFor="lang">langue des messages</InputLabel>
      <select name="language" id="" onChange={(e) => selectMessageLanguage(e.target.value)}>
        <option value="all">all</option>
        <option value="fr">fr</option>
        <option value="en">en</option>
      </select>

      {messages?.map((message) => (
        <Paper
          key={message._id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '80%',
            alignItems: 'start',
            marginBottom: '1vh',
            padding: '2vh 10vw',
          }}
        >
          <p style={{ height: '1vh' }}>Crée le : {message?.createdAt?.toLocaleDateString()}</p>
          <p style={{ height: '1vh' }}>Mis a jour le : {message?.updatedAt?.toLocaleDateString()}</p>

          <p>Expire le : {message?.expirationDate?.toLocaleDateString()}</p>
          <p>Langue du message : {message?.language}</p>
          <Chip label="Ma super structure" color="primary" />
          <p>Message : {message?.content}</p>
          <div style={{ display: 'flex', alignSelf: 'center', justifyContent: 'space-between', width: '80%' }}>
            <Button type="button" onClick={() => selectMessageToUpdate(message._id)}>
              Modifier le message
            </Button>
            <Button type="button" onClick={() => deleteMessage(message._id)}>
              Supprimer le message
            </Button>
          </div>
        </Paper>
      ))}
    </>
  );
};

ListOfMessages.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.string),
  deleteMessage: PropTypes.func,
  selectMessageToUpdate: PropTypes.func,
  selectMessageLanguage: PropTypes.string,
};

ListOfMessages.defaultProps = {
  messages: undefined,
  deleteMessage: undefined,
  selectMessageLanguage: undefined,
  selectMessageToUpdate: undefined,
};

export const GlobalInfoTest = () => {
  // const [{ user }] = useAppContext();
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>
        <OnlyForTestRedirect />
      </div>
      <h1 style={{ textAlign: 'center' }}>ADMIN PANNEL</h1>
      <MessageForm
        createMessage={createMessage}
        initialMessage={keysOfMessageToUpdate}
        isOnUpdateMessage={isOnUpdateMessage}
        updateMessage={updateMessage}
      />
      <ListOfMessages
        messages={messages}
        deleteMessage={deleteMessage}
        selectMessageLanguage={selectMessageLanguage}
        selectMessageToUpdate={selectMessageToUpdate}
      />
    </div>
  );
};

export default GlobalInfoTest;
