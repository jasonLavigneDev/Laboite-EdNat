import React, { useRef, useEffect } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import i18n from 'meteor/universe:i18n';
import ListItemText from '@mui/material/ListItemText';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useHistory } from 'react-router-dom';
import { usePagination } from '../../utils/hooks';
import { useAppContext } from '../../contexts/context';
import Groups from '../../../api/groups/groups';
import Forms from '../../../api/forms/forms';
import Spinner from '../../components/system/Spinner';
import { GroupPaginate, GroupListActions } from './common';
import { useEvenstPageStyles } from './EventsPage';
import { testMeteorSettingsUrl } from '../../utils/utilsFuncs';

const ITEM_PER_PAGE = 10;

const NO_REPLIE = 1;
const ALREADY_REPLIE = 2;
const REPLIE_NO_EDITABLE = 3;

const FormsPage = ({ loading, group, slug }) => {
  const { classes } = useEvenstPageStyles();
  const history = useHistory();
  const [{ userId, formsPage }, dispatch] = useAppContext();

  const { search = '', searchToggle = false } = formsPage;

  const { changePage, page, items, total } = usePagination(
    'groups.forms',
    { search, slug },
    Forms,
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
      type: 'formsPage',
      data: {
        ...formsPage,
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

  const userAlreadyReplied = (form) => {
    if (!form.formAnswers || form.formAnswers.length === 0) return false;
    const { formAnswers } = form;
    return !!formAnswers.find((answer) => answer.userId === userId);
  };

  const getAnswerType = (form) => {
    if (userAlreadyReplied(form) && form.editableAnswers) return ALREADY_REPLIE;
    if (userAlreadyReplied(form) && !form.editableAnswers) return REPLIE_NO_EDITABLE;
    return NO_REPLIE;
  };

  const getAnswerURL = (type, form) => {
    if (type === REPLIE_NO_EDITABLE) return '';
    return `${testMeteorSettingsUrl(Meteor.settings.public.services.questionnaireURL)}/visualizer/${form._id}`;
  };

  const getTitleOfAction = (form) => {
    const type = getAnswerType(form);
    switch (type) {
      case NO_REPLIE:
        return `${i18n.__('pages.Forms.seeForm')} ${form.title}`;
      case ALREADY_REPLIE:
        return `${i18n.__('pages.Forms.seeFormForEdit')} ${form.title}`;
      case REPLIE_NO_EDITABLE:
        return `${i18n.__('pages.Forms.blockForm')} ${form.title}`;
      default:
        return `${i18n.__('pages.Forms.seeForm')} ${form.title}`;
    }
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
          <Grid item xs={12} sm={12} md={12}>
            <Button color="primary" startIcon={<ArrowBack />} onClick={history.goBack}>
              {i18n.__('pages.Forms.back')}
            </Button>
          </Grid>
          {loading ? (
            <Spinner />
          ) : userInGroup || group.type === 0 ? (
            <>
              <Grid item xs={12} sm={12} md={6} style={{ display: 'flex' }}>
                <TextField
                  margin="normal"
                  id="search"
                  label={i18n.__('pages.Forms.searchText')}
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
                    onClick={() =>
                      window.open(
                        `${testMeteorSettingsUrl(
                          Meteor.settings.public.services.questionnaireURL,
                        )}/builder/intro/?groupId=${group._id}`,
                        '_blank',
                      )
                    }
                    size="large"
                    title={i18n.__('pages.GroupsPage.addForm')}
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
              {items.length > 0 ? (
                <Grid item xs={12} sm={12} md={12}>
                  <List className={classes.list} disablePadding>
                    {items.map((form, i) => [
                      <ListItem alignItems="flex-start" key={`user-${form.title}`}>
                        <ListAltIcon className={classes.icon} />
                        <ListItemText
                          primary={`${form.title}`}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                color="textPrimary"
                              >
                                {form.desc}
                              </Typography>
                            </>
                          }
                        />

                        <GroupListActions
                          url={getAnswerURL(getAnswerType(form), form)}
                          title={getTitleOfAction(form)}
                          disable={getAnswerType(form) === REPLIE_NO_EDITABLE}
                        />
                      </ListItem>,
                      i < ITEM_PER_PAGE - 1 && i < total - 1 && (
                        <Divider variant="inset" component="li" key={`divider-${form.title}`} />
                      ),
                    ])}
                  </List>
                </Grid>
              ) : (
                <Grid item xs={12} sm={12} md={12}>
                  <p>{i18n.__('pages.Forms.noForm')}</p>
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
            <p className={classes.ErrorPage}>{i18n.__('pages.Forms.noAccess')}</p>
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
)(FormsPage);

FormsPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  slug: PropTypes.string.isRequired,
};
