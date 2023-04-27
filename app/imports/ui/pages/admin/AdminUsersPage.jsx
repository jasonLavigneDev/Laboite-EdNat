import React, { useState, useEffect } from 'react';
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
import AddAlertIcon from '@mui/icons-material/AddAlert';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import IconButton from '@mui/material/IconButton';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudIcon from '@mui/icons-material/Cloud';
import Pagination from '@mui/material/Pagination';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Roles } from 'meteor/alanning:roles';
import { usePaginatedMethod } from '../../utils/hooks';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import UserAvatar from '../../components/users/UserAvatar';
import AdminGroupQuota from '../../components/users/AdminGroupQuota';
import SearchField from '../../components/system/SearchField';
import AdminSendNotification from '../../components/users/AdminSendNotification';
import { useAdminSelectedStructure, useStructure } from '../../../api/structures/hooks';
import StructureSelect from '../../components/structures/StructureSelect';

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
  typeselect: {
    minWidth: '280px',
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
const userTypes = ['all', 'adminStructure', 'admin'];

const AdminUsersPage = ({ match: { path } }) => {
  const [openQuota, setOpenQuota] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [verifyDelete, setVerifyDelete] = useState();
  const { classes } = useStyles();
  const [{ isMobile }] = useAppContext();
  const [search, setSearch] = useState('');
  const [sortByDate, setSortByDate] = useState(false);
  const [userType, setUserType] = useState('all');

  // for user structure
  const isStructureSpecific = path === '/admin/structureusers';

  const structure = useStructure();

  const [selectedStructureId, setSelectedStructureId] = useState(structure && structure._id ? structure._id : '');
  const {
    loading: structuresLoading,
    selectedStructure,
    structures,
  } = useAdminSelectedStructure({ selectedStructureId, setSelectedStructureId });

  // variables depending on the admin page we're in
  const methodName = isStructureSpecific ? 'users.byStructure' : 'users.admins';
  const sortQuery = sortByDate ? { lastLogin: -1 } : { lastName: 1, firstName: 1 };

  const [
    call,
    {
      data: items = [],
      page,
      goToPage,
      total,
      // goToNextPage,
      // goToPreviousPage,
      // nbPage,
      // loading,
      // error,
      // called,
    },
  ] = usePaginatedMethod(methodName);

  useEffect(() => {
    call(search.trim(), { userType, sortQuery });
  }, [call, search, userType, sortByDate]);

  // track all global admin users
  const { isLoading, admins } = useTracker(() => {
    const roleshandlers = Meteor.subscribe('roles.admin');
    const adminsIds = Meteor.roleAssignment
      .find({ scope: null, 'role._id': 'admin' })
      .fetch()
      .map((assignment) => assignment.user._id);

    const roleshandlers2 = Meteor.subscribe('roles.adminStructureAll');
    return {
      isLoading: !roleshandlers.ready() && !roleshandlers2.ready(),
      admins: adminsIds,
    };
  });
  const handleChangePage = (event, value) => {
    goToPage(value);
  };
  const updateSearch = (e) => {
    setSearch(e.target.value);
  };
  const onResetSearch = () => {
    setSearch('');
  };
  const handleUserType = (evt) => {
    setUserType(evt.target.value);
  };

  useEffect(() => {
    if (page !== 1) {
      goToPage(1);
    }
  }, [search]);

  const isAdmin = (user) => admins.includes(user._id);
  const changeAdmin = (user) => {
    const method = isAdmin(user) ? 'users.unsetAdmin' : 'users.setAdmin';
    Meteor.call(method, { userId: user._id }, (err) => {
      if (err) msg.error(err.reason);
      else {
        call(search.trim(), { userType, sortQuery });
        msg.success(
          method === 'users.unsetAdmin'
            ? i18n.__('pages.AdminUsersPage.successUnsetAdmin')
            : i18n.__('pages.AdminUsersPage.successSetAdmin'),
        );
      }
    });
  };
  const isStructureAdmin = (user) => Roles.userIsInRole(user._id, 'adminStructure', user.structure);

  const changeAdminStructure = (user) => {
    const method = isStructureAdmin(user) ? 'users.unsetAdminStructure' : 'users.setAdminStructure';
    Meteor.call(method, { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else {
        call(search.trim(), { userType, sortQuery });
        msg.success(
          method === 'users.unsetAdminStructure'
            ? i18n.__('pages.AdminUsersPage.successUnsetAdminStructure')
            : i18n.__('pages.AdminUsersPage.successSetAdminStructure'),
        );
      }
    });
  };
  const deleteUser = (user) => {
    Meteor.call(`users.removeUser${isStructureSpecific ? 'FromStructure' : ''}`, { userId: user._id }, (error) => {
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

  const generateButtons = (user) => {
    const structureAdmin = isStructureAdmin(user);
    const globalAdmin = isAdmin(user);
    const copyUserId = () => {
      navigator.clipboard.writeText(user._id).then(msg.success(i18n.__('pages.AdminUsersPage.successCopyUserId')));
    };
    const copyNcLocator = () => {
      const federationId = `${user.username}@${user.nclocator}`;
      navigator.clipboard
        .writeText(federationId)
        .then(msg.success(i18n.__('pages.AdminUsersPage.successCopyNcLocator')));
    };

    const isDeleting = verifyDelete === user._id;
    const haveNcLocator = !!user.nclocator;

    const actionButtons = [
      {
        label: i18n.__(`pages.AdminUsersPage.${structureAdmin ? 'un' : ''}setAdminStructure`),
        onclick: () => changeAdminStructure(user),
        icon: structureAdmin ? <PersonAddDisabled /> : <GroupAddIcon />,
        hidden: isDeleting,
      },
      {
        label: i18n.__(`pages.AdminUsersPage.${globalAdmin ? 'un' : ''}setAdmin`),
        onclick: () => changeAdmin(user),
        icon: globalAdmin ? <ClearIcon /> : <VerifiedUserIcon />,
        hidden: isDeleting || isStructureSpecific,
      },
      {
        label: i18n.__('pages.AdminUsersPage.manageUser'),
        onclick: () => {
          userData = user;
          setOpenQuota(true);
        },
        icon: <SettingsApplicationsIcon />,
        hidden: isDeleting || Meteor.settings.public.disabledFeatures.groups,
      },
      {
        label: i18n.__('pages.AdminUsersPage.copyUserId'),
        onclick: copyUserId,
        icon: <VpnKeyIcon />,
        hidden: isDeleting,
      },
      {
        label: i18n.__('pages.AdminUsersPage.copyNcLocator'),
        onclick: copyNcLocator,
        icon: <CloudIcon />,
        hidden: isDeleting || !haveNcLocator,
      },
      {
        label: i18n.__('pages.AdminUsersPage.sendNotif'),
        onclick: () => {
          userData = user;
          setOpenNotif(true);
        },
        icon: <AddAlertIcon />,
        hidden: isDeleting,
      },
      {
        label: i18n.__(`pages.AdminUsersPage.deleteUser${isStructureSpecific ? 'FromStructure' : ''}`),
        onclick: () => setVerifyDelete(user._id),
        icon: <DeleteIcon />,
        hidden: isDeleting,
      },
      {
        label: i18n.__(`pages.AdminUsersPage.deleteUser${isStructureSpecific ? 'FromStructure' : ''}`),
        onclick: () => deleteUser(user),
        icon: <CheckIcon />,
        hidden: !isDeleting,
      },
      {
        label: i18n.__('pages.AdminUsersPage.cancelDelete'),
        onclick: () => setVerifyDelete(),
        icon: <ClearIcon />,
        hidden: !isDeleting,
      },
    ];

    return actionButtons;
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
                  {`${i18n.__('pages.AdminUsersPage.title')} ${
                    (isStructureSpecific && selectedStructure && selectedStructure._id && selectedStructure.name) || ''
                  } (${total})`}
                </Typography>
              </Grid>
              {isStructureSpecific && (
                <Grid item md={12}>
                  {!structuresLoading ? (
                    <StructureSelect
                      structures={structures}
                      selectedStructureId={selectedStructureId}
                      setSelectedStructureId={setSelectedStructureId}
                    />
                  ) : (
                    <Spinner />
                  )}
                </Grid>
              )}
              <Grid item xs={12} sm={12} md={6}>
                <FormControl>
                  <InputLabel id="usertype-selector-label">{i18n.__('pages.AdminUsersPage.userType')}</InputLabel>
                  <Select
                    className={classes.typeselect}
                    labelId="usertype-selector-label"
                    id="usertype-selector"
                    name="usertype"
                    variant="outlined"
                    label={i18n.__('pages.AdminUsersPage.userType')}
                    value={userType}
                    onChange={handleUserType}
                  >
                    {userTypes.map((usertype) => (
                      <MenuItem value={usertype} key={`select_${usertype}`}>
                        {i18n.__(`pages.AdminUsersPage.${usertype}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                              {` - ${user.structureName || i18n.__('pages.AdminUsersPage.undefined')}`}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          {verifyDelete === user._id && (
                            <Typography
                              component="span"
                              variant="body2"
                              className={classes.inline}
                              color={user._id === Meteor.userId() ? 'error' : 'textPrimary'}
                            >
                              {user._id === Meteor.userId()
                                ? i18n.__(
                                    `pages.AdminUsersPage.deleteSelf${
                                      isStructureSpecific ? 'FromStructure' : ''
                                    }Confirmation`,
                                  )
                                : i18n.__(
                                    `pages.AdminUsersPage.deleteUser${
                                      isStructureSpecific ? 'FromStructure' : ''
                                    }Confirmation`,
                                  )}
                            </Typography>
                          )}
                          {generateButtons(user).map(
                            (button) =>
                              !button.hidden && (
                                <Tooltip key={button.label} title={button.label} aria-label={button.label}>
                                  <IconButton
                                    edge="end"
                                    aria-label={button.label}
                                    onClick={button.onclick}
                                    sx={{ padding: '0 0.5vw' }}
                                  >
                                    {button.icon}
                                  </IconButton>
                                </Tooltip>
                              ),
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>,
                      i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                        <Divider variant="inset" component="li" key={`divider-${userEmail}`} />
                      ),
                    ];
                  })}
                </List>
                {total === 0 && <Typography variant="body">{i18n.__('pages.AdminUsersPage.noResult')}</Typography>}
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

AdminUsersPage.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};
export default AdminUsersPage;
