import React, { useEffect, useRef, useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@mui/material/ListItemText';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { makeStyles } from 'tss-react/mui';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LanguageIcon from '@mui/icons-material/Language';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SendIcon from '@mui/icons-material/Send';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../../contexts/context';
import { usePagination } from '../../utils/hooks';
import UserAvatar from '../../components/users/UserAvatar';
import Spinner from '../../components/system/Spinner';
import Groups from '../../../api/groups/groups';
import { getStructure } from '../../../api/structures/hooks';
import { GroupSearch, GroupPaginate } from './common';

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
  upbuttons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeselect: {
    minWidth: '180px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  ErrorPage: {
    textAlign: 'center',
  },
}));

const ITEM_PER_PAGE = 10;

const AddressBook = ({ loading, group, slug }) => {
  const { classes } = useStyles();
  const history = useHistory();
  const [{ userId, addressBookPage }, dispatch] = useAppContext();
  const { search = '', searchToggle = false } = addressBookPage;
  const [userType, setUserType] = useState('all');
  const userTypes = ['all', 'animators', 'admins'];
  const { changePage, page, items, total } = usePagination(
    'users.group',
    { search, slug, userType },
    Meteor.users,
    {},
    { sort: { lastName: 1 } },
    ITEM_PER_PAGE,
  );

  const userInGroup = Roles.userIsInRole(userId, ['member', 'animator', 'admin'], group._id);

  const inputRef = useRef(null);
  const handleChangePage = (event, value) => {
    changePage(value);
  };

  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);
  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'addressBookPage',
      data: {
        ...addressBookPage,
        [key]: value,
      },
    });
  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  const updateSearch = (e) => updateGlobalState('search', e.target.value);
  const resetSearch = () => updateGlobalState('search', '');

  const handleUserType = (evt) => {
    setUserType(evt.target.value);
  };

  const { disabledFeatures = {} } = Meteor.settings.public;
  const enableBlog = !disabledFeatures.blog;
  const authorBlogPage = Meteor.settings.public.laboiteBlogURL
    ? `${Meteor.settings.public.laboiteBlogURL}/authors/`
    : `${Meteor.absoluteUrl()}public/`;

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12}>
            <div className={classes.upbuttons}>
              <Button color="primary" startIcon={<ArrowBack />} onClick={history.goBack}>
                {i18n.__('pages.AddressBook.back')}
              </Button>
              <FormControl>
                <InputLabel id="usertype-selector-label">{i18n.__('pages.AddressBook.userType')}</InputLabel>
                <Select
                  className={classes.typeselect}
                  labelId="usertype-selector-label"
                  id="usertype-selector"
                  name="usertype"
                  variant="outlined"
                  label={i18n.__('pages.AddressBook.userType')}
                  value={userType}
                  onChange={handleUserType}
                >
                  {userTypes.map((usertype) => (
                    <MenuItem value={usertype} key={`select_${usertype}`}>
                      {i18n.__(`api.groups.labels.${usertype}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </Grid>
          {loading ? (
            <Spinner />
          ) : userInGroup || group.type === 0 ? (
            <>
              <GroupSearch
                update={updateSearch}
                reset={resetSearch}
                search={search}
                label={i18n.__('pages.AddressBook.searchText')}
              />
              <GroupPaginate
                total={total}
                nbItems={ITEM_PER_PAGE}
                cls={classes.pagination}
                page={page}
                handler={handleChangePage}
              />
              {items.length > 0 ? (
                <Grid item xs={12} sm={12} md={12}>
                  <List className={classes.list} disablePadding>
                    {items.map((user, i) => {
                      const structure = getStructure(user.structure);

                      return [
                        <ListItem alignItems="flex-start" key={`user-${user.emails[0].address}`}>
                          <ListItemAvatar>
                            <UserAvatar userAvatar={user.avatar || ''} userFirstName={user.firstName} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${user.firstName} ${user.lastName}`}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  className={classes.inline}
                                  color="textPrimary"
                                >
                                  {user.emails[0].address}
                                </Typography>
                                {structure.name
                                  ? ` - ${structure.name}`
                                  : ` - ${i18n.__('pages.AddressBook.noStructure')}`}
                              </>
                            }
                          />

                          <ListItemSecondaryAction>
                            {user.mezigName ? (
                              <Tooltip
                                title={`${i18n.__('pages.AddressBook.goToMezig')} ${user.firstName}`}
                                aria-label="add"
                              >
                                <IconButton
                                  edge="end"
                                  aria-label="comments"
                                  onClick={() =>
                                    window.open(
                                      `${Meteor.settings.public.services.mezigUrl}/profil/${user.mezigName}`,
                                      '_blank',
                                    )
                                  }
                                  size="large"
                                >
                                  <LanguageIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            {enableBlog && user.articlesCount !== 0 ? (
                              <Tooltip
                                title={`${i18n.__('pages.AddressBook.goToBlog')} ${user.firstName}`}
                                aria-label="add"
                              >
                                <IconButton
                                  edge="end"
                                  aria-label="comments"
                                  onClick={() => window.open(`${authorBlogPage}${user._id}`, '_blank')}
                                  size="large"
                                >
                                  <LibraryBooksIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            <Tooltip
                              title={`${i18n.__('pages.AddressBook.sendEmail')} ${user.firstName}`}
                              aria-label="add"
                            >
                              <IconButton
                                edge="end"
                                aria-label="comments"
                                href={`mailto:${user.emails[0].address}`}
                                size="large"
                              >
                                <SendIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>,
                        i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                          <Divider variant="inset" component="li" key={`divider-${user.emails[0].address}`} />
                        ),
                      ];
                    })}
                  </List>
                </Grid>
              ) : (
                <Grid item xs={12} sm={12} md={12}>
                  <p>{i18n.__('pages.AddressBook.noUsers')}</p>
                </Grid>
              )}
              <GroupPaginate
                total={total}
                nbItems={ITEM_PER_PAGE}
                cls={classes.pagination}
                page={page}
                handler={handleChangePage}
              />
            </>
          ) : (
            <p className={classes.ErrorPage}>{i18n.__('pages.AddressBook.noAccess')}</p>
          )}
        </Grid>
      </Container>
    </Fade>
  );
};

export default withTracker(
  ({
    match: {
      params: { slug },
    },
  }) => {
    const structuresHandle = Meteor.subscribe('structures.all');
    const subGroup = Meteor.subscribe('groups.single', { slug });
    const group = Groups.findOne({ slug }) || { slug: '' };
    const loading = !subGroup.ready() && !structuresHandle.ready();
    return {
      loading,
      group,
      slug,
    };
  },
)(AddressBook);

AddressBook.propTypes = {
  loading: PropTypes.bool.isRequired,
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  slug: PropTypes.string.isRequired,
};
