import React, { useEffect, useRef } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Typography from '@material-ui/core/Typography';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import LanguageIcon from '@material-ui/icons/Language';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import SendIcon from '@material-ui/icons/Send';
import Pagination from '@material-ui/lab/Pagination';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../../contexts/context';
import { usePagination } from '../../utils/hooks';
import UserAvatar from '../../components/users/UserAvatar';
import SearchField from '../../components/system/SearchField';
import Spinner from '../../components/system/Spinner';
import Groups from '../../../api/groups/groups';
import { getStructure } from '../../../api/structures/hooks';

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
  const classes = useStyles();
  const history = useHistory();
  const [{ userId, addressBookPage }, dispatch] = useAppContext();
  const { search = '', searchToggle = false } = addressBookPage;

  const { changePage, page, items, total } = usePagination(
    'users.group',
    { search, slug },
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

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'addressBookPage',
      data: {
        ...addressBookPage,
        [key]: value,
      },
    });

  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);
  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  const updateSearch = (e) => updateGlobalState('search', e.target.value);
  const resetSearch = () => updateGlobalState('search', '');

  const goBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

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
            <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
              {i18n.__('pages.AddressBook.back')}
            </Button>
          </Grid>
          {loading ? (
            <Spinner />
          ) : userInGroup || group.type === 0 ? (
            <>
              <Grid item xs={12} sm={12} md={6}>
                <SearchField
                  updateSearch={updateSearch}
                  search={search}
                  resetSearch={resetSearch}
                  label={i18n.__('pages.AddressBook.searchText')}
                />
              </Grid>
              {total > ITEM_PER_PAGE && (
                <Grid item xs={12} sm={12} md={6} lg={6} className={classes.pagination}>
                  <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                </Grid>
              )}
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
                                {structure.name !== undefined ? ` - ${structure.name}` : null}
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
                                >
                                  <LibraryBooksIcon />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                            <Tooltip
                              title={`${i18n.__('pages.AddressBook.sendEmail')} ${user.firstName}`}
                              aria-label="add"
                            >
                              <IconButton edge="end" aria-label="comments" href={`mailto:${user.emails[0].address}`}>
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
              {total > ITEM_PER_PAGE && (
                <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                  <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
                </Grid>
              )}
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
