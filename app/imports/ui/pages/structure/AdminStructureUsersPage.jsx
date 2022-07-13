/* eslint-disable react/prop-types */
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
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import makeStyles from '@mui/styles/makeStyles';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import { Roles } from 'meteor/alanning:roles';
import { usePagination } from '../../utils/hooks';
import Spinner from '../../components/system/Spinner';
import SearchField from '../../components/system/SearchField';
import { useAppContext } from '../../contexts/context';
import UserAvatar from '../../components/users/UserAvatar';
import { useStructure, useAdminSelectedStructure } from '../../../api/structures/hooks';
import StructureSelect from '../../components/structures/StructureSelect';

const useStyles = makeStyles((theme) => ({
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
  structureAdmin: {
    backgroundColor: theme.palette.secondary.dark,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

const ITEM_PER_PAGE = 10;

const AdminStructureUsersPage = ({ match: { path } }) => {
  const isStructureSpecific = path === '/admin/structureusers';

  const classes = useStyles();
  const [{ userId, isMobile }] = useAppContext();
  const [search, setSearch] = useState('');
  const [sortByDate, setSortByDate] = useState(false);
  const structure = useStructure();

  const [selectedStructureId, setSelectedStructureId] = useState(structure && structure._id ? structure._id : '');
  const {
    loading: structuresLoading,
    selectedStructure,
    structures,
  } = useAdminSelectedStructure({ selectedStructureId, setSelectedStructureId });

  const { changePage, page, items, total } = usePagination(
    'users.byStructure',
    { selectedStructureId, search, sort: sortByDate ? { lastLogin: -1 } : { lastName: 1 } },
    Meteor.users,
    {},
    { sort: sortByDate ? { lastLogin: -1 } : { lastName: 1 } },
    ITEM_PER_PAGE,
    [selectedStructureId, selectedStructureId != null],
  );
  // track structure admin users from structure id list (here, only the selected one)
  const { isLoading } = useTracker(() => {
    const roleshandlers = Meteor.subscribe('roles.adminStructureIds', {
      structureIds: [selectedStructureId],
    });
    const adminsIds = Meteor.roleAssignment
      .find({ scope: { $in: [selectedStructureId] }, 'role._id': 'adminStructure' })
      .fetch();

    return { isLoading: !roleshandlers.ready(), adminsStructure: adminsIds };
  }, [selectedStructureId]);

  const handleChangePage = (event, value) => {
    changePage(value);
  };
  const searchRef = useRef();
  const updateSearch = (e) => setSearch(e.target.value);
  const resetSearch = () => setSearch('');

  useEffect(() => {
    if (searchRef.current) searchRef.current.value = search;
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);
  const isStructureAdmin = (user) => Roles.userIsInRole(user._id, 'adminStructure', user.structure);
  const changeStructureAdmin = (user) => {
    const method = isStructureAdmin(user) ? 'users.unsetAdminStructure' : 'users.setAdminStructure';
    Meteor.call(method, { userId: user._id }, (error) => {
      if (error) msg.error(error.reason);
      else {
        msg.success(
          method === 'users.unsetAdminStructure'
            ? i18n.__('pages.AdminStructureUsersPage.successUnsetStructureAdmin')
            : i18n.__('pages.AdminStructureUsersPage.successSetStructureAdmin'),
        );
      }
    });
  };
  const loginInfo = (user) =>
    ` - ${
      user.lastLogin
        ? `${i18n.__('pages.AdminStructureUsersPage.loginInfo')} : ${user.lastLogin.toLocaleString()}`
        : i18n.__('pages.AdminStructureUsersPage.neverConnected')
    }`;
  const UserActions = ({ user }) => {
    return (
      <>
        <Tooltip
          title={
            isStructureAdmin(user)
              ? i18n.__('pages.AdminStructureUsersPage.unsetStructureAdmin')
              : i18n.__('pages.AdminStructureUsersPage.setStructureAdmin')
          }
          aria-label="add"
        >
          <IconButton
            edge="end"
            aria-label={isStructureAdmin(user) ? 'noadmin' : 'admin'}
            onClick={() => changeStructureAdmin(user)}
            size="large"
          >
            {isStructureAdmin(user) ? <ClearIcon /> : <GroupAddIcon />}
          </IconButton>
        </Tooltip>
      </>
    );
  };

  UserActions.propTypes = {
    user: PropTypes.objectOf(PropTypes.any).isRequired,
  };

  return (
    <Fade in>
      <Container className={classes.root}>
        {isLoading || structuresLoading ? (
          <Spinner />
        ) : (
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>
                {i18n.__('pages.AdminStructureUsersPage.title')}{' '}
                {selectedStructure && selectedStructure._id && selectedStructure.name}
                {` (${total})`}
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
              <SearchField
                updateSearch={updateSearch}
                search={search}
                inputRef={searchRef}
                resetSearch={resetSearch}
                label={i18n.__('pages.AdminStructureUsersPage.searchText')}
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
                    label={i18n.__('pages.AdminStructureUsersPage.sortByLastLogin')}
                    aria-label={i18n.__('pages.AdminStructureUsersPage.sortByLastLogin')}
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
                {items.map((user, i) => [
                  <ListItem alignItems="flex-start" key={`user-${user.emails[0].address}`}>
                    <ListItemAvatar>
                      <UserAvatar
                        customClass={isStructureAdmin(user) ? classes.structureAdmin : ''}
                        userAvatar={user.avatar || ''}
                        userFirstName={user.firstName}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}${
                        isStructureAdmin(user) ? ` (${i18n.__('pages.AdminStructureUsersPage.structureAdmin')})` : ''
                      } ${loginInfo(user)}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" className={classes.inline} color="textPrimary">
                            {user.emails[0].address}
                          </Typography>
                        </>
                      }
                    />
                    {user._id !== userId ? (
                      <ListItemSecondaryAction>
                        <UserActions user={user} />
                      </ListItemSecondaryAction>
                    ) : (
                      ' '
                    )}
                  </ListItem>,
                  i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                    <Divider variant="inset" component="li" key={`divider-${user.emails[0].address}`} />
                  ),
                ])}
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
    </Fade>
  );
};

AdminStructureUsersPage.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default AdminStructureUsersPage;
