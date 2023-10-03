import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import AddBox from '@mui/icons-material/AddBox';
import Button from '@mui/material/Button';

import { AdminMessageForm } from '../../components/admin/AdminMessagesForm';
import { AdminMessagesList } from '../../components/admin/AdminMessagesList';

const AdminGlobalInfos = ({ structure = false }) => {
  const [messages, setMessages] = useState([]);
  const [messageToUpdate, setMessageToUpdate] = useState();
  const [isOnUpdateMessage, setIsOnUpdateMessage] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const keysOfMessageToUpdate = {
    content: messageToUpdate?.content,
    language: messageToUpdate?.language,
    expirationDate: messageToUpdate?.expirationDate?.toISOString().slice(0, 10),
  };

  useEffect(() => {
    Meteor.call('globalInfos.getAllGlobalInfo', { structure }, (error, res) => {
      if (!error) return setMessages(res);
      return console.log('error', error);
    });
  }, []);
  const selectMessageLanguage = (language) => {
    if (language === 'all') {
      Meteor.call('globalInfos.getAllGlobalInfo', { structure }, (error, res) => {
        if (!error) setMessages(res);
      });
    } else {
      Meteor.call('globalInfos.getAllGlobalInfoByLanguage', { language, structure }, (error, res) => {
        if (!error) setMessages(res);
      });
    }
  };

  const createMessage = (newMessage) => {
    Meteor.call('globalInfos.createGlobalInfo', { ...newMessage, structure }, (error, res) => {
      if (!error) return setMessages([...messages, res]);
      return console.log('error', error);
    });
  };

  const deleteMessage = (messageId) => {
    Meteor.call('globalInfos.deleteGlobalInfo', { messageId }, (error) => {
      if (!error) {
        const restMessages = messages.filter((message) => message._id !== messageId);
        msg.success('Message supprimé');
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
    setOpenModal(true);
    const messageOnUpdate = messages.find((message) => message._id === messageId);
    setMessageToUpdate(messageOnUpdate);
    setIsOnUpdateMessage(true);
  };

  const closeModal = () => {
    setMessageToUpdate({});
    setOpenModal(false);
    setIsOnUpdateMessage(false);
  };

  return (
    <Paper
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '2vh 2vw',
        margin: '0 5vw',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4">
          {i18n.__(structure ? 'pages.AdminGlobalInfos.titleStructure' : 'pages.AdminGlobalInfos.title')}
        </Typography>
      </div>
      <Button onClick={() => setOpenModal(!openModal)} startIcon={<AddBox />}>
        {i18n.__('pages.AdminGlobalInfos.createButton')}
      </Button>
      <AdminMessagesList
        messages={messages}
        deleteMessage={deleteMessage}
        selectMessageLanguage={selectMessageLanguage}
        selectMessageToUpdate={selectMessageToUpdate}
      />
      <Modal
        open={openModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ display: 'flex' }}>
          <AdminMessageForm
            createMessage={createMessage}
            initialMessage={keysOfMessageToUpdate}
            isOnUpdateMessage={isOnUpdateMessage}
            updateMessage={updateMessage}
            closeModal={closeModal}
          />
        </Paper>
      </Modal>
    </Paper>
  );
};

AdminGlobalInfos.propTypes = {
  structure: PropTypes.bool,
};

AdminGlobalInfos.defaultProps = {
  structure: false,
};

export default AdminGlobalInfos;
