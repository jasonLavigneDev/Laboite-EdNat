import React, { useRef, useEffect } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@mui/material/ListItemText';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import PollIcon from '@mui/icons-material/Poll';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { makeStyles } from 'tss-react/mui';
import { usePagination } from '../../utils/hooks';
import { useAppContext } from '../../contexts/context';
import Groups from '../../../api/groups/groups';
import Polls from '../../../api/polls/polls';
import Spinner from '../../components/system/Spinner';
import { GroupPaginate, GroupListActions } from './common';
import { testMeteorSettingsUrl } from '../../utils/utilsFuncs';
import EventsAgenda from '../../../api/eventsAgenda/eventsAgenda';
import Forms from '../../../api/forms/forms';

export const useExtServicePageStyles = makeStyles()((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(3),
  },
  list: {
    width: '100%',
  },
  inline: {
    display: 'inline',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
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

  iconTitle: {
    height: 45,
    width: 45,
  },
  cardGrid: {
    marginTop: theme.spacing(3),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },

  title: {
    marginLeft: theme.spacing(1),
  },
}));

const ITEM_PER_PAGE = 10;

const ExternalServiceGroupPage = ({ loading, group, slug, service }) => {
  const { classes } = useExtServicePageStyles();
  const history = useHistory();
  const [{ userId, extServicePage }, dispatch] = useAppContext();

  const getCollectionToCheck = () => {
    switch (service) {
      case 'events':
        return EventsAgenda;
      case 'polls':
        return Polls;
      case 'forms':
        return Forms;
      default:
        return null;
    }
  };

  const { search = '', searchToggle = false } = extServicePage;

  const getSortOfCollection = () => {
    switch (service) {
      case 'events':
        return { start: -1 };
      case 'polls':
        return { updatedAt: -1 };
      case 'forms':
        return { createdAt: -1 };
      default:
        return { createdAt: -1 };
    }
  };

  const { changePage, page, items, total } = usePagination(
    `groups.${service}`,
    { search, slug },
    getCollectionToCheck(),
    {},
    { sort: getSortOfCollection() },
    ITEM_PER_PAGE,
  );

  const userInGroup = Roles.userIsInRole(userId, ['member', 'animator', 'admin'], group._id);

  const inputRef = useRef(null);
  const handleChangePage = (event, value) => {
    changePage(value);
  };

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'extServicePage',
      data: {
        ...extServicePage,
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

  const getTitleOfAction = (item) => {
    if (service === 'polls') return `${i18n.__('pages.ExtService.seePoll')} ${item.title}`;
    if (service === 'events') return `${i18n.__('pages.ExtService.seeEvent')} ${item.title}`;
    if (service === 'forms') return `${i18n.__('pages.ExtService.seeForm')} ${item.title}`;
    return '';
  };

  const getUrlToDisplay = (item) => {
    if (service === 'polls')
      return `${testMeteorSettingsUrl(Meteor.settings.public.services.sondagesUrl)}/poll/answer/${item._id}?autologin`;
    if (service === 'events')
      return `${testMeteorSettingsUrl(Meteor.settings.public.services.agendaUrl)}/event/${item._id}`;
    if (service === 'forms')
      return `${testMeteorSettingsUrl(Meteor.settings.public.services.questionnaireURL)}/visualizer/${item._id}`;
    return '';
  };

  const getUrlForAdd = () => {
    if (service === 'polls')
      return `${testMeteorSettingsUrl(Meteor.settings.public.services.sondagesUrl)}/poll/new/1?groupId=${group._id}`;
    if (service === 'events')
      return `${testMeteorSettingsUrl(Meteor.settings.public.services.agendaUrl)}/add-event?groupId=${group._id}`;
    if (service === 'forms')
      return `${testMeteorSettingsUrl(Meteor.settings.public.services.questionnaireURL)}/builder/intro/?groupId=${
        group._id
      }`;
    return '';
  };

  const getAddActionTitle = () => {
    switch (service) {
      case 'forms':
        return i18n.__('pages.ExtService.addForm');
      case 'events':
        return i18n.__('pages.ExtService.addEvent');
      case 'polls':
        return i18n.__('pages.ExtService.addPoll');
      default:
        return '';
    }
  };

  const checkDate = (e) => {
    const dateEvent = e.end;
    const dateNow = new Date();

    return dateEvent >= dateNow;
  };

  const formatDate = (event) => {
    const newDateStart = moment(event.start).format('DD/MM/YYYY hh:mm');
    const newDateEnd = moment(event.end).format('DD/MM/YYYY hh:mm');

    const newDateStartAllDay = newDateStart.split(' ');
    const newDateEndAllDay = newDateEnd.split(' ');

    const dateFinal = event.allDay
      ? event.start.getDate() - event.end.getDate() === -1
        ? `${i18n.__('pages.ExtService.dayOf')} ${newDateStartAllDay[0]}`
        : `${i18n.__('pages.ExtService.daysOf', { start: newDateStartAllDay[0], end: newDateEndAllDay[0] })}`
      : `${newDateStart} -> ${newDateEnd}`;

    return dateFinal;
  };

  const getEventLocation = (event) => {
    return event.location === undefined ? ' ' : `- (${event.location})`;
  };

  const getItemTitle = (item) => {
    if (service === 'events') return `${item.title} ${getEventLocation(item)}`;
    return item.title;
  };

  const getItemIcon = (title) => {
    switch (service) {
      case 'polls':
        return <PollIcon className={title ? classes.iconTitle : classes.icon} />;
      case 'events':
        return <EventAvailableIcon className={title ? classes.iconTitle : classes.icon} />;
      case 'forms':
        return <ListAltIcon className={title ? classes.iconTitle : classes.icon} />;
      default:
        return null;
    }
  };

  const finalItems = service === 'events' ? items.filter((item) => checkDate(item)) : items;

  const getItemDescription = (item) => {
    if (service === 'events') return formatDate(item);
    return item.description;
  };

  const getTitlePage = () => {
    return i18n.__(`pages.ExtService.title.${service}`);
  };

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12}>
            <Button color="primary" startIcon={<ArrowBack />} onClick={history.goBack}>
              {i18n.__('pages.ExtService.back')}
            </Button>
            <Grid item xs={12} sm={12} md={6} className={classes.cardGrid}>
              <div className={classes.titleContainer}>
                {getItemIcon(true)}
                <div className={classes.title}>
                  <Typography variant="h4">{getTitlePage(group)}</Typography>
                </div>
              </div>
            </Grid>
          </Grid>
          {loading ? (
            <Spinner />
          ) : userInGroup || group.type === 0 ? (
            <>
              <Grid item xs={12} sm={12} md={6} style={{ display: 'flex' }}>
                <TextField
                  margin="normal"
                  id="search"
                  label={i18n.__('pages.ExtService.searchText')}
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
                {userInGroup && (
                  <IconButton
                    onClick={() => window.open(getUrlForAdd(), '_blank')}
                    size="large"
                    title={getAddActionTitle()}
                    style={{ paddingLeft: '20px', paddingRight: '20px' }}
                  >
                    <AddIcon fontSize="large" />
                  </IconButton>
                )}
              </Grid>
              <GroupPaginate
                total={total}
                nbItems={ITEM_PER_PAGE}
                cls={classes.pagination}
                page={page}
                handler={handleChangePage}
              />
              {finalItems.length > 0 ? (
                <Grid item xs={12} sm={12} md={12}>
                  <List className={classes.list} disablePadding>
                    {finalItems.map((item) => [
                      <Paper sx={{ marginBottom: '1vh', minHeight: '7vh' }}>
                        <ListItem alignItems="flex-start" key={`user-${item.title}`}>
                          {getItemIcon(false)}
                          <ListItemText
                            primary={getItemTitle(item)}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  className={classes.inline}
                                  color="textPrimary"
                                >
                                  {getItemDescription(item)}
                                </Typography>
                              </>
                            }
                          />

                          <GroupListActions url={getUrlToDisplay(item)} title={getTitleOfAction(item)} />
                        </ListItem>
                      </Paper>,
                    ])}
                  </List>
                </Grid>
              ) : (
                <Grid item xs={12} sm={12} md={12}>
                  <p>{i18n.__('pages.ExtService.noElements')}</p>
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
            <p className={classes.ErrorPage}>{i18n.__('pages.ExtService.noAccess')}</p>
          )}
        </Grid>
      </Container>
    </Fade>
  );
};

export default withTracker(
  ({
    match: {
      params: { slug, service },
    },
  }) => {
    const subGroup = Meteor.subscribe('groups.single', { slug });
    const group = Groups.findOne({ slug }) || { slug: '' };
    const loading = !subGroup.ready();
    return {
      loading,
      group,
      slug,
      service,
    };
  },
)(ExternalServiceGroupPage);

ExternalServiceGroupPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  slug: PropTypes.string.isRequired,
  service: PropTypes.string.isRequired,
};
