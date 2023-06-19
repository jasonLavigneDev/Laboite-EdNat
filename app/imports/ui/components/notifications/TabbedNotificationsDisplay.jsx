import React, { useEffect, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import i18n from 'meteor/universe:i18n';
import Tabs from '@mui/material/Tabs';
import ForumIcon from '@mui/icons-material/Forum';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Notifications from '../../../api/notifications/notifications';
import { useAppContext } from '../../contexts/context';
import Notification from './Notification';
import { useNotifDisplayStyles } from './styles';
import { notificationsTabType } from '../../../api/notifications/enums';

const TabbedNotificationsDisplay = () => {
  const { classes } = useNotifDisplayStyles();
  const [tab, setTab] = useState(0);
  const { notifications, messagesCounter, infoCounter, ready } = useTracker(() => {
    const notifSub = Meteor.subscribe('notifications.self.tabbed', { types: notificationsTabType[tab] });
    return {
      notifications:
        Notifications.find({ type: { $in: notificationsTabType[tab] } }, { sort: { createdAt: -1 } }).fetch() || [],
      messagesCounter: Counts.get('notifications.self.tabbed.messages'),
      infoCounter: Counts.get('notifications.self.tabbed.infos'),
      ready: notifSub.ready(),
    };
  });

  useEffect(() => {
    if (notifications?.length >= 1 && ready) {
      Meteor.call('notifications.markAllTypeNotificationAsRead', { type: notificationsTabType[tab] }, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }
  }, [notifications, ready]);

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
    Meteor.call('notifications.removeAllTypeNotification', { type: notificationsTabType[tab] }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
    updateGlobalState('notifsOpen', false);
  };

  return (
    <Container>
      <Tabs variant="fullWidth" indicatorColor="primary" value={tab} to={tab} onChange={(_, index) => setTab(index)}>
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
      {notificationsTabType.map((types, i) => (
        <div
          role="tabpanel"
          hidden={tab !== i}
          id={`simple-tabpanel-${types[0]}`}
          aria-labelledby={`simple-tab-${types[0]}`}
          key={types[0]}
        >
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
          <Button onClick={handleRemoveAll} variant="contained">
            {i18n.__('components.TabbedNotificationsDisplay.removeAll')}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default TabbedNotificationsDisplay;
