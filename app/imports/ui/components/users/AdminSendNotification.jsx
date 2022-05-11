import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';
import { createNotification } from '../../../api/notifications/methods';
import { NOTIFICATIONS_TYPES } from '../../../api/notifications/enums';

const useStyles = (isMobile) =>
  makeStyles(() => ({
    root: COMMON_STYLES.root,
    media: COMMON_STYLES.media,
    video: COMMON_STYLES.video,
    actions: COMMON_STYLES.actions,
    paper: COMMON_STYLES.paper(isMobile, '50%'),
    iconWrapper: COMMON_STYLES.iconWrapper,
    groupCountInfo: COMMON_STYLES.groupCountInfo,
    alert: COMMON_STYLES.alert,
  }));

const AdminSendNotification = ({ data, open, onClose }) => {
  const [{ isMobile }] = useAppContext();
  const [notifState, setNotifState] = useState({
    title: '',
    content: '',
    type: 'info',
    userId: data._id,
  });
  const classes = useStyles(isMobile)();
  const sendNotification = () => {
    createNotification.call({ data: notifState }, (error) => {
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
      onClose();
    });
  };

  const updateState = (e) => {
    e.persist();
    setNotifState((state) => ({
      ...state,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.AdminSendNotification.subtitle') + data.username}
            action={
              <IconButton onClick={onClose}>
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <TextField
              onChange={updateState}
              value={notifState.title}
              name="title"
              label={i18n.__('components.AdminSendNotification.title_label')}
              variant="outlined"
              inputProps={{ maxLength: 64 }}
              fullWidth
              margin="normal"
            />
            <TextField
              onChange={updateState}
              value={notifState.content}
              name="content"
              label={i18n.__('components.AdminSendNotification.content_label')}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <Select
              label={i18n.__('components.AdminSendNotification.type_label')}
              name="type"
              fullWidth
              value={notifState.type}
              onChange={updateState}
            >
              {Object.values(NOTIFICATIONS_TYPES).map((type) => (
                <MenuItem value={type} key={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </CardContent>
          <CardActions className={classes.actions}>
            <Button onClick={onClose}>{i18n.__('components.AdminSendNotification.cancel')}</Button>
            <Button onClick={sendNotification} variant="contained" color="primary">
              {i18n.__('components.AdminSendNotification.ValidateForm')}
            </Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AdminSendNotification.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminSendNotification;
