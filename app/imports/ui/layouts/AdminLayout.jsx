import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation, Route, Switch } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import Alert from '@mui/material/Alert';
import AppSettings from '../../api/appsettings/appsettings';

// components
import AdminRoute from '../components/system/AdminRoute';
import SkipLink from '../components/menus/SkipLink';
import TopBar from '../components/menus/TopBar';
import Spinner from '../components/system/Spinner';
import NotValidatedMessage from '../components/system/NotValidatedMessage';
import CustomToast from '../components/system/CustomToast';
import { useAppContext } from '../contexts/context';
import NoStructureSelected from '../components/system/NoStructureSelected';
import AdminMenu from '../components/admin/AdminMenu';
import StructureAdminRoute from '../components/system/StructureAdminRoute';
import { useLayoutStyles } from './MainLayout';
import AdminHelpPage from '../pages/admin/AdminHelpPage';

// pages
const NotificationsDisplay = lazy(() => import('../components/notifications/NotificationsDisplay'));
const ProfilePage = lazy(() => import('../pages/system/ProfilePage'));
const NotFound = lazy(() => import('../pages/system/NotFound'));
const AdminHome = lazy(() => import('../pages/admin/AdminHome'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminTagsPage = lazy(() => import('../pages/admin/AdminTagsPage'));
const AdminUserValidationPage = lazy(() => import('../pages/admin/AdminUserValidationPage'));
const AdminGroupsPage = lazy(() => import('../pages/admin/AdminGroupsPage'));
const AdminSingleGroupPage = lazy(() => import('../pages/admin/AdminSingleGroupPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminNextcloudUrlPage = lazy(() => import('../pages/admin/AdminNextcloudUrlPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const AdminSingleServicePage = lazy(() => import('../pages/admin/AdminSingleServicePage'));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage'));
const AdminStructureManagementPage = lazy(() => import('../pages/admin/AdminStructuresManagementPage'));
const AdminBusinessReGroupingPage = lazy(() => import('../pages/admin/AdminBusinessRegroupingPage'));
const AdminServicesByStructurePage = lazy(() => import('../pages/admin/AdminServicesByStructurePage'));
const AdminStructureSettingsPage = lazy(() => import('../pages/admin/AdminStructureSettingsPage'));
const AdminStructureUsersValidationPage = lazy(() => import('../pages/admin/AdminStructureUsersValidationPage'));
const AdminStructureDefaultSpace = lazy(() => import('../pages/admin/AdminStructureDefaultSpace'));
const AdminAsamExtensionsManagementPage = lazy(() => import('../pages/admin/AdminAsamExtensionsManagementPage'));

const { disabledFeatures = {} } = Meteor.settings.public;

function AdminLayout() {
  const [{ userId, user, loadingUser, isMobile }] = useAppContext();
  const { classes, cx } = useLayoutStyles(isMobile);
  const location = useLocation();

  const isAdmin = Roles.userIsInRole(userId, 'admin');
  const { appsettings = {}, ready = false } = useTracker(() => {
    const subSettings = Meteor.subscribe('appsettings.all');
    return {
      appsettings: AppSettings.findOne(),
      ready: subSettings.ready(),
    };
  });

  useEffect(() => {
    // Reset focus on all location changes
    if (location.hash !== '#main') {
      document.getElementById('root').focus();
    }
  }, [location]);
  return (
    <div className={classes.root}>
      <SkipLink />
      <TopBar adminApp />
      {loadingUser && ready ? (
        <Spinner full />
      ) : (
        <main className={cx(classes.content, classes.flex)} id="main">
          <AdminMenu />
          <Suspense fallback={<Spinner />}>
            <div className={classes.container}>
              {appsettings.maintenance ? (
                <Alert className={classes.alertMaintenance} variant="filled" severity="error">
                  {i18n.__(`layouts.MainLayout.alertMaintenance`)}
                  {appsettings.textMaintenance ? `: ${i18n.__(appsettings.textMaintenance)}` : null}
                </Alert>
              ) : null}
              {user.isActive ? (
                user.structure !== undefined || isAdmin ? (
                  <Switch>
                    <Route userId={userId} loadingUser={loadingUser} exact path="/admin" component={AdminHome} />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/nextcloudurl"
                      component={AdminNextcloudUrlPage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/services"
                      component={AdminServicesPage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/services/new"
                      component={AdminSingleServicePage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/services/:_id"
                      component={AdminSingleServicePage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/asam"
                      component={AdminAsamExtensionsManagementPage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/users"
                      component={AdminUsersPage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/usersvalidation"
                      component={AdminUserValidationPage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/categories"
                      component={AdminCategoriesPage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/tags"
                      component={AdminTagsPage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/settings"
                      component={AdminSettingsPage}
                    />
                    {!disabledFeatures.groups && (
                      <AdminRoute
                        userId={userId}
                        loadingUser={loadingUser}
                        exact
                        path="/admin/groups"
                        component={AdminGroupsPage}
                      />
                    )}
                    {!disabledFeatures.groups && (
                      <AdminRoute
                        userId={userId}
                        loadingUser={loadingUser}
                        exact
                        path="/admin/groups/new"
                        component={AdminSingleGroupPage}
                      />
                    )}
                    {!disabledFeatures.groups && (
                      <AdminRoute
                        userId={userId}
                        loadingUser={loadingUser}
                        exact
                        path="/admin/groups/:_id"
                        component={AdminSingleGroupPage}
                      />
                    )}
                    <StructureAdminRoute
                      exact
                      path="/admin/structureusers"
                      component={AdminUsersPage}
                      user={user}
                      loadingUser={loadingUser}
                    />
                    <StructureAdminRoute
                      exact
                      path="/admin/businessReGrouping"
                      component={AdminBusinessReGroupingPage}
                      user={user}
                      loadingUser={loadingUser}
                    />
                    <StructureAdminRoute
                      exact
                      path="/admin/structureservices"
                      component={AdminServicesByStructurePage}
                      user={user}
                      loadingUser={loadingUser}
                    />
                    <StructureAdminRoute
                      exact
                      path="/admin/structureservices/new/:structureId"
                      component={AdminSingleServicePage}
                      user={user}
                      loadingUser={loadingUser}
                    />
                    <StructureAdminRoute
                      exact
                      path="/admin/structureservices/:_id"
                      component={AdminSingleServicePage}
                      user={user}
                      loadingUser={loadingUser}
                    />
                    {appsettings.userStructureValidationMandatory && (
                      <StructureAdminRoute
                        exact
                        path="/admin/structureusersvalidation"
                        component={AdminStructureUsersValidationPage}
                        user={user}
                        loadingUser={loadingUser}
                      />
                    )}
                    <StructureAdminRoute
                      exact
                      path="/admin/substructures"
                      component={AdminStructureManagementPage}
                      user={user}
                      loadingUser={loadingUser}
                    />
                    <StructureAdminRoute
                      exact
                      path="/admin/structuressettings"
                      user={user}
                      component={AdminStructureSettingsPage}
                      loadingUser={loadingUser}
                    />
                    <StructureAdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      user={user}
                      exact
                      path="/admin/structurespaces"
                      component={AdminStructureDefaultSpace}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/structures"
                      component={AdminStructureManagementPage}
                    />
                    <AdminRoute
                      userId={userId}
                      loadingUser={loadingUser}
                      exact
                      path="/admin/helps"
                      component={AdminHelpPage}
                    />
                    <Route component={NotFound} />
                  </Switch>
                ) : (
                  <Switch>
                    <Route exact path="/profile" component={ProfilePage} />
                    <Route component={NoStructureSelected} />
                  </Switch>
                )
              ) : (
                <Switch>
                  <Route exact path="/profile" component={ProfilePage} />
                  <Route component={NotValidatedMessage} />
                </Switch>
              )}
            </div>
          </Suspense>
        </main>
      )}
      <NotificationsDisplay />
      <CustomToast />
    </div>
  );
}

export default AdminLayout;
