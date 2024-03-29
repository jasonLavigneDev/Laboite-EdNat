import React from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';

import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';

import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import { isUrlExternal } from '../../utils/utilsFuncs';

const useStyles = makeStyles()(() => ({
  inline: {
    display: 'inline',
  },
  isRead: {
    backgroundColor: '#F9F9FD',
  },
  button: {
    display: 'block',
    margin: 0,
    padding: 0,
  },
  buttonMargin: {
    display: 'block',
    margin: 0,
    marginTop: 8,
    padding: 0,
  },
  rightIcon: {
    marginTop: 8,
    marginLeft: 10,
  },
  leftIcon: {
    minWidth: 40,
  },
}));

const Notification = ({ notification, toast }) => {
  const { _id, type, title, content, createdAt, read } = notification;
  const { classes } = useStyles();
  const history = useHistory();

  const handleRemove = (e) => {
    e.stopPropagation();
    Meteor.call('notifications.removeNotification', { notificationId: _id }, (err) => {
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  const handleLink = () => {
    if (notification.link) {
      if (isUrlExternal(notification.link)) {
        window.open(notification.link, '_blank', 'noreferrer,noopener');
      } else {
        history.push(notification.link.replace(Meteor.absoluteUrl(), '/'));
      }
    }
  };

  const notifIcon = () => {
    switch (type) {
      case 'setRole':
        return <PersonAddIcon />;
      case 'unsetRole':
        return <PersonAddDisabledIcon />;
      case 'request':
        return <HelpIcon />;
      case 'group':
        return <GroupIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <ListItem
      alignItems="flex-start"
      className={read ? classes.isRead : null}
      button={notification.link !== undefined}
      onClick={handleLink}
    >
      <ListItemIcon className={classes.leftIcon}>
        <Badge
          invisible={read}
          variant="dot"
          badgeContent=" "
          overlap="circular"
          color="primary"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          {notifIcon()}
        </Badge>
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            {title}
            &nbsp;
            <Typography variant="caption" className={classes.inline} color="textSecondary">
              {createdAt.toLocaleDateString()}
            </Typography>
          </>
        }
        secondary={<span>{content}</span>}
      />
      {toast ? null : (
        <div className={classes.rightIcon}>
          <Tooltip
            title={i18n.__('components.Notifications.remove')}
            aria-label={i18n.__('components.Notifications.remove')}
          >
            <IconButton onClick={handleRemove} className={classes.button} size="large">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </ListItem>
  );
};

Notification.propTypes = {
  notification: PropTypes.objectOf(PropTypes.any).isRequired,
  toast: PropTypes.bool,
};

Notification.defaultProps = {
  toast: false,
};

export default Notification;
