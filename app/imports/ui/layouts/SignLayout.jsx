import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Route, Switch } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import LanguageSwitcher from '../components/system/LanguageSwitcher';
import SignUp from '../pages/system/SignUp';
import SignIn from '../pages/system/SignIn';
import Footer from '../components/menus/Footer';
import Contact from '../pages/system/Contact';
import HelpPage from '../pages/HelpPage';
import { useAppContext } from '../contexts/context';
import OfflineServices from '../components/services/OfflineServices';
import OfflineMenu from '../components/menus/OfflineMenu';
import AppVersion from '../components/system/AppVersion';

const useStyles = makeStyles((theme) => ({
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
  const classes = useStyles();
  const theme = useTheme();
  const [selectedTab, setTab] = useState('home');

  function isEoleTheme() {
    if (Meteor.settings.public.theme === 'eole') {
      return { padding: 100, margin: -100, marginLeft: 5 };
    }
    return {};
  }

  const services =
    (offlinePage && isMobile && isIframed && selectedTab === 'apps') || !isIframed || (isIframed && !isMobile);
  const signin = (isIframed && isMobile && selectedTab === 'home') || !isIframed || (isIframed && !isMobile);
  const help = offlinePage && isIframed && isMobile && selectedTab === 'help';

  return (
    <>
      <Grid container component="main" className={isMobile ? classes.rootMobile : classes.root}>
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
                <Route exact path="/signup" component={SignUp} />
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

      {isIframed && offlinePage && isMobile ? <OfflineMenu state={[selectedTab, setTab]} /> : <Footer />}
    </>
  );
}
