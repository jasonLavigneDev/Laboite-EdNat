import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Button, Input, InputLabel, Typography, Select, MenuItem, FormControl } from '@mui/material';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import { useAppContext } from '../contexts/context';
import { CustomToolbarArticle } from '../components/system/CustomQuill';
import { quillOptions } from '../components/admin/InfoEditionComponent';

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

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  const handleChange = (e) => {
    setLanguage(e.target.value);
  };

  console.log('language', language);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '50%', gap: '1vh' }}>
      <Typography variant="h5">{title}</Typography>
      <form style={{ display: 'flex', gap: '1vh', flexDirection: 'column' }}>
        <div>
          <CustomToolbarArticle />
          <ReactQuill
            id="content"
            value={content || ''}
            onChange={onUpdateRichText}
            {...quillOptions}
            style={{ height: '20vh' }}
          />
        </div>

        <Typography variant="h6">date d expiration</Typography>
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
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Language</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={language}
            label="language"
            placeholder="language"
            onChange={handleChange}
          >
            <MenuItem value="fr">fr</MenuItem>
            <MenuItem value="en">en</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleSubmit} style={{ width: '10vw', marginTop: '2vh' }}>
          {action}
        </Button>
      </form>
    </div>
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

export const ListOfMessages = ({ messages, deleteMessage, selectMessageLanguage, selectMessageToUpdate, user }) => {
  const handleChangeMessageLanguage = (e) => {
    selectMessageLanguage(e.target.value);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: user ? '' : '70vh',
        overflow: user ? 'hidden' : 'scroll',
        overflowX: 'hidden',
        gap: '1vh',
        width: user ? '80%' : '40%',
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">langue des messages</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="language"
          onChange={handleChangeMessageLanguage}
        >
          <MenuItem value="all">all</MenuItem>
          <MenuItem value="fr">fr</MenuItem>
          <MenuItem value="en">en</MenuItem>
        </Select>
      </FormControl>

      {messages?.map((message) => (
        <Paper
          key={message._id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: user ? '60vw' : '30vw',
            marginBottom: '1vh',
            padding: '2vh 2vw',
            border: '1px solid rgba(0,0,0,0.2)',
            borderBottom: 'unset',
            borderRadius: '20px',
          }}
        >
          <p style={{ height: '1vh' }}>Crée le : {message?.createdAt?.toLocaleDateString()}</p>
          <p style={{ height: '1vh' }}>Mis a jour le : {message?.updatedAt?.toLocaleDateString()}</p>

          <p>Expire le : {message?.expirationDate?.toLocaleDateString()}</p>
          <p>Langue du message : {message?.language}</p>
          <Chip style={{ width: '30%' }} label="Ma super structure" color="primary" />
          <p>Message : {message?.content}</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="button" onClick={() => selectMessageToUpdate(message._id)}>
              Modifier le message
            </Button>
            <Button type="button" onClick={() => deleteMessage(message._id)}>
              Supprimer le message
            </Button>
          </div>
        </Paper>
      ))}
    </div>
  );
};

ListOfMessages.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.string),
  deleteMessage: PropTypes.func,
  selectMessageToUpdate: PropTypes.func,
  selectMessageLanguage: PropTypes.string,
  user: PropTypes.bool,
};

ListOfMessages.defaultProps = {
  messages: undefined,
  deleteMessage: undefined,
  selectMessageLanguage: undefined,
  selectMessageToUpdate: undefined,
  user: false,
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1vh' }}>
      <ListOfMessages
        messages={messages}
        deleteMessage={deleteMessage}
        selectMessageLanguage={selectMessageLanguage}
        selectMessageToUpdate={selectMessageToUpdate}
        user
      />
    </div>
  );
};

export default GlobalInfoTest;
