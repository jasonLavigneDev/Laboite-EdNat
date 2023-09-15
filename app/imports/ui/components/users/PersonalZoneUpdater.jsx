import React, { useEffect, useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Container from '@mui/material/Container';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import i18n from 'meteor/universe:i18n';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

import Switch from '@mui/material/Switch';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import AddBoxIcon from '@mui/icons-material/AddBox';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import Groups from '../../../api/groups/groups';
import Services from '../../../api/services/services';
import Spinner from '../system/Spinner';
import PersonalZone from '../personalspace/PersonalZone';
import Animation from '../screencast/Animation';
import { useAppContext } from '../../contexts/context';
import UserBookmarks from '../../../api/userBookmarks/userBookmarks';
import CollapsingSearch from '../system/CollapsingSearch';
import Bookmarks from '../../../api/bookmarks/bookmarks';

const { disabledFeatures } = Meteor.settings.public;

const useStyles = (isMobile) =>
  makeStyles()((theme) => ({
    small: {
      padding: '5px !important',
      transition: 'all 300ms ease-in-out',
    },
    search: {
      marginBottom: 20,
      marginLeft: 16,
    },

    mobileButtonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '0 !important',
    },
    zoneButtonContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    flex: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
    },
    flexGrow: {},
    cardGrid: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
    },
    chip: {
      margin: theme.spacing(1),
    },
    badge: { position: 'inherit' },
    modeEdition: { width: 'max-content' },
    gridItem: {
      position: 'relative',
      '&.sortable-ghost': { opacity: 0.3 },
    },
    ghost: {
      opacity: '1 !important',
    },
    titleButtons: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    handle: {
      cursor: 'grab',
      position: 'absolute',
      textAlign: 'center',
      width: 'calc(100% - 32px)',
      backgroundColor: theme.palette.primary.main,
      opacity: 0.2,
      height: 20,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderTopRightRadius: theme.shape.borderRadius,
      '&::after': {
        content: '""',
        width: '80%',
        height: '3px',
        backgroundColor: 'white',
        display: 'inline-block',
        marginBottom: '3px',
        borderRadius: theme.shape.borderRadius,
      },
    },
    zoneButtonEnd: {
      opacity: 0.7,
      textTransform: 'none',
      width: '75%',
      cursor: 'pointer',
      '&:hover': {
        opacity: 1,
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.tertiary.main,
      },
    },
    divider: {
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: '#cbd0ed',
    },
    goIcon: {
      marginLeft: 8,
      verticalAlign: 'bottom',
    },
    castTuto: {
      marginTop: 30,
      marginBottom: 15,
    },
    screen: {
      padding: 10,
      display: 'flex',
      justifyContent: 'flex-end',
    },
  }));
