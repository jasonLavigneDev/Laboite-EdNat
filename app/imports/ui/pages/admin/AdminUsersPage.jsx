import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@mui/material/ListItemText';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import PersonAddDisabled from '@mui/icons-material/PersonAddDisabled';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { makeStyles } from 'tss-react/mui';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import SendIcon from '@mui/icons-material/Send';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import IconButton from '@mui/material/IconButton';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import Pagination from '@mui/material/Pagination';
import { Roles } from 'meteor/alanning:roles';
import { getStructureIds } from '../../../api/users/structures';
import { usePaginatedMethod, usePagination } from '../../utils/hooks';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import UserAvatar from '../../components/users/UserAvatar';
import AdminGroupQuota from '../../components/users/AdminGroupQuota';
import SearchField from '../../components/system/SearchField';
import AdminSendNotification from '../../components/users/AdminSendNotification';
import { getStructure } from '../../../api/structures/hooks';

let userData = {};
const useStyles = makeStyles()((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(3),
  },
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  admin: {
    backgroundColor: theme.palette.secondary.main,
  },
  adminstructure: {
    backgroundColor: theme.palette.secondary.dark,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionsSmall: {
    position: 'relative',
    marginLeft: 80,
    marginTop: 10,
  },
  actionsBig: {
    top: '70%',
  },
}));

const ITEM_PER_PAGE = 10;

