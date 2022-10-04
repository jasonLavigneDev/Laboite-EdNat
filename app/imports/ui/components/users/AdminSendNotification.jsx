import React from 'react';
import i18n from 'meteor/universe:i18n';
import Modal from '@mui/material/Modal';
import PropTypes from 'prop-types';
import { createNotification } from '../../../api/notifications/methods';
import NotificationModalForm from '../notifications/NotificationModalForm';

const AdminSendNotification = ({ data, open, onClose, allowTypeList }) => {
  const handleSubmit = (notif) => {
    createNotification.call({ data: { ...notif, userId: data._id } }, (error) => {
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <NotificationModalForm
          formTitle={i18n.__('components.AdminSendNotification.title') + data.username}
          onClose={onClose}
          allowTypeList={allowTypeList}
          submit={handleSubmit}
        />
      </>
    </Modal>
  );
};

AdminSendNotification.defaultProps = {
  allowTypeList: true,
};

AdminSendNotification.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  allowTypeList: PropTypes.bool,
};

export default AdminSendNotification;
