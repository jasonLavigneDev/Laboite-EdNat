import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withTracker } from 'meteor/react-meteor-data';
import NotificationsBell from '../notifications/NotificationsBell';
import MenuBar from './MenuBar';
import MainMenu from './MainMenu';
import { useAppContext } from '../../contexts/context';
import AppSettings from '../../../api/appsettings/appsettings';

const isRizomo = Meteor.settings.public.theme === 'rizomo';
const { appName, appDescription } = Meteor.settings.public;

const useStyles = (isMobile) =>
  makeStyles((theme) => ({
    root: {
      backgroundColor: theme.palette.tertiary.main,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      minHeight: 48,
    },
    firstBar: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    secondBar: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    },
    imgLogoContainer: {
      height: isMobile ? 30 : 120,
      maxHeight: isMobile ? 30 : 120,
      color: theme.palette.text.primary,
      display: 'flex',
      outline: 'none',
    },
    imgLogo: {
      height: isMobile || !isRizomo ? 30 : 120,
      maxHeight: isMobile || !isRizomo ? 30 : 120,
      color: theme.palette.text.primary,
      display: 'flex',
      outline: 'none',
    },
    logoText: {
      color: theme.palette.text.primary,
      marginTop: 'auto',
      marginBottom: 'auto',
      marginLeft: 20,
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
    maintenanceBar: {
      marginTop: 50,
    },
    appName: {
      '& .dot': {
        color: '#5aa1d8',
      },
    },
  }));

function TopBar({ publicMenu, root, appsettings, adminApp }) {
  const [{ isMobile, user, notificationPage }, dispatch] = useAppContext();
  const theme = useTheme();
  const classes = useStyles(isMobile)();
  const { SMALL_LOGO, LONG_LOGO, SMALL_LOGO_MAINTENANCE, LONG_LOGO_MAINTENANCE } = theme.logos;
  const LOGO = appsettings.maintenance
    ? isMobile
      ? SMALL_LOGO_MAINTENANCE
      : LONG_LOGO_MAINTENANCE
    : isMobile
    ? SMALL_LOGO
    : LONG_LOGO;

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
    if (notifState) {
      // On notifs close : mark all as read
      Meteor.call('notifications.markAllNotificationAsRead', {}, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }
    updateGlobalState('notifsOpen', !notifState);
  };

  return (
    <div>
      <AppBar position="fixed" className={classes.root}>
        <div className={classes.firstBar}>
          <Link to={root || (publicMenu ? '/public' : '/')} className={classes.imgLogoContainer}>
            <img src={isRizomo ? LOGO : SMALL_LOGO} className={classes.imgLogoContainer} alt="Logo" />
            {!isMobile && (
              <div className={classes.logoText}>
                <Typography variant="h4" component="h4">
                  <div
                    className={classes.appName}
                    dangerouslySetInnerHTML={{
                      __html: appName.replaceAll('.', '<span class="dot">.</span>'),
                    }}
                  />
                </Typography>
                {appDescription && (
                  <Typography variant="subtitle1" component="h5">
                    {appDescription}
                  </Typography>
                )}
              </div>
            )}
          </Link>
          <div className={classes.rightContainer}>
            {publicMenu ? null : (
              <>
                <MainMenu user={user} />
                <IconButton onClick={() => handleNotifsOpen()}>
                  <NotificationsBell />
                </IconButton>
              </>
            )}
          </div>
        </div>
        {!isMobile && !publicMenu && !adminApp && (
          <div className={classes.secondBar}>
            <MenuBar />
          </div>
        )}
      </AppBar>
    </div>
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
