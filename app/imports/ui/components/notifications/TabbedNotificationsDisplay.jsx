import React, { useEffect, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import i18n from 'meteor/universe:i18n';
import Tabs from '@material-ui/core/Tabs';
import ForumIcon from '@material-ui/icons/Forum';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import Tab from '@material-ui/core/Tab';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Notifications from '../../../api/notifications/notifications';
import { useAppContext } from '../../contexts/context';
import Notification from './Notification';
import { useNotifDisplayStyles } from './styles';

const notificationsType = ['message', 'info'];

const TabbedNotificationsDisplay = () => {
  const classes = useNotifDisplayStyles();
  const [tab, setTab] = useState(0);
  const { notifications, messagesCounter, infoCounter } = useTracker(() => {
    Meteor.subscribe('notifications.self.tabbed', { type: notificationsType[tab] });
    return {
      notifications: Notifications.find({ type: notificationsType[tab] }, { sort: { createdAt: -1 } }).fetch() || [],
      messagesCounter: Counts.get('notifications.self.tabbed.messages'),
      infoCounter: Counts.get('notifications.self.tabbed.infos'),
    };
  });

  useEffect(() => {
    Meteor.call('notifications.markAllTypeNotificationAsRead', { type: notificationsType[tab] }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  }, [notifications]);

  const [{ notificationPage }, dispatch] = useAppContext();
  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'notificationPage',
      data: {
        ...notificationPage,
        [key]: value,
      },
    });

  const handleRemoveAll = () => {
    Meteor.call('notifications.removeAllTypeNotification', { type: notificationsType[tab] }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
    updateGlobalState('notifsOpen', false);
  };

  return (
    <Container>
      <Tabs variant="fullWidth" indicatorColor="primary" value={tab} onChange={(_, index) => setTab(index)}>
        <Tab
          className={classes.tabs}
          icon={!messagesCounter ? <ForumIcon /> : <Chip size="small" label={messagesCounter} color="secondary" />}
          label={<div>{i18n.__('components.TabbedNotificationsDisplay.tabMessages')}</div>}
        />
        <Tab
          className={classes.tabs}
          icon={!infoCounter ? <FolderSpecialIcon /> : <Chip size="small" label={infoCounter} color="secondary" />}
          label={<div>{i18n.__('components.TabbedNotificationsDisplay.tabSpaces')}</div>}
        />
      </Tabs>
      {notificationsType.map((value, i) => (
        <div role="tabpanel" hidden={tab !== i} id={`simple-tabpanel-${value}`} aria-labelledby={`simple-tab-${value}`}>
          {tab === i && (
            <Box p={3}>
              <div className={notifications.length < 4 ? classes.notifsListEmpty : classes.notifsList}>
                {notifications.map((notif, index) => [
                  <Notification key={notif._id} notification={notif} />,
                  notifications.length !== index + 1 ? (
                    <Divider className={classes.divider} key={`div-${notif._id}`} />
                  ) : null,
                ])}
              </div>
            </Box>
          )}
        </div>
      ))}

      {notifications.length === 0 ? (
        <Typography className={classes.footer} variant="body2">
          {i18n.__('components.TabbedNotificationsDisplay.empty')}
        </Typography>
      ) : (
        <div className={classes.footer}>
          <Button onClick={handleRemoveAll} className={classes.button}>
            {i18n.__('components.TabbedNotificationsDisplay.removeAll')}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default TabbedNotificationsDisplay;
