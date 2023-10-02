/* eslint-disable react/no-this-in-sfc */
import React, { useState, useEffect } from 'react';
import { withTracker, useTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css'; // ES6
import { useHistory } from 'react-router-dom';

import Categories from '../../../api/categories/categories';
import BusinessReGrouping from '../../../api/businessReGrouping/businessReGrouping';
import Spinner from '../../components/system/Spinner';
import Services from '../../../api/services/services';
import slugy from '../../utils/slugy';
import ImageAdminUploader from '../../components/uploader/ImageAdminUploader';
import { CustomToolbarArticle } from '../../components/system/CustomQuill';
import '../../utils/QuillVideo';
import Structures from '../../../api/structures/structures';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
  },

  logo: {
    height: 100,
    width: 100,
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(3),
  },
  logoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1),
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  activeChip: {
    opacity: 1,
    cursor: 'pointer',
  },
  chip: {
    opacity: 0.4,
    cursor: 'pointer',
    transition: 'opacity 300ms ease-in-out',
    '&:hover': {
      opacity: 1,
    },
  },
  chipWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(1),
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  topSpacing: {
    marginTop: theme.spacing(4),
  },
  screenshotWrapper: {
    marginTop: 30,
    position: 'relative',
  },
  screenshotDelete: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
  screenshot: {
    width: '100%',
    minHeight: 200,
  },
}));

const defaultState = {
  title: '',
  slug: '',
  team: '',
  usage: '',
  description: '',
  content: '',
  url: '',
  logo: '',
  categories: [],
  businessReGrouping: [],
  screenshots: [],
  state: Number(Object.keys(Services.stateLabels)[0]),
};

const PLACEHOLDER = 'https://fakeimg.pl/900x600/';

const quillOptions = {
  clipboard: {
    matchVisual: false,
  },
  toolbar: {
    container: '#quill-toolbar',
  },
};