function PersonalZoneUpdater({
  personalspace,
  isLoading,
  allServices,
  allGroups,
  allLinks,
  allGroupLinks,
  appSettingsValues,
  edition,
  handleEditionData,
}) {
  const AUTOSAVE_INTERVAL = 3000;
  const [{ user, loadingUser, isMobile }] = useAppContext();
  const [customDrag, setcustomDrag] = useState(false || edition);
  const [search, setSearch] = useState('');
  const [searchToggle, setSearchToggle] = useState(false);
  const { classes } = useStyles(isMobile)();
  const inputRef = useRef(null);

  const updateSearch = (e) => {
    setSearch(e.target.value);
  };
  const checkEscape = (e) => {
    if (e.keyCode === 27) {
      // ESCAPE key
      setSearchToggle(false);
      setSearch('');
    }
  };
  const resetSearch = () => setSearch('');
  const toggleSearch = () => setSearchToggle(!searchToggle);

  const filterSearch = (element) => {
    if (!search) return true;
    let searchText = '';
    switch (element.type) {
      case 'service': {
        const service = Services.findOne(element.element_id);
        searchText = service !== undefined ? service.title : '';
        break;
      }
      case 'group': {
        const group = Groups.findOne(element.element_id);
        searchText = group !== undefined ? group.name : '';
        break;
      }
      case 'link': {
        const userBookmark = UserBookmarks.findOne(element.element_id);
        searchText = userBookmark !== undefined ? `${userBookmark.name} ${userBookmark.url}` : '';
        break;
      }
      case 'groupLink': {
        const Bookmark = Bookmarks.findOne(element.element_id);
        searchText = Bookmark !== undefined ? `${Bookmark.name} ${Bookmark.url}` : '';
        break;
      }
      default:
        searchText = '';
        break;
    }
    searchText = searchText.toLowerCase();
    return searchText.indexOf(search.toLowerCase()) > -1;
  };

  const filterLink = (element) => {
    return element.type === 'link';
  };

  const filterGroupLink = (element) => {
    return element.type === 'groupLink';
  };

  const filterGroup = (element) => {
    return element.type === 'group';
  };

  const filterService = (element) => {
    if (element.type === 'service') {
      const service = Services.findOne({ _id: element.element_id });
      if (service?.state !== 10) {
        // 10 = service hide //
        return true;
      }
    }
    return false;
  };

  const doNotDisplayHidenServices = (element) => {
    return filterService(element) || filterGroup(element) || filterLink(element) || filterGroupLink(element);
  };
  // focus on search input when it appears
  useEffect(() => {
    if (inputRef.current && searchToggle) {
      inputRef.current.focus();
    }
  }, [searchToggle]);

  const handleCustomDrag = (event) => {
    if (event.target.checked) {
      setSearchToggle(false);
      setSearch('');
    }
    setcustomDrag(event.target.checked);
  };

  const [localPS, setLocalPS] = useState(personalspace);
  useEffect(() => {
    if (personalspace && allServices && allGroups && allLinks && allGroupLinks) {
      // Called once
      Meteor.call('personalspaces.checkPersonalSpace', {}, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (personalspace && allServices && allGroups && allLinks && allGroupLinks) {
      setLocalPS(personalspace);
    }
  }, [personalspace]);

  const updatePersonalSpace = () => {
    if (edition) {
      handleEditionData(localPS);
    } else {
      Meteor.call('personalspaces.updatePersonalSpace', { data: localPS }, (err) => {
        if (err) {
          msg.error(err.reason);
        }
      });
    }
  };

  const [psNeedUpdate, setPsNeedUpdate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (psNeedUpdate) {
        updatePersonalSpace();
        setPsNeedUpdate(false);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearTimeout(timer);
  }, [psNeedUpdate]);

  const setExpanded = (index) => {
    if (typeof index === 'number') {
      const { sorted } = localPS;
      sorted[index].isExpanded = !sorted[index].isExpanded;
      setLocalPS({ ...localPS, sorted });
      setPsNeedUpdate(true);
    }
  };

  const setZoneTitle = (index, title) => {
    if (typeof index === 'number') {
      const { sorted } = localPS;
      if (sorted[index].name !== title) {
        sorted[index].name = title.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        setLocalPS({ ...localPS, sorted });
        setPsNeedUpdate(true);
      }
    }
  };

  const setZoneList = (type) => (index) => (list) => {
    if (typeof index === 'number') {
      const { sorted } = localPS;
      if (list) {
        sorted[index].elements = list;
        const newData = { ...localPS, sorted };
        setLocalPS(newData);
        if (edition) {
          handleEditionData(newData);
        }
      }
    } else if (type === 'service') {
      setLocalPS({
        ...localPS,
        unsorted: [
          ...list,
          ...localPS.unsorted.filter(filterGroupLink),
          ...localPS.unsorted.filter(filterGroup),
          ...localPS.unsorted.filter(filterLink),
        ],
      });
    } else if (type === 'link') {
      setLocalPS({
        ...localPS,
        unsorted: [
          ...list,
          ...localPS.unsorted.filter(filterGroupLink),
          ...localPS.unsorted.filter(filterGroup),
          ...localPS.unsorted.filter(filterService),
        ],
      });
    } else if (type === 'groupLink') {
      setLocalPS({
        ...localPS,
        unsorted: [
          ...list,
          ...localPS.unsorted.filter(filterLink),
          ...localPS.unsorted.filter(filterGroup),
          ...localPS.unsorted.filter(filterService),
        ],
      });
    } else {
      setLocalPS({
        ...localPS,
        unsorted: [
          ...list,
          ...localPS.unsorted.filter(filterGroupLink),
          ...localPS.unsorted.filter(filterService),
          ...localPS.unsorted.filter(filterLink),
        ],
      });
    }
  };

  const suspendUpdate = () => {
    // Called on onStart event of reactsortable zone
    setPsNeedUpdate(false); // will be true again on end drag event (updateList)
  };

  const updateList = () => {
    // Called on onEnd event of reactsortable zone
    setPsNeedUpdate(true);
  };

  const delZone = (index) => {
    const { sorted } = localPS;
    sorted.splice(index, 1);
    setLocalPS({ ...localPS, sorted });
    setPsNeedUpdate(true);
  };

  const upZone = (zoneIndex) => {
    const { sorted } = localPS;
    const movedItem = sorted[zoneIndex];
    const remainingItems = sorted.filter((item, index) => index !== zoneIndex);

    setLocalPS({
      ...localPS,
      sorted: [...remainingItems.slice(0, zoneIndex - 1), movedItem, ...remainingItems.slice(zoneIndex - 1)],
    });
    setPsNeedUpdate(true);
  };

  const downZone = (zoneIndex) => {
    const { sorted } = localPS;
    const movedItem = sorted[zoneIndex];
    const remainingItems = sorted.filter((item, index) => index !== zoneIndex);

    setLocalPS({
      ...localPS,
      sorted: [...remainingItems.slice(0, zoneIndex + 1), movedItem, ...remainingItems.slice(zoneIndex + 1)],
    });
    setPsNeedUpdate(true);
  };

  const addZone = (where) => {
    const { sorted } = localPS;
    const newZone = {
      zone_id: Random.id(),
      name: i18n.__('pages.PersonalPage.newZone'),
      isExpanded: true,
      elements: [],
    };
    if (where === 0) {
      sorted.unshift(newZone);
    } else {
      sorted.push(newZone);
    }
    setLocalPS({ ...localPS, sorted });
    setPsNeedUpdate(true);
  };

  const handleNeedUpdate = () => {
    // Call by elements when click on handleBackToDefault
    setPsNeedUpdate(false);
  };

  const notReady = isLoading || loadingUser;
  const { personalSpace = {} } = appSettingsValues;

  return (
    <>
      {notReady ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container className={classes.cardGrid}>
            <Grid container spacing={4} className={classes.cardGrid}>
              <Grid item xs={12} sm={12} md={12} className={classes.flex}>
                <Grid container alignItems="center" spacing={1} style={{ paddingBottom: '2%' }}>
                  {!edition && (
                    <Grid item>
                      <Typography variant={isMobile ? 'h5' : 'h4'}>{i18n.__('pages.PersonalPage.welcome')}</Typography>
                    </Grid>
                  )}
                  <Grid item style={isMobile ? { width: '100%' } : { flexGrow: 1 }}>
                    <Grid container className={classes.titleButtons}>
                      {!edition && (
                        <Grid item style={{ flexGrow: 1 }}>
                          <Tooltip title={i18n.__('pages.PersonalPage.searchElement')}>
                            <IconButton onClick={toggleSearch} disabled={customDrag}>
                              <SearchIcon fontSize="large" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      )}
                      {user.advancedPersonalPage && !edition ? (
                        <Grid item>
                          <Grid
                            className={classes.modeEdition}
                            component="label"
                            container
                            alignItems="center"
                            spacing={1}
                            title={i18n.__('pages.PersonalPage.toggleEdition')}
                          >
                            <Grid item>
                              <LockIcon color="primary" />
                            </Grid>
                            <Grid item>
                              <Switch
                                checked={customDrag}
                                onChange={handleCustomDrag}
                                value="customDrag"
                                color="primary"
                              />
                            </Grid>
                            <Grid item>
                              <EditIcon color="primary" />
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : null}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <CollapsingSearch
                  classes={searchToggle ? classes.search : classes.small}
                  label={i18n.__('pages.PersonalPage.searchText')}
                  updateSearch={updateSearch}
                  checkEscape={checkEscape}
                  resetSearch={resetSearch}
                  searchToggle={searchToggle}
                  search={search}
                  inputRef={inputRef}
                />
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              {!edition && localPS.unsorted.length === 0 && localPS.sorted.length === 0 ? (
                <Grid item md={12} xs={12}>
                  <Paper className={classes.expansionpanel}>
                    {personalSpace?.content?.length > 0 && !personalSpace?.external && (
                      <div
                        style={{ padding: '10px' }}
                        dangerouslySetInnerHTML={{ __html: personalSpace?.content || '' }}
                      />
                    )}
                    {personalSpace?.external && personalSpace?.link && (
                      <Animation videoLink={personalSpace?.link} notReady={notReady} />
                    )}
                    <Divider />
                    <div className={classes.screen}>
                      <Link to="/services">
                        <Button variant="contained" color="primary">
                          {i18n.__('pages.PersonalPage.noFavYet')}
                          <NavigateNextIcon className={classes.goIcon} />
                        </Button>
                      </Link>
                    </div>
                  </Paper>
                </Grid>
              ) : null}
            </Grid>
            {!edition &&
            !disabledFeatures.groups &&
            localPS.unsorted.filter(filterSearch).filter(filterGroup).length !== 0
              ? [
                  <PersonalZone
                    key="zone-favGroup-000000000000"
                    elements={localPS.unsorted.filter(filterSearch).filter(filterGroup)}
                    title={i18n.__('pages.PersonalPage.unsortedGroup')}
                    setList={setZoneList('group')}
                    suspendUpdate={suspendUpdate}
                    updateList={updateList}
                    customDrag={customDrag}
                    needUpdate={handleNeedUpdate}
                  />,
                ]
              : null}
            {!edition && localPS.unsorted.filter(filterSearch).filter(filterService).length !== 0
              ? [
                  <PersonalZone
                    key="zone-favService-000000000000"
                    elements={localPS.unsorted.filter(filterSearch).filter(filterService)}
                    title={i18n.__('pages.PersonalPage.unsortedService')}
                    setList={setZoneList('service')}
                    suspendUpdate={suspendUpdate}
                    updateList={updateList} // setAskToCreateNewBookMark(true);
                    customDrag={customDrag}
                    needUpdate={handleNeedUpdate}
                  />,
                ]
              : null}
            {!edition && localPS.unsorted.filter(filterSearch).filter(filterLink).length !== 0
              ? [
                  <PersonalZone
                    key="zone-favUserBookmark-000000000000"
                    elements={localPS.unsorted.filter(filterSearch).filter(filterLink)}
                    title={i18n.__('pages.PersonalPage.unsortedLinks')}
                    setList={setZoneList('link')}
                    suspendUpdate={suspendUpdate}
                    updateList={updateList}
                    customDrag={customDrag}
                    needUpdate={handleNeedUpdate}
                  />,
                ]
              : null}
            {!edition && localPS.unsorted.filter(filterSearch).filter(filterGroupLink).length !== 0
              ? [
                  <PersonalZone
                    key="zone-favGroupBookmark-000000000000"
                    elements={localPS.unsorted.filter(filterSearch).filter(filterGroupLink)}
                    title={i18n.__('pages.PersonalPage.unsortedGroupLinks')}
                    setList={setZoneList('groupLink')}
                    suspendUpdate={suspendUpdate}
                    updateList={updateList}
                    customDrag={customDrag}
                    needUpdate={handleNeedUpdate}
                  />,
                ]
              : null}
            {customDrag && localPS.sorted.length >= 1 ? (
              <div className={classes.zoneButtonContainer}>
                <Button
                  startIcon={<AddBoxIcon />}
                  onClick={() => addZone(0)}
                  className={classes.zoneButtonEnd}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {i18n.__('pages.PersonalPage.addZoneHere')}
                </Button>
              </div>
            ) : null}
            {localPS.sorted.map(({ zone_id: zoneId, elements, name, isExpanded }, index) => [
              <PersonalZone
                key={`zone-${zoneId}`}
                elements={elements.filter(filterSearch).filter(doNotDisplayHidenServices)}
                index={index}
                title={name}
                edition={edition}
                setTitle={setZoneTitle}
                setList={setZoneList('')}
                suspendUpdate={suspendUpdate}
                updateList={updateList}
                delZone={delZone}
                lastZone={localPS.sorted.length === index + 1}
                moveDownZone={downZone}
                moveUpZone={upZone}
                customDrag={customDrag}
                isSorted
                isExpanded={isExpanded}
                setExpanded={setExpanded}
                needUpdate={handleNeedUpdate} // setAskToCreateNewBookMark(true);
              />,
              // localPS.sorted.length !== index + 1 ? (
              //   <Divider className={classes.divider} key={`div-${zoneId}`} />
              // ) : null,
            ])}
            {customDrag ? (
              <div className={classes.zoneButtonContainer}>
                <Button
                  startIcon={<AddBoxIcon />}
                  onClick={() => addZone(1)}
                  className={classes.zoneButtonEnd}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {i18n.__('pages.PersonalPage.addZoneHere')}
                </Button>
              </div>
            ) : null}
          </Container>
        </Fade>
      )}
    </>
  );
}

PersonalZoneUpdater.propTypes = {
  personalspace: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoading: PropTypes.bool.isRequired,
  edition: PropTypes.bool,
  handleEditionData: PropTypes.func,
  allServices: PropTypes.arrayOf(PropTypes.object).isRequired,
  allGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
  allLinks: PropTypes.arrayOf(PropTypes.object).isRequired,
  allGroupLinks: PropTypes.arrayOf(PropTypes.object).isRequired,
  appSettingsValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

PersonalZoneUpdater.defaultProps = {
  edition: false,
  handleEditionData: () => null,
};

export default PersonalZoneUpdater;
