import React, { useEffect } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Badge from '@mui/material/Badge';
import { toast } from 'react-toastify';
import Notifications from '../../../api/notifications/notifications';
import Notification from './Notification';
import notificationSystem from './NotificationSystem';
import { badgeStyle } from '../groups/GroupBadge';
import * as flags from '../../utils/flags';

const useStyles = makeStyles()((theme) => badgeStyle(theme));

const sendNonReadNotificationCountToWindow = (count) => {
  if (flags.IS_FRAMED) {
    window.parent.postMessage(
      {
        type: 'notifications',
        content: count,
      },
      '*',
    );
  }
};

const NotificationsBell = ({ nonReadNotifsCount }) => {
  const { classes } = useStyles();

  useEffect(() => {
    sendNonReadNotificationCountToWindow(nonReadNotifsCount);
  }, [nonReadNotifsCount]);

  return (
    <div id="NotificationsBell">
      {nonReadNotifsCount > 0 ? (
        <Badge className={classes.badge} badgeContent={nonReadNotifsCount} color="primary">
          <NotificationsIcon />
        </Badge>
      ) : (
        <NotificationsNoneIcon />
      )}
    </div>
  );
};

export default withTracker(() => {
  Meteor.subscribe('notifications.self');
  const notifs = Notifications.find({ userId: Meteor.userId(), createdAt: { $gt: new Date() } });

  notifs.observe({
    added(notif) {
      if (document.hasFocus()) {
        toast(<Notification notification={notif} toast />);
      } else {
        notificationSystem(notif.title, { body: notif.content });
      }
    },
  });

  const notifications = Notifications.find({}, { sort: { createdAt: -1 } }).fetch() || [];
  const nonReadNotifsCount = Notifications.find({ userId: Meteor.userId(), read: false }).count();

  sendNonReadNotificationCountToWindow(nonReadNotifsCount);

  return {
    nonReadNotifsCount,
    notifications,
  };
})(NotificationsBell);

NotificationsBell.propTypes = { nonReadNotifsCount: PropTypes.number.isRequired };
