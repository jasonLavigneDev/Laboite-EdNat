import React, { useRef, useEffect } from 'react';
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
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import PollIcon from '@mui/icons-material/Poll';
import { useHistory } from 'react-router-dom';
import { usePagination } from '../../utils/hooks';
import { useAppContext } from '../../contexts/context';
import Groups from '../../../api/groups/groups';
import Polls from '../../../api/polls/polls';
import Spinner from '../../components/system/Spinner';
import { GroupSearch, GroupPaginate, GroupListActions } from './common';
import { useEvenstPageStyles } from './EventsPage';

const ITEM_PER_PAGE = 10;

const PollPage = ({ loading, group, slug }) => {
  const classes = useEvenstPageStyles();
  const history = useHistory();
  const [{ userId, pollPage }, dispatch] = useAppContext();

  const { search = '', searchToggle = false } = pollPage;

  const { changePage, page, items, total } = usePagination(
    'groups.polls',
    { search, slug },
    Polls,
    {},
    { sorted: { title: -1 } },
    ITEM_PER_PAGE,
  );

  const userInGroup = Roles.userIsInRole(userId, ['member', 'animator', 'admin'], group._id);

  const inputRef = useRef(null);
  const handleChangePage = (event, value) => {
    changePage(value);
  };

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'pollPage',
      data: {
        ...pollPage,
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

  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12}>
            <Button color="primary" startIcon={<ArrowBack />} onClick={history.goBack}>
              {i18n.__('pages.Polls.back')}
            </Button>
          </Grid>
          {loading ? (
            <Spinner />
          ) : userInGroup || group.type === 0 ? (
            <>
              <GroupSearch
                update={updateSearch}
                reset={resetSearch}
                search={search}
                label={i18n.__('pages.Polls.searchText')}
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
                    {items.map((poll, i) => [
                      <ListItem alignItems="flex-start" key={`user-${poll.title}`}>
                        <PollIcon className={classes.icon} />
                        <ListItemText
                          primary={`${poll.title}`}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                color="textPrimary"
                              >
                                {poll.description}
                              </Typography>
                            </>
                          }
                        />

                        <GroupListActions
                          url={`${Meteor.settings.public.services.sondagesUrl}/poll/answer/${poll._id}?autologin`}
                          title={`${i18n.__('pages.Polls.seePoll')} ${poll.title}`}
                        />
                      </ListItem>,
                      i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                        <Divider variant="inset" component="li" key={`divider-${poll.title}`} />
                      ),
                    ])}
                  </List>
                </Grid>
              ) : (
                <Grid item xs={12} sm={12} md={12}>
                  <p>{i18n.__('pages.Polls.noPoll')}</p>
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
            <p className={classes.ErrorPage}>{i18n.__('pages.Polls.noAccess')}</p>
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
      slug,
    };
  },
)(PollPage);

PollPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  slug: PropTypes.string.isRequired,
};
