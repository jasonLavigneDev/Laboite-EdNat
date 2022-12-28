import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { withTracker } from 'meteor/react-meteor-data';
import NotificationsBell from '../notifications/NotificationsBell';
import MenuBar from './MenuBar';
import MainMenu from './MainMenu';
import { useAppContext } from '../../contexts/context';
import AppSettings from '../../../api/appsettings/appsettings';
import IconAndCoverImagePage from '../../pages/structure/IconAndCoverImagePage';

const { disabledFeatures } = Meteor.settings.public;

const useStyles = makeStyles()((theme, isMobile) => ({
  root: {
    backgroundColor: theme.palette.tertiary.main,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    minHeight: 48,
    position: 'relative',
  },
  firstBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    zIndex: 1,
    backgroundColor: '#FFF',
  },
  secondBar: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  secondBarBorderTop: {
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
  },
  imgLogoContainer: {
    height: isMobile ? 30 : 60,
    maxHeight: isMobile ? 30 : 60,
    color: theme.palette.text.primary,
    display: 'flex',
    outline: 'none',
  },
  imgLogo: {
    height: isMobile ? 30 : 60,
    maxHeight: isMobile ? 30 : 60,
    color: theme.palette.text.primary,
    display: 'flex',
    outline: 'none',
  },
  grow: {
    flexGrow: 1,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rightContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItem: 'center',
    height: 48,
  },
  leftContainer: { display: 'flex', flex: 1, alignItems: 'center' },
  maintenanceBar: {
    marginTop: 50,
  },
}));
function TopBar({ publicMenu, root, appsettings, adminApp }) {
  const [{ isMobile, user, notificationPage }, dispatch] = useAppContext();
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();
  const { classes } = useStyles(isMobile);
  const { SMALL_LOGO, LONG_LOGO, SMALL_LOGO_MAINTENANCE, LONG_LOGO_MAINTENANCE } = theme.logos;
  const LOGO = appsettings.maintenance
    ? isMobile
      ? SMALL_LOGO_MAINTENANCE
      : LONG_LOGO_MAINTENANCE
    : isMobile
    ? SMALL_LOGO
    : LONG_LOGO;

  const isEoleTheme = Meteor.settings.public.theme === 'eole';

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'notificationPage',
      data: {
        ...notificationPage,
        [key]: value,
      },
    });

  const handleNotifsOpen = () => {
    const notifState = notificationPage.notifsOpen || false;
    if (!disabledFeatures.notificationsTab) {
      history.push('/notifications');
    } else {
      if (notifState) {
        // On notifs close : mark all as read
        Meteor.call('notifications.markAllNotificationAsRead', {}, (err) => {
          if (err) {
            msg.error(err.reason);
          }
        });
      }
      updateGlobalState('notifsOpen', !notifState);
    }
  };

  return (
    <AppBar position="fixed" className={classes.root}>
      <div className={classes.firstBar}>
        <div className={classes.leftContainer}>
          {LOGO ? (
            <Link to={root || (publicMenu ? '/public' : '/')} className={classes.imgLogoContainer}>
              <img
                src={LOGO}
                className={classes.imgLogoContainer}
                alt="Logo"
                style={{ padding: isEoleTheme && !isMobile ? 10 : '' }}
              />
            </Link>
          ) : (
            <div />
          )}
          {isMobile && (
            <Link to="/informations">
              <IconButton color={location.pathname === '/informations' ? 'primary' : 'default'}>
                <InfoIcon />
              </IconButton>
            </Link>
          )}
        </div>

        <div className={classes.rightContainer}>
          {publicMenu ? null : (
            <>
              <MainMenu user={user} />
              <IconButton onClick={handleNotifsOpen} size="large">
                <NotificationsBell />
              </IconButton>
            </>
          )}
        </div>
      </div>
      {!publicMenu && !adminApp && (
        <>
          <IconAndCoverImagePage />
          {!isMobile && (
            <div className={`${classes.secondBar} ${classes.secondBarBorderTop}`}>
              <MenuBar />
            </div>
          )}
        </>
      )}
    </AppBar>
  );
}

export default withTracker(() => {
  const subSettings = Meteor.subscribe('appsettings.all');
  const appsettings = AppSettings.findOne();
  const ready = subSettings.ready();
  return {
    appsettings,
    ready,
  };
})(TopBar);

TopBar.propTypes = {
  publicMenu: PropTypes.bool,
  root: PropTypes.string,
  appsettings: PropTypes.objectOf(PropTypes.any),
  adminApp: PropTypes.bool,
};

TopBar.defaultProps = {
  publicMenu: false,
  root: null,
  appsettings: {},
  adminApp: false,
};