const AdminSingleServicePage = ({ categories, businessReGrouping, service, ready, match: { path, params } }) => {
  const [serviceData, setServiceData] = useState({ ...defaultState });
  const [loading, setLoading] = useState(!!params._id);
  const [content, setContent] = useState('');
  const history = useHistory();
  const { classes } = useStyles();

  const structureMode = path.startsWith('/admin/structureservices');
  const {
    minioEndPoint,
    offlinePage,
    ui: { isBusinessRegroupingMode },
  } = Meteor.settings.public;

  const removeUndefined = () => {
    let args;
    if (!params._id) {
      args = {
        toRemove: [...serviceData.screenshots, serviceData.logo],
        path: 'services/undefined',
      };
    } else {
      args = {
        toKeep: [...service.screenshots, service.logo],
        path: `services/${params._id}`,
      };
    }
    if (minioEndPoint) {
      Meteor.call('files.selectedRemove', args);
    }
  };

  const onCancel = () => {
    removeUndefined();
    history.push(structureMode ? '/admin/structureservices' : '/admin/services');
  };

  // useEffect(() => removeUndefined, []); // TO UNDERSTAND :)

  useEffect(() => {
    if (params._id && service._id && loading) {
      setLoading(false);
      setServiceData({ ...service });
      setContent(service.content);
    }
  }, [service]);

  const onUpdateField = (event) => {
    const { name, value, checked } = event.target;
    if (name === 'title') {
      setServiceData({
        ...serviceData,
        [name]: value,
        slug: slugy(value),
      });
    } else if (name === 'state') {
      setServiceData({ ...serviceData, [name]: Number(value) });
    } else if (name === 'offline') {
      setServiceData({ ...serviceData, [name]: checked });
    } else {
      setServiceData({ ...serviceData, [name]: value });
    }
  };

  const onUpdateLogo = (event) => {
    if (minioEndPoint) {
      setServiceData({ ...serviceData, logo: event });
    } else {
      setServiceData({ ...serviceData, logo: event.target.value });
    }
  };

  const onUpdateRichText = (html) => setContent(html);

  const onUpdateBusinessReGrouping = (businessReGroupingId) => {
    // regroupement métier par service est exclusive
    let newBusinessReGrouping = serviceData.businessReGrouping !== undefined ? [...serviceData.businessReGrouping] : [];
    const index = newBusinessReGrouping.findIndex((c) => c === businessReGroupingId);
    if (index > -1) {
      newBusinessReGrouping.splice(index, 1);
    } else {
      newBusinessReGrouping = [businessReGroupingId];
    }
    setServiceData({ ...serviceData, businessReGrouping: newBusinessReGrouping });
  };

  const onUpdateCategories = (categId) => {
    const newCategories = [...serviceData.categories];
    const index = newCategories.findIndex((c) => c === categId);
    if (index > -1) {
      newCategories.splice(index, 1);
    } else {
      newCategories.push(categId);
    }
    setServiceData({ ...serviceData, categories: newCategories });
  };

  const onUpdateScreenshots = (screenshot, index) => {
    const newData = JSON.parse(JSON.stringify(serviceData));
    newData.screenshots[index] = screenshot;
    setServiceData(newData);
  };

  const onRemoveScreenshots = (screen) => {
    const newData = JSON.parse(JSON.stringify(serviceData));
    newData.screenshots = newData.screenshots.filter((img) => img !== screen);

    if (!params._id && minioEndPoint) {
      const args = {
        toRemove: [screen],
        path: 'services/undefined',
      };
      Meteor.call('files.selectedRemove', args);
    }

    setServiceData(newData);
  };
  const onAddScreenshots = () => {
    const newData = JSON.parse(JSON.stringify(serviceData));
    newData.screenshots.push(PLACEHOLDER);
    setServiceData(newData);
  };

  const onSubmitUpdateService = () => {
    const method = `services.${params._id ? 'update' : 'create'}Service`;
    setLoading(true);
    const { _id, slug, ...rest } = serviceData;
    let args;

    if (params._id) {
      args = {
        serviceId: params._id,
        data: {
          ...rest,
          content,
        },
      };
    } else {
      try {
        const { structureId } = params;
        args = { data: { ...rest, content, structure: structureMode ? structureId : '' } };
      } catch (err) {
        msg.error(err.message);
      }
    }

    Meteor.call(method, args, (error) => {
      if (error) {
        if (error.error === 'validation-error') {
          msg.error(error.details[0].message);
        } else {
          msg.error(error.message);
        }
        setLoading(false);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
        history.push(structureMode ? '/admin/structureservices' : '/admin/services');
      }
    });
  };

  const { structure } = useTracker(() => {
    const _id = params.structureId ? params.structureId : serviceData.structure;
    Meteor.subscribe('structures.one', { _id });
    const data = Structures.findOne(_id);
    return { structure: data };
  }, [serviceData, params]);

  const businessReGroupingByStructure = (currStructure) => {
    if (currStructure === undefined) {
      return [];
    }

    const structureWithAllAncestorsId = currStructure.ancestorsIds;
    structureWithAllAncestorsId.push(currStructure._id);
    return params.structureId
      ? businessReGrouping
      : businessReGrouping.filter((businessRegr) => structureWithAllAncestorsId.includes(businessRegr.structure));
  };

  // const memoizedBusinessReGroupingByStructure = useMemo(() => businessReGroupingByStructure(structure), [structure]);

  // if (!ready || loading || (!!params._id && !service._id)) {
  //   return <Spinner full />;
  // }

  return !ready || loading || (!!params._id && !service._id) ? (
    <Spinner full />
  ) : (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Typography component="h1">
            {i18n.__(`pages.AdminSingleServicePage.${params._id ? 'edition' : 'creation'}`)}
            <b> {serviceData.title}</b> {structureMode && structure != null ? `(${structure.name})` : ''}
          </Typography>
          <form noValidate autoComplete="off">
            <Tooltip title={i18n.__('pages.AdminSingleServicePage.titleFieldHelperText')} arrow key="tooTipTitle">
              <TextField
                onChange={onUpdateField}
                value={serviceData.title}
                name="title"
                label={i18n.__('pages.AdminSingleServicePage.title')}
                variant="outlined"
                fullWidth
                margin="normal"
              />
            </Tooltip>
            <TextField
              onChange={onUpdateField}
              value={serviceData.slug}
              name="slug"
              label={i18n.__('pages.AdminSingleServicePage.slug')}
              variant="outlined"
              fullWidth
              margin="normal"
              disabled
            />
            <Tooltip title={i18n.__('pages.AdminSingleServicePage.StateFieldHelperText')} arrow key="tooTipState">
              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel htmlFor="state" id="state-label">
                  {i18n.__('pages.AdminSingleServicePage.state')}
                </InputLabel>
                <Select
                  labelId="state-label"
                  id="state"
                  name="state"
                  value={serviceData.state}
                  onChange={onUpdateField}
                  label={i18n.__('pages.AdminSingleServicePage.state')}
                >
                  {Object.keys(Services.stateLabels).map((val) => (
                    <MenuItem key={val} value={val}>
                      {i18n.__(Services.stateLabels[val])}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>
            <Tooltip title={i18n.__('pages.AdminSingleServicePage.teamFieldHelperText')} arrow key="toolTipTeam">
              <TextField
                onChange={onUpdateField}
                value={serviceData.team}
                name="team"
                label={i18n.__('pages.AdminSingleServicePage.team')}
                variant="outlined"
                fullWidth
                margin="normal"
              />
            </Tooltip>
            <Tooltip title={i18n.__('pages.AdminSingleServicePage.usageFieldHelperText')} arrow key="toolTipUsage">
              <TextField
                onChange={onUpdateField}
                value={serviceData.usage}
                name="usage"
                label={i18n.__('pages.AdminSingleServicePage.usage')}
                variant="outlined"
                fullWidth
                margin="normal"
              />
            </Tooltip>
            <div className={classes.logoWrapper}>
              <div>{i18n.__('pages.AdminSingleServicePage.logo')}</div>
              <ImageAdminUploader
                onImageChange={onUpdateLogo}
                name="logo"
                className={classes.logo}
                alt={`logo for ${serviceData.title}`}
                src={serviceData.logo}
                path={`services/${params._id}`}
                width={100}
                height={100}
              />
              {!minioEndPoint && (
                <TextField
                  onChange={onUpdateLogo}
                  value={serviceData.logo}
                  name="url"
                  label={i18n.__('pages.AdminSingleServicePage.logo_url')}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            </div>
            <Tooltip
              title={i18n.__('pages.AdminSingleServicePage.descriptionFieldHelperText')}
              arrow
              key="toolTipDescription"
            >
              <TextField
                onChange={onUpdateField}
                value={serviceData.description}
                name="description"
                label={i18n.__('pages.AdminSingleServicePage.description')}
                variant="outlined"
                inputProps={{ maxLength: 64 }}
                fullWidth
                multiline
                margin="normal"
              />
            </Tooltip>
            <TextField
              onChange={onUpdateField}
              value={serviceData.url}
              name="url"
              label={i18n.__('pages.AdminSingleServicePage.url')}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            {offlinePage && !structureMode && (
              <FormControlLabel
                control={
                  <Checkbox
                    name="offline"
                    checked={serviceData.offline || false}
                    onChange={onUpdateField}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label={i18n.__('pages.AdminSingleServicePage.offlineService')}
              />
            )}
            <div className={`${classes.wysiwyg} ${classes.topSpacing}`}>
              <InputLabel htmlFor="content">{i18n.__('pages.AdminSingleServicePage.content')}</InputLabel>
              <CustomToolbarArticle />
              <ReactQuill id="content" value={content} onChange={onUpdateRichText} modules={quillOptions} />
            </div>
            <InputLabel id="categories-label">{i18n.__('pages.AdminSingleServicePage.categories')}</InputLabel>
            <div className={classes.chipWrapper}>
              {categories.map((categ) => {
                const isActive = serviceData.categories && Boolean(serviceData.categories.find((c) => c === categ._id));
                return (
                  <Chip
                    key={categ._id}
                    label={categ.name}
                    color={isActive ? 'primary' : 'default'}
                    variant={isActive ? 'outlined' : 'default'}
                    className={isActive ? classes.activeChip : classes.chip}
                    style={{ backgroudColor: categ.color }}
                    onClick={() => onUpdateCategories(categ._id)}
                  />
                );
              })}
            </div>
            {structureMode && isBusinessRegroupingMode && businessReGrouping.length > 0 && (
              <InputLabel id="businessReGrouping-label">
                {i18n.__('pages.AdminSingleServicePage.businessReGrouping')}
              </InputLabel>
            )}
            {structureMode && isBusinessRegroupingMode && (
              <div className={classes.chipWrapper}>
                {businessReGroupingByStructure(structure).map((businessRegroup) => {
                  const isActive =
                    serviceData.businessReGrouping &&
                    Boolean(serviceData.businessReGrouping.find((rg) => rg === businessRegroup._id));
                  return (
                    <Chip
                      key={businessRegroup._id}
                      label={businessRegroup.name}
                      color={isActive ? 'primary' : 'default'}
                      variant={isActive ? 'outlined' : 'default'}
                      className={isActive ? classes.activeChip : classes.chip}
                      style={{ backgroudColor: businessRegroup.color }}
                      onClick={() => onUpdateBusinessReGrouping(businessRegroup._id)}
                    />
                  );
                })}
              </div>
            )}
            {minioEndPoint && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <InputLabel>
                  {i18n.__('pages.AdminSingleServicePage.screenshots')} (
                  {(serviceData.screenshots && serviceData.screenshots.length) || 0})
                </InputLabel>
                <IconButton
                  color="primary"
                  aria-label={i18n.__('pages.AdminSingleServicePage.onAddScreenshots')}
                  onClick={onAddScreenshots}
                  size="large"
                >
                  <AddIcon />
                </IconButton>
              </div>
            )}
            {minioEndPoint && (
              <Grid container spacing={4}>
                {serviceData.screenshots &&
                  serviceData.screenshots.map((screen, i) => (
                    <Grid lg={4} md={6} xs={12} item key={Math.random()} className={classes.screenshotWrapper}>
                      <ImageAdminUploader
                        onImageChange={(image) => onUpdateScreenshots(image, i)}
                        name={`screenshot_${i}`}
                        className={classes.screenshot}
                        alt={`screenshot for ${serviceData.title}`}
                        src={screen}
                        path={`services/${params._id}`}
                        width={900}
                        height={600}
                      />
                      <IconButton
                        onClick={() => onRemoveScreenshots(screen)}
                        className={classes.screenshotDelete}
                        size="large"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  ))}
              </Grid>
            )}
            <div className={classes.buttonGroup}>
              <Button variant="contained" color="grey" onClick={onCancel}>
                {i18n.__('pages.AdminSingleServicePage.cancel')}
              </Button>

              <Button variant="contained" color="primary" onClick={onSubmitUpdateService}>
                {params._id
                  ? i18n.__('pages.AdminSingleServicePage.update')
                  : i18n.__('pages.AdminSingleServicePage.save')}
              </Button>
            </div>
          </form>
        </Paper>
      </Container>
    </Fade>
  );
};

export default withTracker(
  ({
    match: {
      params: { _id, structureId },
    },
  }) => {
    const subCategories = Meteor.subscribe('categories.all');
    const categories = Categories.find({}).fetch();
    const subBusinessReGrouping = Meteor.subscribe('businessReGrouping.all');

    let businessReGrouping = BusinessReGrouping.find({}).fetch();
    let service = {};
    let ready = false;
    if (_id) {
      const subService = Meteor.subscribe('services.one.admin', { _id });
      service = Services.findOneFromPublication('services.one.admin', { _id });
      ready = subCategories.ready() && subBusinessReGrouping.ready() && subService.ready();
    } else {
      ready = subCategories.ready() && subBusinessReGrouping.ready();
    }

    if (structureId) {
      const subStructure = Meteor.subscribe('structures.all', { _id: structureId });
      // const structureWithAllChildren = Structures.find({
      //   $or: [{ ancestorsIds: structureId }, { _id: structureId }],
      // }).fetch();  ==> faut plutôt faire l'inverse, il ne faut pas voir les regroupements métiers des sous-structures
      const currStructure = Structures.find({ _id: structureId }).fetch();
      let structureWithAllAncestorsId = [];
      if (currStructure.length > 0) {
        structureWithAllAncestorsId = currStructure[0].ancestorsIds;
        structureWithAllAncestorsId.push(structureId);
      }

      // businessReGrouping = businessReGrouping.filter((businessRegr) =>
      //   structureWithAllChildren.map((s) => s._id).includes(businessRegr.structure),
      // );

      businessReGrouping = businessReGrouping.filter((businessRegr) =>
        structureWithAllAncestorsId.includes(businessRegr.structure),
      );
      ready = ready && subStructure.ready();
    }

    return {
      service,
      categories,
      businessReGrouping,
      ready,
    };
  },
)(AdminSingleServicePage);

AdminSingleServicePage.defaultProps = {
  service: {},
};

AdminSingleServicePage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  categories: PropTypes.arrayOf(PropTypes.any).isRequired,
  businessReGrouping: PropTypes.arrayOf(PropTypes.any).isRequired,
  service: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
