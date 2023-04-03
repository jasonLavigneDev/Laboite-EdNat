import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import moment from 'moment';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@mui/material/ListItemText';
import ArrowBack from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useHistory } from 'react-router-dom';
import { usePagination } from '../../utils/hooks';
import { useAppContext } from '../../contexts/context';
import Spinner from '../../components/system/Spinner';
import Groups from '../../../api/groups/groups';

import Articles from '../../../api/articles/articles';
import { GroupPaginate, GroupListActions } from './common';
import { testMeteorSettingsUrl } from '../../utils/utilsFuncs';

export const useArticlesPageStyles = makeStyles()((theme) => ({
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
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    marginTop: 10,
    marginRight: 10,
    display: 'inline-block',
    alignItems: 'center',
  },
  ErrorPage: {
    textAlign: 'center',
  },
}));

const ITEM_PER_PAGE = 5;

const getArticleURL = (article) => {
  if (Meteor.settings.public.services.laboiteBlogURL !== '') {
    return `${testMeteorSettingsUrl(Meteor.settings.public.services.laboiteBlogURL, true)}articles/${article.slug}`;
  }
  return `${Meteor.absoluteUrl()}public/${Meteor.userId()}/${article.slug}`;
};

const GroupArticlesPage = ({ loading, group }) => {
  const [{ userId }] = useAppContext();
  const { slug } = group;
  const { classes } = useArticlesPageStyles();
  const history = useHistory();
  const [search, setSearch] = useState('');

  const { changePage, page, items, total } = usePagination(
    'groups.articles',
    { search, slug },
    Articles,
    {},
    { sort: { updatedAt: -1 } },
    ITEM_PER_PAGE,
  );

  const handleChangePage = (event, value) => {
    changePage(value);
  };
  const updateSearch = (e) => setSearch(e.target.value);
  const resetSearch = () => setSearch('');

  const userInGroup = Roles.userIsInRole(userId, ['member', 'animator', 'admin'], group._id);
  const blogPage = `${testMeteorSettingsUrl(Meteor.settings.public.services.laboiteBlogURL, true)}groups/${group.slug}`;

  const goBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={4}>
          <Grid className={classes.buttons} item xs={12} sm={12} md={12}>
            <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
              {i18n.__('pages.GroupArticlesPage.back')}
            </Button>
            {Meteor.settings.public.services.laboiteBlogURL ? (
              <Tooltip
                title={i18n.__(`pages.GroupArticlesPage.openPublicPage`)}
                aria-label={i18n.__(`pages.GroupArticlesPage.openPublicPage`)}
              >
                <Button
                  color="primary"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(blogPage, '_blank', 'noopener,noreferrer')}
                >
                  {i18n.__('pages.GroupArticlesPage.publicPage')}
                </Button>
              </Tooltip>
            ) : null}
          </Grid>
          {loading ? (
            <Spinner />
          ) : userInGroup || group.type === 0 ? (
            <>
              <Grid item xs={12} sm={12} md={6} style={{ display: 'flex' }}>
                <TextField
                  margin="normal"
                  id="search"
                  label={i18n.__('pages.GroupArticlesPage.searchText')}
                  name="search"
                  fullWidth
                  onChange={updateSearch}
                  type="text"
                  value={search}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton onClick={resetSearch} size="large">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              </Grid>
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
                    {items.map((article, i) => [
                      <ListItem alignItems="flex-start" key={`article-${article.slug}`}>
                        <LibraryBooksIcon className={classes.icon} />
                        <ListItemText
                          primary={`${article.title} - ${moment(article.updatedAt).format('DD/MM/YYYY hh:mm')}`}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                color="textPrimary"
                              >
                                {`${article.description}`}
                              </Typography>
                            </>
                          }
                        />

                        <GroupListActions
                          url={getArticleURL(article)}
                          title={i18n.__('pages.GroupArticlesPage.seeArticle')}
                        />
                      </ListItem>,
                      i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                        <Divider variant="inset" component="li" key={`divider-${article.slug}`} />
                      ),
                    ])}
                  </List>
                </Grid>
              ) : (
                <Grid item xs={12} sm={12} md={12}>
                  <p>{i18n.__('pages.GroupArticlesPage.noArticles')}</p>
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
            <p className={classes.ErrorPage}>{i18n.__('pages.GroupArticlesPage.noAccess')}</p>
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
    const subGroup = Meteor.subscribe('groups.single', { slug });
    const group = Groups.findOne({ slug }) || { slug: '' };
    const loading = !subGroup.ready();
    return {
      loading,
      group,
    };
  },
)(GroupArticlesPage);

GroupArticlesPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  group: PropTypes.objectOf(PropTypes.any).isRequired,
};
