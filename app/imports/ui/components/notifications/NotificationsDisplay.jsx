import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import i18n from 'meteor/universe:i18n';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import Notifications from '../../../api/notifications/notifications';
import { useAppContext } from '../../contexts/context';
import Notification from './Notification';
import { useNotifDisplayStyles } from './styles';

const NotificationsDisplay = ({ notifications, ready }) => {
  const { classes } = useNotifDisplayStyles();
  const [{ notificationPage }, dispatch] = useAppContext();
  const [open, setOpen] = useState(false);
  const [arrowRef, setArrowRef] = React.useState(null);
  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'notificationPage',
      data: {
        ...notificationPage,
        [key]: value,
      },
    });

  const handleNotifsClose = () => {
    // On notifs close : mark all as read
    Meteor.call('notifications.markAllNotificationAsRead', {}, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
    updateGlobalState('notifsOpen', false);
  };

  const handleRemoveAll = () => {
    Meteor.call('notifications.removeAllNotification', {}, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
    setOpen(false);
    updateGlobalState('notifsOpen', false);
  };

  const handleOpenDialog = () => {
    if (notifications.length !== 0) {
      setOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <>
      {!ready ? null : (
        <Popper
          className={classes.popper}
          open={notificationPage.notifsOpen || false}
          onClose={handleNotifsClose}
          anchorEl={document.getElementById('NotificationsBell')}
          placement="bottom-end"
          modifiers={[{ arrow: { enabled: true, element: arrowRef } }]}
        >
          <Fade in={notificationPage.notifsOpen}>
            <div>
              <span className={classes.arrow} ref={setArrowRef} />
              <Paper className={classes.paper}>
                <ClickAwayListener onClickAway={handleNotifsClose}>
                  <div>
                    <div className={classes.divflex}>
                      <Typography variant="h6">{i18n.__('components.NotificationsDisplay.title')}</Typography>
                    </div>
                    <Dialog
                      open={open}
                      onClose={handleCloseDialog}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          {i18n.__('components.NotificationsDisplay.confirmRemoveAll')}
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                          {i18n.__('components.NotificationsDisplay.cancel')}
                        </Button>
                        <Button onClick={handleRemoveAll} color="primary" autoFocus>
                          {i18n.__('components.NotificationsDisplay.confirm')}
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Divider />
                    <div className={notifications.length < 4 ? classes.notifsListEmpty : classes.notifsList}>
                      {notifications.map((notif, index) => [
                        <Notification key={notif._id} notification={notif} />,
                        notifications.length !== index + 1 ? (
                          <Divider className={classes.divider} key={`div-${notif._id}`} />
                        ) : null,
                      ])}
                    </div>
                    {notifications.length === 0 ? (
                      <Typography className={classes.footer} variant="body2">
                        {i18n.__('components.NotificationsDisplay.empty')}
                      </Typography>
                    ) : (
                      <div className={classes.footer}>
                        <Button color="primary" variant="contained" onClick={handleOpenDialog}>
                          {i18n.__('components.NotificationsDisplay.removeAll')}
                        </Button>
                      </div>
                    )}
                  </div>
                </ClickAwayListener>
              </Paper>
            </div>
          </Fade>
        </Popper>
      )}
    </>
  );
};

NotificationsDisplay.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('notifications.self');
  const notifications = Notifications.find({}, { sort: { createdAt: -1 } }).fetch() || [];
  return {
    notifications,
    ready: subscription.ready(),
  };
})(NotificationsDisplay);
