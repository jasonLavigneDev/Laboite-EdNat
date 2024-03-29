import React, { useRef, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import i18n from 'meteor/universe:i18n';
import { Roles } from 'meteor/alanning:roles';
import { useTracker } from 'meteor/react-meteor-data';
// components
import Groups from '../../../api/groups/groups';
import GroupDetails from '../../components/groups/GroupDetails';
import { useAppContext } from '../../contexts/context';
import { usePagination } from '../../utils/hooks';
import GroupDetailsList from '../../components/groups/GroupDetailsList';
import CollapsingSearch from '../../components/system/CollapsingSearch';
import { useIconStyles, DetaiIconCustom, SimpleIconCustom } from '../../components/system/icons/icons';
import Spinner from '../../components/system/Spinner';
import { GRID_VIEW_MODE } from '../../utils/ui';
import { getGroupName } from '../../utils/utilsFuncs';

const useStyles = makeStyles()(() => ({
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGrid: {
    marginBottom: '0px',
    marginTop: '10px',
  },
  mobileButtonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0 !important',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  filterButton: {
    color: 'black',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkedButton: {
    color: 'black',
    display: 'flex',
    margin: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSpace: {
    marginLeft: 10,
  },
}));

const ITEM_PER_PAGE = 9;

function GroupsPage() {
  const [{ isMobile, groupPage, userId, user }, dispatch] = useAppContext();
  const [filterChecked, setFilterChecked] = React.useState(false);
  const history = useHistory();
  const { classes } = useStyles();
  const { classes: classesIcons } = useIconStyles();

  const canCreateGroup = user.groupCount < user.groupQuota;

  const { defaultGridViewMode = '' } = Meteor.settings.public?.ui || {};

  const { search = '', searchToggle = false, viewMode = GRID_VIEW_MODE[defaultGridViewMode] } = groupPage;
  const { changePage, page, items, total, loading } = !filterChecked
    ? usePagination('groups.all', { search }, Groups, {}, { sort: { name: 1 } }, ITEM_PER_PAGE)
    : usePagination('groups.memberOf', { search, userId }, Groups, {}, { sort: { name: 1 } }, ITEM_PER_PAGE);

  const animatorGroups = useTracker(() => Roles.getScopesForUser(userId, 'animator'));
  const memberGroups = useTracker(() => Roles.getScopesForUser(userId, 'member'));
  const candidateGroups = useTracker(() => Roles.getScopesForUser(userId, ['candidate']));
  const managedGroups = useTracker(() => Roles.getScopesForUser(userId, ['animator', 'admin']));
  const isAdmin = Roles.userIsInRole(userId, 'admin');

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
  useEffect(() => {
    if (page !== 1) {
      changePage(1);
    }
  }, [search]);

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'groupPage',
      data: {
        ...groupPage,
        [key]: value,
      },
    });

  const updateFilterCheck = () => {
    setFilterChecked(!filterChecked);
    changePage(1);
  };

  const toggleSearch = () => updateGlobalState('searchToggle', !searchToggle);
  const updateSearch = (e) => updateGlobalState('search', e.target.value);
  const resetSearch = () => updateGlobalState('search', '');
  const changeViewMode = (_, value) => updateGlobalState('viewMode', value);
  const checkEscape = (e) => {
    if (e.keyCode === 27) {
      // ESCAPE key
      groupPage.search = '';
      groupPage.searchToggle = false;
      updateGlobalState('searchToggle', false); // all groupPage values will be saved with this call
    }
  };
  const goToAddGroup = () => history.push('/admingroups/new');

  const filterGroups = (group) => {
    let searchText = getGroupName(group) + group.description + group.digest || '';
    searchText = searchText.toLowerCase();
    if (!search) return true;
    return searchText.indexOf(search.toLowerCase()) > -1;
  };
  const mapList = (func) => items.filter((group) => filterGroups(group)).map(func);

  const toggleButtons = (
    <ToggleButtonGroup value={viewMode} exclusive aria-label={i18n.__('pages.GroupsPage.viewMode')}>
      <ToggleButton
        value={GRID_VIEW_MODE.detail}
        onClick={changeViewMode}
        aria-label={i18n.__('pages.GroupsPage.viewDetail')}
      >
        <Tooltip title={i18n.__('pages.GroupsPage.viewDetail')}>
          <span className={classesIcons.size}>
            <DetaiIconCustom />
          </span>
        </Tooltip>
      </ToggleButton>
      <ToggleButton
        value={GRID_VIEW_MODE.compact}
        onClick={changeViewMode}
        aria-label={i18n.__('pages.GroupsPage.viewSimple')}
      >
        <Tooltip title={i18n.__('pages.GroupsPage.viewSimple')}>
          <span className={classesIcons.size}>
            <SimpleIconCustom />
          </span>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const filterSwitch = () => (
    <FormControlLabel
      control={<Switch checked={filterChecked} onChange={updateFilterCheck} name="filterSwitch" color="primary" />}
      label={i18n.__('pages.GroupsPage.filterGroup')}
      className={classes.leftSpace}
    />
  );

  return (
    <Fade in>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} className={isMobile ? null : classes.flex}>
            <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
              {`${i18n.__('pages.GroupsPage.title')} (${total})`}
              <Tooltip title={i18n.__('pages.GroupsPage.searchGroup')}>
                <IconButton onClick={toggleSearch} size="large">
                  <SearchIcon fontSize="large" />
                </IconButton>
              </Tooltip>

              {user.groupQuota > 0 && (
                <Tooltip
                  title={
                    canCreateGroup
                      ? i18n.__('pages.GroupsPage.addGroup')
                      : i18n.__('pages.AdminGroupsPage.materialTableLocalization.body_cantCreate')
                  }
                >
                  <span>
                    <IconButton onClick={goToAddGroup} disabled={!canCreateGroup} size="large">
                      <AddIcon fontSize="large" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}

              {!isMobile && filterSwitch()}
            </Typography>
            <div className={classes.spaceBetween}>{!isMobile && toggleButtons}</div>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <CollapsingSearch
            label={i18n.__('pages.GroupsPage.searchText')}
            updateSearch={updateSearch}
            checkEscape={checkEscape}
            resetSearch={resetSearch}
            searchToggle={searchToggle}
            search={search}
            inputRef={inputRef}
          />
          {isMobile && (
            <Grid item xs={12} sm={12} className={classes.mobileButtonContainer}>
              <div />
              {filterSwitch()}
              {toggleButtons}
            </Grid>
          )}
        </Grid>
        {loading ? (
          <Spinner />
        ) : total > 0 ? (
          <Grid container className={classes.cardGrid} spacing={isMobile ? 2 : 4}>
            {total > ITEM_PER_PAGE && (
              <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
              </Grid>
            )}
            {isMobile && viewMode === GRID_VIEW_MODE.compact
              ? mapList((group) => (
                  <Grid className={classes.gridItem} item key={group._id} xs={12} sm={12} md={6} lg={4}>
                    <GroupDetailsList
                      key={group.name}
                      group={group}
                      candidate={candidateGroups.includes(group._id)}
                      member={memberGroups.includes(group._id)}
                      animator={animatorGroups.includes(group._id)}
                      admin={isAdmin || managedGroups.includes(group._id)}
                    />
                  </Grid>
                ))
              : mapList((group) => (
                  <Grid className={classes.gridItem} item key={group._id} xs={12} sm={12} md={6} lg={4}>
                    <GroupDetails
                      key={group.name}
                      group={group}
                      isShort={!isMobile && viewMode === GRID_VIEW_MODE.compact}
                      candidate={candidateGroups.includes(group._id)}
                      member={memberGroups.includes(group._id)}
                      animator={animatorGroups.includes(group._id)}
                      admin={isAdmin || managedGroups.includes(group._id)}
                    />
                  </Grid>
                ))}
            {total > ITEM_PER_PAGE && (
              <Grid item xs={12} sm={12} md={12} lg={12} className={classes.pagination}>
                <Pagination count={Math.ceil(total / ITEM_PER_PAGE)} page={page} onChange={handleChangePage} />
              </Grid>
            )}
          </Grid>
        ) : (
          <p>{i18n.__('pages.GroupsPage.noGroup')}</p>
        )}
      </Container>
    </Fade>
  );
}

export default GroupsPage;