const AdminUsersPage = () => {
  const [openQuota, setOpenQuota] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const { classes } = useStyles();
  const [{ isMobile, isTablet }] = useAppContext();
  const [search, setSearch] = useState('');
  const [sortByDate, setSortByDate] = useState(false);

  const [
    call,
    { goToNextPage, goToPreviousPage, page, goToPage, nbPage, total, loading, error, called, data: items = [] },
  ] = usePaginatedMethod('users.admins');

  useEffect(() => {
    call(search);
  }, [call, search]);

  // track all global admin users
  const { isLoading, admins } = useTracker(() => {
    const roleshandlers = Meteor.subscribe('roles.admin');
    const adminsIds = Meteor.roleAssignment
      .find({ scope: null, 'role._id': 'admin' })
      .fetch()
      .map((assignment) => assignment.user._id);

    const roleshandlers2 = Meteor.subscribe('roles.adminStructureAll');
    const adminsIds2 = Meteor.roleAssignment
      .find({ scope: { $in: getStructureIds() }, 'role._id': 'adminStructure' })
      .fetch()
      .map((assignment) => assignment.user._id);

    return {
      isLoading: !roleshandlers.ready() && !roleshandlers2.ready(),
      admins: adminsIds,
      adminStructure: adminsIds2,
    };
  });
  const handleChangePage = (event, value) => {
    goToPage(value);
  };
  //   const searchRef = useRef();
  const updateSearch = (e) => {
    // call(e.target.value);
    setSearch(e.target.value);
  };
  const onResetSearch = () => {
    setSearch('');
  };

  useEffect(() => {
    if (page !== 1) {
      goToPage(1);
    }
  }, [search]);

  const isAdmin = (user) => admins.includes(user._id);
  const changeAdmin = (user) => {
    const method = isAdmin(user) ? 'users.unsetAdmin' : 'users.setAdmin';
    Meteor.call(method, { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else {
        msg.success(
          method === 'users.unsetAdmin'
            ? i18n.__('pages.AdminUsersPage.successUnsetAdmin')
            : i18n.__('pages.AdminUsersPage.successSetAdmin'),
        );
      }
    });
  };
  const isStructureAdmin = (user) => Roles.userIsInRole(user._id, 'adminStructure', user.structure);
  useTracker(() => {
    const structuresIds = [];
    items.forEach(({ structure }) => {
      if (structure && structuresIds.indexOf(structuresIds) === -1) {
        structuresIds.push(structure);
      }
    });
    Meteor.subscribe('structures.ids', { ids: structuresIds });
  });

  const changeAdminStructure = (user) => {
    const method = isStructureAdmin(user) ? 'users.unsetAdminStructure' : 'users.setAdminStructure';
    Meteor.call(method, { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else {
        msg.success(
          method === 'users.unsetAdminStructure'
            ? i18n.__('pages.AdminUsersPage.successUnsetAdminStructure')
            : i18n.__('pages.AdminUsersPage.successSetAdminStructure'),
        );
      }
    });
  };
  const deleteUser = (user) => {
    Meteor.call('users.removeUser', { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else msg.success(i18n.__('pages.AdminUsersPage.successDeleteUser'));
    });
  };
  const loginInfo = (user) =>
    ` - ${
      user.lastLogin
        ? `${i18n.__('pages.AdminUsersPage.loginInfo')} : ${user.lastLogin.toLocaleString()}`
        : i18n.__('pages.AdminUsersPage.neverConnected')
    }`;
  const UserActions = ({ user }) => {
    const [verifyDelete, setVerifyDelete] = useState(false);
    const copyUserId = () => {
      navigator.clipboard.writeText(user._id).then(msg.success(i18n.__('pages.AdminUsersPage.successCopyUserId')));
    };
    return verifyDelete ? (
      <>
        <Typography
          component="span"
          variant="body2"
          className={classes.inline}
          color={user._id === Meteor.userId() ? 'error' : 'textPrimary'}
        >
          {user._id === Meteor.userId()
            ? i18n.__('pages.AdminUsersPage.deleteSelfConfirmation')
            : i18n.__('pages.AdminUsersPage.deleteUserConfirmation')}
        </Typography>
        <Tooltip title={i18n.__('pages.AdminUsersPage.deleteUser')} aria-label="delete">
          <IconButton edge="end" aria-label="delete" onClick={() => deleteUser(user)} size="large">
            <CheckIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.__('pages.AdminUsersPage.cancelDelete')} aria-label="cancel">
          <IconButton edge="end" aria-label="cancel" onClick={() => setVerifyDelete(false)} size="large">
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </>
    ) : (
      <>
        <Tooltip
          title={
            isStructureAdmin(user)
              ? i18n.__('pages.AdminUsersPage.unsetAdminStructure')
              : i18n.__('pages.AdminUsersPage.setAdminStructure')
          }
          aria-label="add"
        >
          <IconButton
            edge="end"
            aria-label={isStructureAdmin(user) ? 'noadminstructure' : 'adminstructure'}
            onClick={() => changeAdminStructure(user)}
            size="large"
          >
            {isStructureAdmin(user) ? <PersonAddDisabled /> : <GroupAddIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={isAdmin(user) ? i18n.__('pages.AdminUsersPage.unsetAdmin') : i18n.__('pages.AdminUsersPage.setAdmin')}
          aria-label="add"
        >
          <IconButton
            edge="end"
            aria-label={isAdmin(user) ? 'noadmin' : 'admin'}
            onClick={() => changeAdmin(user)}
            size="large"
          >
            {isAdmin(user) ? <ClearIcon /> : <VerifiedUserIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.__('pages.AdminUsersPage.manageUser')} aria-label="add">
          <IconButton
            edge="end"
            aria-label={i18n.__('pages.AdminUsersPage.manageUser')}
            onClick={() => {
              userData = user;
              setOpenQuota(true);
            }}
            size="large"
          >
            <SettingsApplicationsIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={i18n.__('pages.AdminUsersPage.copyUserId')} aria-label="show">
          <IconButton edge="end" aria-label="show" onClick={copyUserId} size="large">
            <VpnKeyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.__('pages.AdminUsersPage.sendNotif')} aria-label="send">
          <IconButton
            edge="end"
            aria-label={i18n.__('pages.AdminUsersPage.sendNotif')}
            onClick={() => {
              userData = user;
              setOpenNotif(true);
            }}
            size="large"
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.__('pages.AdminUsersPage.deleteUser')} aria-label="del">
          <IconButton edge="end" aria-label="delete" onClick={() => setVerifyDelete(true)} size="large">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </>
    );
  };
  UserActions.propTypes = {
    user: PropTypes.objectOf(PropTypes.any).isRequired,
  };
  return (
    <Fade in className={classes.root}>
      <div>
        <Container>
          {isLoading ? (
            <Spinner />
          ) : (
            <Grid container spacing={4}>
              <Grid item md={12}>
                <Typography variant={isMobile ? 'h6' : 'h4'}>
                  {`${i18n.__('pages.AdminUsersPage.title')} (${total})`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <SearchField
                  updateSearch={updateSearch}
                  search={search}
                  //   inputRef={searchRef}
                  resetSearch={onResetSearch}
                  label={i18n.__('pages.AdminUsersPage.searchText')}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={6} className={classes.pagination}>
                <Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sortByDate}
                          onChange={() => setSortByDate(!sortByDate)}
                          name="checkSortByDate"
                        />
                      }
                      label={i18n.__('pages.AdminUsersPage.sortByLastLogin')}
                      aria-label={i18n.__('pages.AdminUsersPage.sortByLastLogin')}
                    />
                  </Grid>
                  {total > ITEM_PER_PAGE && (
                    <Grid item>
                      <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                <List className={classes.list} disablePadding>
                  {items.map((user, i) => {
                    const userEmail = user.emails ? user.emails[0].address : '';
                    const structure = getStructure(user.structure);

                    return [
                      <ListItem alignItems="flex-start" key={`user-${userEmail}`}>
                        <ListItemAvatar>
                          <UserAvatar
                            customClass={
                              isAdmin(user)
                                ? classes.admin
                                : isStructureAdmin(user)
                                ? classes.adminstructure
                                : classes.avatar
                            }
                            userAvatar={user.avatar || user.username}
                            userFirstName={user.firstName}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.firstName} ${user.lastName}${
                            isAdmin(user)
                              ? ` (${i18n.__('pages.AdminUsersPage.admin')})`
                              : isStructureAdmin(user)
                              ? ` (${i18n.__('pages.AdminUsersPage.adminStructure')})`
                              : ''
                          } ${loginInfo(user)}`}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                color="textPrimary"
                              >
                                {userEmail}
                              </Typography>
                              {` - ${structure ? structure.name : i18n.__('pages.AdminUsersPage.undefined')}`}
                            </>
                          }
                        />
                        <ListItemSecondaryAction
                          className={isMobile || isTablet ? classes.actionsSmall : classes.actionsBig}
                        >
                          <UserActions user={user} />
                        </ListItemSecondaryAction>
                      </ListItem>,
                      i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                        <Divider variant="inset" component="li" key={`divider-${user.emails[0].address}`} />
                      ),
                    ];
                  })}
                </List>
              </Grid>
              {total > ITEM_PER_PAGE && (
                <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                  <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                </Grid>
              )}
            </Grid>
          )}
        </Container>
        {openQuota && <AdminGroupQuota data={userData} open={openQuota} onClose={() => setOpenQuota(false)} />}
        {openNotif && <AdminSendNotification data={userData} open={openNotif} onClose={() => setOpenNotif(false)} />}
      </div>
    </Fade>
  );
};

export default AdminUsersPage;
