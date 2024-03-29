import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation, Route, Switch, useHistory } from 'react-router-dom';
// import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import Alert from '@mui/material/Alert';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import AppSettings from '../../api/appsettings/appsettings';

// components
import SkipLink from '../components/menus/SkipLink';
import TopBar from '../components/menus/TopBar';
import Spinner from '../components/system/Spinner';
import MobileMenu from '../components/menus/MobileMenu';
import NotValidatedMessage from '../components/system/NotValidatedMessage';
import CustomToast from '../components/system/CustomToast';
import { useAppContext } from '../contexts/context';
import NoStructureSelected from '../components/system/NoStructureSelected';
import AwaitingStructureMessage from '../components/system/AwaitingStructure';
import SiteInMaintenance from '../components/system/SiteInMaintenance';
import Footer from '../components/menus/Footer';
import { isFeatureEnabled } from '../utils/features';

// pages
const ServicesPage = lazy(() => import('../pages/services/ServicesPage'));
const HelpPage = lazy(() => import('../pages/HelpPage'));
const SingleServicePage = lazy(() => import('../pages/services/SingleServicePage'));
const GroupsPage = lazy(() => import('../pages/groups/GroupsPage'));
const NotFound = lazy(() => import('../pages/system/NotFound'));
const PersonalPage = lazy(() => import('../pages/PersonalPage'));
const SingleGroupPage = lazy(() => import('../pages/groups/SingleGroupPage'));
const AddressBook = lazy(() => import('../pages/groups/AddressBook'));
const ExternalServiceGroupPage = lazy(() => import('../pages/groups/ExternalServiceGroupPage'));
const GroupArticlesPage = lazy(() => import('../pages/groups/GroupArticlesPage'));
const ContactPage = lazy(() => import('../pages/system/Contact'));
const ProfilePage = lazy(() => import('../pages/system/ProfilePage'));
const ArticlesPage = lazy(() => import('../pages/articles/ArticlesPage'));
const EditArticlePage = lazy(() => import('../pages/articles/EditArticlePage'));
const MediaStoragePage = lazy(() => import('../pages/MediaStoragePage'));
const UserBookmarksPage = lazy(() => import('../pages/users/UserBookmarksPage'));
const NotificationsDisplay = lazy(() => import('../components/notifications/NotificationsDisplay'));
const BookmarksPage = lazy(() => import('../pages/groups/BookmarksPage'));
const StructureSelectionPage = lazy(() => import('../pages/system/StructureSelectionPage'));
const TabbedNotificationsDisplay = lazy(() => import('../components/notifications/TabbedNotificationsDisplay'));
const IntroductionPage = lazy(() => import('../pages/IntroductionPage'));
const UploadPage = lazy(() => import('../pages/Upload'));

// dynamic imports
const AdminGroupsPage = lazy(() => import('../pages/admin/AdminGroupsPage'));
const AdminSingleGroupPage = lazy(() => import('../pages/admin/AdminSingleGroupPage'));

