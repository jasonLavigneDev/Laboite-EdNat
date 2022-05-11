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
import { useAppContext } from '../contexts/context';
import OfflineServices from '../components/services/OfflineServices';
import OfflineMenu from '../components/menus/OfflineMenu';

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
}));

const { offlinePage } = Meteor.settings.public;

export default function SignLayout() {
  const [{ isMobile, isIframed }] = useAppContext();
  const classes = useStyles();
  const theme = useTheme();
  const [selectedTab, setTab] = useState('home');

  const services =
    (offlinePage && isMobile && isIframed && selectedTab === 'apps') || !isIframed || (isIframed && !isMobile);
  const signin = (isIframed && isMobile && selectedTab === 'home') || !isIframed || (isIframed && !isMobile);

  return (
    <>
      <Grid container component="main" className={isMobile ? classes.rootMobile : classes.root}>
        {services && <OfflineServices />}
        {!offlinePage && (
          <Grid container item xs={false} sm={4} md={7} spacing={4}>
            <Grid item md={12}>
              <div className={classes.mainFeaturedPostContent} />
            </Grid>
          </Grid>
        )}

        {signin && (
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6}>
            <div className={classes.paper}>
              {theme.logos.LONG_LOGO && (
                <div className={classes.imgLogo}>
                  <img src={theme.logos.LONG_LOGO} className={classes.imgLogo} alt="Logo" />
                </div>
              )}
              <Switch>
                <Route exact path="/signin" component={SignIn} />
                <Route exact path="/signup" component={SignUp} />
                <Route exact path="/contact" component={Contact} />
              </Switch>
              <LanguageSwitcher />
            </div>
          </Grid>
        )}
      </Grid>
      {isIframed && offlinePage && isMobile ? <OfflineMenu state={[selectedTab, setTab]} /> : <Footer />}
    </>
  );
}
