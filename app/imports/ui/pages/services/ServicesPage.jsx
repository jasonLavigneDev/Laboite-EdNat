import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from 'tss-react/mui';
import Container from '@mui/material/Container';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ToggleButton from '@mui/material/ToggleButton';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import CloseIcon from '@mui/icons-material/Close';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Grid from '@mui/material/Grid';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import AppBar from '@mui/material/AppBar';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Tooltip from '@mui/material/Tooltip';
import ServiceDetails from '../../components/services/ServiceDetails';
import ServiceDetailsList from '../../components/services/ServiceDetailsList';
import Services from '../../../api/services/services';
import Categories from '../../../api/categories/categories';
import BusinessReGrouping from '../../../api/businessReGrouping/businessReGrouping';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import ServiceDetailsListZone from '../../components/services/ServiceDetailsListZone';
import { useIconStyles, DetaiIconCustom, SimpleIconCustom } from '../../components/system/icons/icons';
import { useStructure } from '../../../api/structures/hooks';
import { GRID_VIEW_MODE } from '../../utils/ui';

const useStyles = makeStyles()((theme, isMobile) => ({
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardGrid: {
    marginBottom: '0px',
    marginTop: '10px',
  },
  chip: {
    margin: theme.spacing(1),
    '&&:hover,&&:focus': {
      backgroundColor: theme.palette.backgroundFocus.main,
      color: theme.palette.primary.main,
    },
  },
  smallGrid: {
    height: 20,
  },
  filterTitle: {
    fontSize: '0.85rem',
    margin: theme.spacing(1),
  },
  badge: {
    height: 20,
    display: 'flex',
    padding: '0 6px',
    flexWrap: 'wrap',
    fontSize: '0.75rem !important',
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.tertiary.main} !important`,
    minWidth: 20,
    borderRadius: 10,
    marginLeft: isMobile ? 10 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invertedBadge: {
    height: 20,
    display: 'flex',
    padding: '0 6px',
    flexWrap: 'wrap',
    fontSize: '0.75rem !important',
    backgroundColor: theme.palette.tertiary.main,
    color: `${theme.palette.primary.main} !important`,
    minWidth: 20,
    borderRadius: 10,
    marginLeft: isMobile ? 10 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
  small: {
    padding: '5px !important',
    transition: 'all 300ms ease-in-out',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  mobileButtonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px !important',
    paddingBottom: 10,
  },
  categoryFilterMobile: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: theme.palette.tertiary.main,
    zIndex: theme.zIndex.modal,
  },
  categoriesList: {
    marginTop: 60,
    paddingBottom: 60,
  },
  appBarBottom: {
    bottom: 0,
    top: 'auto',
    backgroundColor: theme.palette.tertiary.main,
  },
  toolbarBottom: {
    justifyContent: 'space-between',
  },
  emptyMsg: {
    marginTop: 30,
    marginBottom: 15,
  },
}));

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
const getLocalStorageViewMode = (key, defaultValue) => {
  let localStorageViewMode = sessionStorage.getItem(key);
  if (localStorageViewMode == null) {
    localStorageViewMode = defaultValue;
  }
  return localStorageViewMode;
};
export function ServicesPage({ services, categories, businessRegroupings, ready, structureMode, offline }) {
  const [{ user, loadingUser, isMobile, servicePage }, dispatch] = useAppContext();
  const structure = offline ? null : useStructure();
  const { classes } = useStyles(isMobile);
  const { classes: classesIcons } = useIconStyles();

  const {
    public: {
      ui: { defaultGridViewMode },
      ui: { isBusinessRegroupingMode },
    },
  } = Meteor.settings;
  const {
    catList = [],
    search = '',
    filterToggle = false,
    viewMode = getLocalStorageViewMode('cstViewMode', GRID_VIEW_MODE[defaultGridViewMode]),
  } = servicePage;

  const favs = loadingUser || offline ? [] : user.favServices;

  const updateGlobalState = (key, value) =>
    dispatch({
      type: 'servicePage',
      data: {
        ...servicePage,
        [key]: value,
      },
    });

  const toggleFilter = () => updateGlobalState('filterToggle', !filterToggle);
  const resetCatList = () => updateGlobalState('catList', []);
  const changeViewMode = (_, value) => {
    // Access initial value from session storage
    const cstViewMode = getLocalStorageViewMode('cstViewMode', GRID_VIEW_MODE[defaultGridViewMode]);
    if (cstViewMode !== value) {
      // Update session storage
      sessionStorage.setItem('cstViewMode', value);
    }
    updateGlobalState('viewMode', value);
  };
  const updateCatList = (catId) => {
    // Call by click on categories of services
    if (catList.includes(catId)) {
      // catId already in list so remove it
      updateGlobalState(
        'catList',
        catList.filter((id) => id !== catId),
      );
    } else {
      // add new catId to list
      updateGlobalState('catList', [...catList, catId]);
    }
  };

  const filterServices = (service) => {
    let filterSearch = true;
    let filterCat = true;
    if (search) {
      let searchText = service.title + service.description;
      searchText = searchText.toLowerCase();
      filterSearch = searchText.indexOf(search.toLowerCase()) > -1;
    }
    if (catList.length > 0) {
      const intersection = catList.filter((value) => service.categories.includes(value));
      filterCat = intersection.length > 0;
    }
    return filterSearch && filterCat;
  };

  const mapList = (func) => services.filter((service) => filterServices(service)).map(func);
  const servicesByBusinessRegrouping = (businessRegrouping) => {
    return services.filter(
      (service) =>
        filterServices(service) &&
        service.businessReGrouping &&
        service.businessReGrouping !== undefined &&
        service.businessReGrouping.includes(businessRegrouping._id),
    );
  };

  const servicesWithoutBusinessRegrouping = () => {
    return services.filter(
      (service) =>
        filterServices(service) &&
        ((service.businessReGrouping &&
          service.businessReGrouping !== undefined &&
          service.businessReGrouping.length === 0) ||
          service.businessReGrouping === undefined),
    );
  };

  const memorizedServicesWithoutBusinessRegrouping = useMemo(() => servicesWithoutBusinessRegrouping(), [services]);

  const favAction = (id) => (favs.indexOf(id) === -1 ? 'fav' : 'unfav');

  const toggleButtons = (
    <ToggleButtonGroup value={viewMode} exclusive aria-label={i18n.__('pages.ServicesPage.viewMode')}>
      <ToggleButton
        value={GRID_VIEW_MODE.detail}
        onClick={changeViewMode}
        aria-label={i18n.__('pages.ServicesPage.viewDetail')}
      >
        <Tooltip title={i18n.__('pages.ServicesPage.viewDetail')} aria-label={i18n.__('pages.ServicesPage.viewDetail')}>
          <span className={classesIcons.size}>
            <DetaiIconCustom />
          </span>
        </Tooltip>
      </ToggleButton>
      <ToggleButton
        value={GRID_VIEW_MODE.compact}
        onClick={changeViewMode}
        aria-label={i18n.__('pages.ServicesPage.viewSimple')}
      >
        <Tooltip title={i18n.__('pages.ServicesPage.viewSimple')} aria-label={i18n.__('pages.ServicesPage.viewSimple')}>
          <span className={classesIcons.size}>
            <SimpleIconCustom />
          </span>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const mobileFilterButton = (
    <Button
      style={{ textTransform: 'none' }}
      color="primary"
      variant="outlined"
      size="large"
      onClick={toggleFilter}
      startIcon={<FilterListIcon />}
    >
      {i18n.__('pages.ServicesPage.filter')}{' '}
      {catList.length ? <span className={classes.badge}>{catList.length}</span> : null}
    </Button>
  );

  return (
    <>
      {!ready ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container>
            <Grid container spacing={4}>
              <Grid item xs={12} className={isMobile ? null : classes.flex}>
                <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                  {i18n.__(structureMode ? structure && structure.name : 'pages.ServicesPage.titleServices')}
                </Typography>
                <div className={classes.spaceBetween}>{!isMobile && toggleButtons}</div>
              </Grid>
              {isMobile ? (
                <Grid item xs={12} sm={12} className={classes.mobileButtonContainer}>
                  {mobileFilterButton}
                  {toggleButtons}
                </Grid>
              ) : (
                <Grid item xs={12} sm={12} md={12}>
                  <>
                    <Typography variant="h6" display="inline" className={classes.filterTitle}>
                      {i18n.__('pages.ServicesPage.categories')}
                    </Typography>
                    {categories.map((cat) => (
                      <Chip
                        className={classes.chip}
                        key={cat._id}
                        label={cat.name}
                        deleteIcon={
                          <span className={catList.includes(cat._id) ? classes.invertedBadge : classes.badge}>
                            {cat.count}
                          </span>
                        }
                        onDelete={() => updateCatList(cat._id)}
                        variant={catList.includes(cat._id) ? 'default' : 'outlined'}
                        color={catList.includes(cat._id) ? 'primary' : 'default'}
                        onClick={() => updateCatList(cat._id)}
                      />
                    ))}
                    {catList.length > 0 ? (
                      <Button color="primary" onClick={resetCatList} startIcon={<ClearIcon />}>
                        {i18n.__('pages.ServicesPage.reset')}
                      </Button>
                    ) : null}
                  </>
                </Grid>
              )}
            </Grid>

            <Grid container className={classes.cardGrid} spacing={isMobile ? 2 : 4}>
              {services.length === 0 ? (
                <Typography className={classes.emptyMsg}>
                  {i18n.__(`pages.ServicesPage.${structureMode ? 'NoStructureServices' : 'NoServices'}`)}
                </Typography>
              ) : (!isBusinessRegroupingMode || !structureMode) && viewMode === GRID_VIEW_MODE.compact && isMobile ? (
                mapList((service) => (
                  <Grid className={classes.gridItem} item xs={4} md={2} key={service._id}>
                    <ServiceDetailsList service={service} favAction={favAction(service._id)} />
                  </Grid>
                ))
              ) : (
                (!isBusinessRegroupingMode || !structureMode) &&
                mapList((service) => (
                  <Grid className={classes.gridItem} item key={service._id} xs={12} sm={12} md={6} lg={4}>
                    <ServiceDetails
                      service={service}
                      favAction={favAction(service._id)}
                      updateCategories={updateCatList}
                      catList={catList}
                      categories={categories}
                      isShort={!isMobile && viewMode === GRID_VIEW_MODE.compact}
                    />
                  </Grid>
                ))
              )}
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              {services.length > 0 &&
                isBusinessRegroupingMode &&
                structureMode &&
                memorizedServicesWithoutBusinessRegrouping.length > 0 && (
                  <ServiceDetailsListZone
                    key="BusinessWithoutRegroupingZone"
                    services={memorizedServicesWithoutBusinessRegrouping}
                    index={0}
                    title={i18n.__('pages.ServicesPage.ServicesWithoutBusinessRegrouping')}
                    favAction={favAction}
                    isShort={!isMobile && viewMode === GRID_VIEW_MODE.compact}
                    isSorted
                    isExpandedZone
                    isShortMobile={isMobile && viewMode === GRID_VIEW_MODE.compact}
                  />
                )}
              {services.length > 0 &&
                isBusinessRegroupingMode &&
                structureMode &&
                businessRegroupings.map(
                  (businessRegrouping, i) =>
                    servicesByBusinessRegrouping(businessRegrouping).length > 0 && (
                      <ServiceDetailsListZone
                        key={`BusinessRegroupingZone${i + 1}`}
                        services={servicesByBusinessRegrouping(businessRegrouping)}
                        index={i}
                        title={businessRegrouping.name}
                        favAction={favAction}
                        isShort={!isMobile && viewMode === GRID_VIEW_MODE.compact}
                        isSorted
                        isExpandedZone
                        isMobile={isMobile && viewMode === GRID_VIEW_MODE.compact}
                      />
                    ),
                )}
            </Grid>
            <Dialog fullScreen open={filterToggle && isMobile} TransitionComponent={Transition}>
              <AppBar className={classes.appBar}>
                <Toolbar>
                  <IconButton edge="start" color="inherit" onClick={toggleFilter} aria-label="close" size="large">
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h6">{i18n.__('pages.ServicesPage.categories')}</Typography>
                  {!!catList.length && <span className={classes.invertedBadge}>{catList.length}</span>}
                </Toolbar>
              </AppBar>
              <List className={classes.categoriesList}>
                {categories.map((cat) => [
                  <ListItem button key={cat._id}>
                    <ListItemText
                      primary={cat.name}
                      onClick={() => updateCatList(cat._id)}
                      secondary={`${cat.count} applications`}
                    />

                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="add" onClick={() => updateCatList(cat._id)} size="large">
                        {catList.includes(cat._id) ? (
                          <CheckCircleRoundedIcon fontSize="large" color="primary" />
                        ) : (
                          <RadioButtonUncheckedRoundedIcon fontSize="large" color="primary" />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>,

                  <Divider key={`${cat._id}divider`} />,
                ])}
              </List>
              <AppBar className={classes.appBarBottom}>
                <Toolbar className={classes.toolbarBottom}>
                  <Button
                    color="primary"
                    disabled={catList.length === 0}
                    variant="outlined"
                    onClick={resetCatList}
                    startIcon={<ClearIcon />}
                  >
                    {i18n.__('pages.ServicesPage.reset')}
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={toggleFilter}
                    startIcon={<CheckCircleRoundedIcon />}
                  >
                    {i18n.__('pages.ServicesPage.validate')}
                  </Button>
                </Toolbar>
              </AppBar>
            </Dialog>
          </Container>
        </Fade>
      )}
    </>
  );
}

ServicesPage.propTypes = {
  services: PropTypes.arrayOf(PropTypes.object).isRequired,
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  businessRegroupings: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
  structureMode: PropTypes.bool.isRequired,
  offline: PropTypes.bool,
};

ServicesPage.defaultProps = {
  offline: false,
};

export default withTracker(({ match: { path } }) => {
  const structureMode = path === '/structure';
  const [{ structure }] = useAppContext();
  /**
   * - Grab current user structure with the ancestors
   *
   * - This is used to get all services from top level to current one
   */
  const currentStructureWithAncestors = [];
  if (structure && structure._id) {
    currentStructureWithAncestors.push(structure._id, ...structure.ancestorsIds);
  }
  const subName = structureMode ? 'services.structure.ids' : 'services.all';
  const servicesHandle = Meteor.subscribe(subName, structureMode && { structureIds: currentStructureWithAncestors });
  let services;
  if (structureMode) {
    services = Services.findFromPublication(subName, { state: { $ne: 10 } }, { sort: { title: 1 } }).fetch();
  } else {
    services = Services.find({ state: { $ne: 10 } }, { sort: { title: 1 } }).fetch();
  }
  const categoriesHandle = Meteor.subscribe('categories.all');
  const cats = Categories.find({}, { sort: { name: 1 } }).fetch();
  const categories = cats.map((cat) => ({
    ...cat,
    count: Services.find({ state: { $ne: 10 }, categories: { $in: [cat._id] } }).count(),
  }));

  const businessRegroupingsHandle = Meteor.subscribe('businessReGrouping.all');
  const businessRegroupings = BusinessReGrouping.find({}).fetch();

  const ready = servicesHandle.ready() && categoriesHandle.ready() && businessRegroupingsHandle.ready();
  return {
    services,
    categories,
    businessRegroupings,
    ready,
    structureMode,
  };
})(ServicesPage);
