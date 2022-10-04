import React, { useState } from 'react';
import Card from '@mui/material/Card';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';

const useStyles = makeStyles()((theme, isMobile) => ({
  root: COMMON_STYLES.root,
  media: COMMON_STYLES.media,
  video: COMMON_STYLES.video,
  actions: COMMON_STYLES.actions,
  paper: COMMON_STYLES.paper(isMobile, '50%'),
  iconWrapper: COMMON_STYLES.iconWrapper,
  groupCountInfo: COMMON_STYLES.groupCountInfo,
  alert: COMMON_STYLES.alert,
}));

const NotificationModalForm = ({ formTitle, onClose, submit }) => {
  const [{ isMobile }] = useAppContext();
  const [notifState, setNotifState] = useState({
    title: '',
    content: '',
    type: 'info',
  });
  const { classes } = useStyles(isMobile);

  const updateState = (e) => {
    setNotifState((state) => ({
      ...state,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={classes.paper}>
      <Card className={classes.root}>
        <CardHeader
          title={formTitle}
          action={
            <IconButton onClick={onClose} size="large">
              <ClearIcon />
            </IconButton>
          }
        />
        <CardContent>
          <TextField
            onChange={updateState}
            value={notifState.title}
            name="title"
            label={i18n.__('components.NotificationModalForm.title_label')}
            variant="outlined"
            inputProps={{ maxLength: 64 }}
            fullWidth
            margin="normal"
          />
          <TextField
            onChange={updateState}
            value={notifState.content}
            name="content"
            label={i18n.__('components.NotificationModalForm.content_label')}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </CardContent>
        <CardActions className={classes.actions}>
          <Button onClick={onClose}>{i18n.__('components.NotificationModalForm.cancel')}</Button>
          <Button onClick={() => submit(notifState)} variant="contained" color="primary">
            {i18n.__('components.NotificationModalForm.ValidateForm')}
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

NotificationModalForm.propTypes = {
  formTitle: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

export default NotificationModalForm;