// CSS
export const useLayoutStyles = makeStyles()((theme, isMobile) => ({
  root: {
    // display: 'flex',
    // position: 'relative',
  },
  container: {
    width: `calc(100% - ${isMobile ? 65 : 300}px)`,
    position: 'relative',
    minHeight: '50vh',
  },
  content: {
    position: 'relative',
    minHeight: '50vh',
    flexGrow: 1,
    padding: isMobile ? null : theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflow: 'hidden',
    marginBottom: isMobile ? 100 : 50,
  },
  mainMarginTop: {
    marginTop: isMobile ? 60 : 20,
    // marginTop: !isMobile && theme.shape.headerHeight ? theme.shape.headerHeight : 60,
  },
  flex: {
    display: 'flex',
    flexGrow: 1,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  alertMaintenance: {
    marginTop: isMobile ? 0 : -10,
    marginBottom: 30,
  },
}));

function MainLayout({ appsettings, ready }) {
  const [{ userId, user, loadingUser, isMobile, language }] = useAppContext();
  const { classes } = useLayoutStyles(isMobile, {
    props: isMobile,
  });
  const location = useLocation();
  const { disabledFeatures = {} } = Meteor.settings.public;
  const isAdmin = Roles.userIsInRole(userId, 'admin');
  const history = useHistory();

  useEffect(() => {
    // Reset focus on all location changes
    if (location.hash !== '#main') {
      document.getElementById('root').focus();
    }
  }, [location]);

  useEffect(() => {
    if (!user.isActive || !user.structure) return;

    if (history.location.pathname === '/') {
      Meteor.call('globalInfos.getGlobalInfoByLanguageAndNotExpired', { language, date: new Date() }, (error, res) => {
        if (error) {
          console.log('error', error);
          return;
        }

        if (res.length && (!user.lastGlobalInfoReadDate || new Date(user.lastGlobalInfoReadDate) < res[0].updatedAt)) {
          Meteor.call('users.setLastGlobalInfoRead', { lastGlobalInfoReadDate: new Date() });
          return;
        }

        if (Meteor.settings.public.forceRedirectToPersonalSpace !== false) {
          history.push('/personal');
        }
      });
    }
  }, []);

  return (
    <>
      <div className={classes.root}>
        <SkipLink />
        <TopBar />
        {loadingUser && ready ? (
          <Spinner full />
        ) : (
          <main className={`${classes.content} ${classes.mainMarginTop}`} id="main">
            {appsettings.maintenance && isAdmin ? (
              <Alert className={classes.alertMaintenance} variant="filled" severity="error">
                {i18n.__(`layouts.MainLayout.alertMaintenance`)}
                {appsettings.textMaintenance ? `: ${i18n.__(appsettings.textMaintenance)}` : null}
              </Alert>
            ) : null}
            <Suspense fallback={<Spinner />}>
              {!appsettings.maintenance || isAdmin ? (
                user.isActive ? (
                  user.structure ? (
                    <Switch>
                      <Route exact path="/" component={IntroductionPage} />
                      <Route exact path="/personal" component={PersonalPage} />
                      <Route exact path="/profile" component={ProfilePage} />
                      <Route exact path="/contact" component={ContactPage} />
                      <Route exact path="/profilestructureselection" component={StructureSelectionPage} />
                      <Route exact path="/services" component={ServicesPage} />
                      <Route exact path="/structure" component={ServicesPage} />
                      <Route exact path="/help" component={HelpPage} />

                      {!disabledFeatures.introductionTab && (
                        <Route exact path="/informations" component={IntroductionPage} />
                      )}

                      {isFeatureEnabled('franceTransfert') && <Route exact path="/upload" component={UploadPage} />}

                      {!disabledFeatures.blog && <Route exact path="/publications" component={ArticlesPage} />}
                      {!disabledFeatures.blog && <Route exact path="/publications/new" component={EditArticlePage} />}
                      {!disabledFeatures.blog && <Route exact path="/publications/:slug" component={EditArticlePage} />}

                      <Route exact path="/services/:slug" component={SingleServicePage} />
                      <Route exact path="/services/:structure/:slug" component={SingleServicePage} />
                      <Route exact path="/structure/:slug" component={SingleServicePage} />
                      {!disabledFeatures.groups && <Route exact path="/groups" component={GroupsPage} />}
                      {!disabledFeatures.groups && <Route exact path="/groups/:slug" component={SingleGroupPage} />}
                      {!disabledFeatures.groups && (
                        <Route exact path="/groups/:slug/addressbook" component={AddressBook} />
                      )}
                      {!disabledFeatures.groups && (
                        <Route exact path="/groups/:slug/services/:service" component={ExternalServiceGroupPage} />
                      )}
                      {!disabledFeatures.groups && (
                        <Route exact path="/groups/:slug/bookmarks" component={BookmarksPage} />
                      )}
                      {!disabledFeatures.groups && (
                        <Route exact path="/groups/:slug/articles" component={GroupArticlesPage} />
                      )}
                      {!disabledFeatures.groups && <Route exact path="/admingroups" component={AdminGroupsPage} />}
                      {!disabledFeatures.groups && (
                        <Route exact path="/admingroups/new" component={AdminSingleGroupPage} />
                      )}
                      {!disabledFeatures.groups && (
                        <Route exact path="/admingroups/:_id" component={AdminSingleGroupPage} />
                      )}
                      <Route exact path="/medias" component={MediaStoragePage} />
                      <Route exact path="/notifications" component={TabbedNotificationsDisplay} />
                      <Route exact path="/userBookmarks" component={UserBookmarksPage} />
                      <Route component={NotFound} />
                    </Switch>
                  ) : (
                    <Switch>
                      <Route exact path="/profile" component={ProfilePage} />
                      <Route exact path="/profilestructureselection" component={StructureSelectionPage} />
                      {!disabledFeatures.introductionTab && (
                        <Route exact path="/informations" component={IntroductionPage} />
                      )}
                      {user.awaitingStructure ? (
                        <Route component={AwaitingStructureMessage} />
                      ) : (
                        <Route component={NoStructureSelected} />
                      )}
                    </Switch>
                  )
                ) : (
                  <Switch>
                    <Route exact path="/profile" component={ProfilePage} />
                    <Route component={NotValidatedMessage} />
                  </Switch>
                )
              ) : (
                <Switch>
                  <Route exact path="/" component={SiteInMaintenance} />
                  <Route component={SiteInMaintenance} />
                </Switch>
              )}
            </Suspense>
            {isMobile && <MobileMenu />}
          </main>
        )}
        <NotificationsDisplay />
        <CustomToast />
      </div>
      <Switch>
        <Route exact path="/help" component={Footer} />
      </Switch>
    </>
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
})(MainLayout);

MainLayout.defaultProps = {
  appsettings: {},
};

MainLayout.propTypes = {
  appsettings: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
