import React from 'react';
import i18n from 'meteor/universe:i18n';
import Modal from '@mui/material/Modal';
import PropTypes from 'prop-types';
import NotificationModalForm from '../notifications/NotificationModalForm';

const SendGroupNotification = ({ groupId, open, onClose }) => {
  const handleSubmit = (notif) => {
    Meteor.call(
      'notifications.createNotificationForGroup',
      {
        data: { ...notif, groupId },
      },
      (error) => {
        if (error) {
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <NotificationModalForm
          formTitle={i18n.__('components.SendGroupNotification.title')}
          onClose={onClose}
          allowTypeList={false}
          submit={handleSubmit}
        />
      </>
    </Modal>
  );
};

SendGroupNotification.propTypes = {
  groupId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SendGroupNotification;
