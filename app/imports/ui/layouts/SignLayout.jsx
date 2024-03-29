import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Route, Switch } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useTracker } from 'meteor/react-meteor-data';
import LanguageSwitcher from '../components/system/LanguageSwitcher';
import SignIn from '../pages/system/SignIn';
import Footer from '../components/menus/Footer';
import Contact from '../pages/system/Contact';
import HelpPage from '../pages/HelpPage';
import { useAppContext } from '../contexts/context';
import OfflineServices from '../components/services/OfflineServices';
import OfflineMenu from '../components/menus/OfflineMenu';
import AppVersion from '../components/system/AppVersion';
import AppSettings from '../../api/appsettings/appsettings';

const useStyles = makeStyles()((theme) => ({
  root: {
    minHeight: 'calc(100vh - 64px)',
    padding: '16px',
    backgroundImage: theme.signinBackground,
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.grey[50],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  rootMobile: {
    minHeight: 'calc(100vh - 64px)',
    padding: '16px',
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.primary.light,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    paddingBottom: 100,
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imgLogo: {
    alignSelf: 'center',
    maxWidth: '100%',
    maxHeight: 'auto',
    width: '100%',
    paddingBottom: '5%',
  },
  mainFeaturedPostContent: {
    position: 'relative',
    // padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6),
      paddingRight: 0,
    },
  },
  version: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    fontSize: 12,
  },
  grid: {
    position: 'relative',
  },
}));

const { offlinePage } = Meteor.settings.public;

export default function SignLayout() {
  const [{ isMobile, isIframed }] = useAppContext();
  const { classes } = useStyles();
  const theme = useTheme();
  const [selectedTab, setTab] = useState('apps');

  const { maintenance = {}, ready = false } = useTracker(() => {
    const subSettings = Meteor.subscribe('appsettings.all');
    return {
      maintenance: AppSettings.findOne({}, { fields: { maintenance: 1 } }),
      ready: subSettings.ready(),
    };
  });

  function isEoleTheme() {
    if (Meteor.settings.public.theme === 'eole') {
      return { padding: 100, margin: -100, marginLeft: 5 };
    }
    return {};
  }

  const services = (offlinePage && isIframed && selectedTab === 'apps') || !isIframed;
  const signin = (offlinePage && isIframed && selectedTab === 'home') || !isIframed;
  const help = offlinePage && isIframed && selectedTab === 'help';

  return (
    <>
      <Grid
        justifyContent="center"
        container
        component="main"
        className={isMobile || isIframed ? classes.rootMobile : classes.root}
        style={maintenance.maintenance || !ready ? { minHeight: '100vh' } : null}
      >
        {services && <OfflineServices />}
        {help && <HelpPage />}
        {!offlinePage && (
          <Grid container item xs={false} sm={4} md={7} spacing={4}>
            <Grid item md={12}>
              <div className={classes.mainFeaturedPostContent} />
            </Grid>
          </Grid>
        )}

        {signin && (
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} className={classes.grid}>
            <div className={classes.paper}>
              {theme.logos.LONG_LOGO && (
                <div className={classes.imgLogo}>
                  <img src={theme.logos.LONG_LOGO} className={classes.imgLogo} alt="Logo" style={isEoleTheme()} />
                </div>
              )}
              <Switch>
                <Route exact path="/signin" component={SignIn} />
                <Route exact path="/contact" component={Contact} />
              </Switch>
              <LanguageSwitcher />
            </div>
            <div className={classes.version}>
              <AppVersion />
            </div>
          </Grid>
        )}
      </Grid>

      {isIframed && offlinePage ? <OfflineMenu state={[selectedTab, setTab]} /> : <Footer />}
    </>
  );
}
