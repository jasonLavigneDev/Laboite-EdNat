/* eslint-disable react/no-this-in-sfc */
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Fade from '@mui/material/Fade';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';

import PropTypes from 'prop-types';
import slugify from 'slugify';
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css'; // ES6
import { useHistory } from 'react-router-dom';
import { Roles } from 'meteor/alanning:roles';

import Spinner from '../../components/system/Spinner';
import { createGroup, updateGroup } from '../../../api/groups/methods';
import Groups from '../../../api/groups/groups';
import GroupsUsersList from '../../components/admin/GroupUsersList';
import { useAppContext } from '../../contexts/context';
import { CustomToolbarArticle } from '../../components/system/CustomQuill';
import '../../utils/QuillVideo';
import AvatarPicker from '../../components/users/AvatarPicker';
import AdminGroupDelete from '../../components/admin/AdminGroupDelete';
import { getGroupName } from '../../utils/utilsFuncs';
import debounceFunc from '../../utils/debounce';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    display: 'flex',
    marginTop: '10px',
    justifyContent: 'center',
  },
  button: {
    marginLeft: '5%',
    marginRight: '5%',
  },
  actionButtons: {
    flexDirection: 'inherit',
    justifyContent: 'right',
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareName: {
    display: 'flex',
    alignItems: 'center',
  },
  adornment: {
    marginRight: '0px',
  },
}));

function TabPanel(props) {
  const { value, index, userRole, groupId } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
    >
      {value === index && <GroupsUsersList userRole={userRole} groupId={groupId} />}
    </div>
  );
}

TabPanel.propTypes = {
  userRole: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const defaultState = {
  name: '',
  slug: '',
  description: '',
  content: '',
  avatar: '',
  type: Number(Object.keys(Groups.typeLabels)[0]),
  structureIds: [],
};

const quillOptions = {
  toolbar: {
    container: '#quill-toolbar',
  },
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'color',
];

const AdminSingleGroupPage = ({ group, ready, match: { params } }) => {
  const [, dispatch] = useAppContext();
  const [groupData, setGroupData] = useState(defaultState);
  const [loading, setLoading] = useState(!!params._id);
  const [errorShareText, setErrorShareText] = useState('');
  const [errorShare, setErrorShare] = useState(false);
  const [tabId, setTabId] = React.useState(0);
  const [content, setContent] = useState('');
  const isAutomaticGroup = group.type === 15;
  const [openRemoveModal, setOpenRemoveModal] = useState(false);

  const [plugins, setPlugins] = useState({}); // { nextcloud: false, rocketChat: true}
  const [{ isMobile }] = useAppContext();
  const { groupPlugins, hideGroupPlugins } = Meteor.settings.public;
  const history = useHistory();
  const { classes } = useStyles();

  const [{ user, userId }] = useAppContext();
  const isAdmin = Roles.userIsInRole(userId, 'admin', params._id);
  const canDelete = (isAdmin || group.owner === userId) && !isAutomaticGroup;

  const typeLabel = React.useRef(null);
  const { minioEndPoint } = Meteor.settings.public;

  function calcShareName(value) {
    return value.replace('/', '_').replace('\\', '_');
  }

  function _checkShareName() {
    if (plugins.nextcloud === true) {
      const value = groupData.shareName;
      if (!value) {
        setErrorShareText(i18n.__('pages.AdminSingleGroupPage.shareNameEmpty'));
        setErrorShare(true);
        return true;
      }
      if (value.includes('/') || value.includes('\\')) {
        setErrorShareText(`${i18n.__('pages.AdminSingleGroupPage.invalidCharacters')}: /, \\`);
        setErrorShare(true);
        return true;
      }
      // check unicity of share name
      Meteor.call('groups.checkShareName', { shareName: value, groupId: params._id }, (err, res) => {
        if (err) {
          msg.error(err.reason);
          return false;
        }
        if (res === false) {
          setErrorShareText(i18n.__('pages.AdminSingleGroupPage.shareNameExists'));
          setErrorShare(true);
          return true;
        }
        return false;
      });
    }
    // if plugins.nextcloud is false we don't need to perform check,
    // as shareName will be ignored when submitting
    setErrorShareText('');
    setErrorShare(false);
    return false;
  }

  const checkShareName = debounceFunc(_checkShareName, 1000);

  useEffect(() => {
    if (params._id && group._id && loading) {
      setLoading(false);
      if (group.shareName === undefined) {
        setGroupData({ ...group, shareName: calcShareName(group.name) });
      } else {
        setGroupData(group);
      }
      setContent(group.content || '');
      setPlugins(group.plugins || {});
    }
  }, [group]);

  useEffect(() => {
    checkShareName();
  }, [groupData.shareName, plugins.nextcloud]);

  const handleChangeTab = (event, newValue) => {
    setTabId(newValue);
  };
  const [tempImageLoaded, setTempImageLoaded] = useState(false);
  const onUpdateField = (event) => {
    const { name, value } = event.target;
    if (name === 'name') {
      setGroupData({
        ...groupData,
        [name]: value,
        slug: slugify(value, {
          replacement: '-', // replace spaces with replacement
          remove: null, // regex to remove characters
          lower: true, // result in lower case
        }),
        shareName: calcShareName(value),
      });
    } else if (name === 'type') {
      setGroupData({ ...groupData, [name]: Number(value) });
    } else {
      setGroupData({ ...groupData, [name]: value });
    }
  };

  const SendNewAvatarToMedia = (avImg) => {
    // if group is not yet created, the temp image goes to user minio
    dispatch({
      type: 'uploads.add',
      data: {
        name: params._id ? 'groupAvatar_TEMP' : 'groupAvatar',
        fileName: params._id ? 'groupAvatar_TEMP' : 'groupAvatar',
        file: avImg,
        type: 'png',
        path: params._id ? `groups/${group._id}` : `users/${Meteor.userId()}`,
        storage: true,
        isUser: false,
        onFinish: (url) => {
          setGroupData({ ...groupData, avatar: `${url}?${new Date().getTime()}` });
          setTempImageLoaded(true);
        },
      },
    });
  };
  const onAssignAvatar = (avatarObj, groupName) => {
    // avatarObj = [{image: base64...}] or {url: http...}
    if (avatarObj?.[0]?.image) {
      SendNewAvatarToMedia(avatarObj[0].image, groupName);
    } else if (avatarObj.url !== group.avatar) {
      setGroupData({ ...groupData, avatar: avatarObj.url });
    }
  };

  const onUpdateRichText = (html) => {
    setContent(html);
  };
  const cancelForm = () => {
    if (tempImageLoaded && minioEndPoint) {
      // A temporary image has been loaded in minio with name "groupAvatar_TEMP"
      // => delete it
      if (params._id) {
        // on update
        Meteor.call('files.selectedRemove', {
          path: `groups/${group._id}`,
          toRemove: [`groups/${group._id}/groupAvatar_TEMP.png`],
          isUser: false,
        });
      } else {
        // on create
        Meteor.call('files.selectedRemove', {
          path: `users/${Meteor.userId()}`,
          toRemove: [`users/${Meteor.userId()}/groupAvatar.png`],
        });
      }
    }
    setTempImageLoaded(false);
    history.goBack();
  };

  const nameIsInvalid = () => {
    return !isAutomaticGroup && groupData.name.toLowerCase().includes('[struc]');
  };

  const typeIsInvalid = () => {
    return !isAutomaticGroup && groupData.type === 15;
  };

  const submitUpdateGroup = () => {
    if (groupData.avatar !== group.avatar) {
      if (tempImageLoaded && minioEndPoint) {
        // A temporary image has been loaded in minio with name "groupAvatar_TEMP"
        if (groupData.avatar.includes('groupAvatar_TEMP')) {
          // This image will be the new group's avatar
          if (params._id) {
            // only on update
            Meteor.call('files.rename', {
              path: `groups/${group._id}`,
              oldName: 'groupAvatar_TEMP.png',
              newName: 'groupAvatar.png',
            });
            setTempImageLoaded(false);
          }
        }
      }
    }
    const method = params._id ? updateGroup : createGroup;
    setLoading(true);
    const { _id, slug, avatar, shareName, ...rest } = groupData;
    if (!isAutomaticGroup && rest.name.toLowerCase().includes('[struc]')) {
      msg.error(i18n.__('pages.AdminSingleGroupPage.invalidName'));
      history.goBack();
    } else {
      let args;

      if (params._id) {
        args = {
          groupId: params._id,
          data: {
            ...rest,
            content,
            plugins,
            avatar: avatar.replace('groupAvatar_TEMP.png', 'groupAvatar.png'),
          },
        };
        if (plugins.nextcloud === true) args.data.shareName = shareName;
      } else {
        args = {
          ...rest,
          content,
          plugins,
          avatar,
        };
        if (plugins.nextcloud === true) args.shareName = shareName;
      }
      method.call(args, (error) => {
        setLoading(false);
        if (error) {
          msg.error(error.reason ? error.reason : error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
          if (history.location.state?.prevPath.includes('groups/')) {
            history.push(`/groups/${slug}`);
          } else {
            history.goBack();
          }
        }
      });
    }
  };

  if (!ready || loading || (!!params._id && !group._id)) {
    return <Spinner />;
  }

  const onChangePlugins = (event, plugin) => {
    setPlugins({ ...plugins, [plugin]: event.target.checked });
  };

  const groupEnableChangeName = Object.keys(group.plugins || {})
    .filter((plug) => group.plugins[plug] === true)
    .map((plug) => groupPlugins[plug].enableChangeName)
    .reduce((acculator, currentValue) => acculator && currentValue, true);

  const groupPluginsShow = (plugin) => {
    if (groupPlugins[plugin].enable && !hideGroupPlugins) {
      return (
        <FormGroup key={plugin}>
          <FormControlLabel
            control={
              <Checkbox
                checked={plugins[plugin] || false}
                onChange={(event) => onChangePlugins(event, plugin)}
                name={plugin}
                disabled={(!isAdmin && params._id) || (plugin !== 'nextcloud' && !!params._id)}
              />
            }
            label={i18n.__(`api.${plugin}.enablePluginForGroup`)}
          />
        </FormGroup>
      );
    }
    return null;
  };

  const deleteGroup = () => {
    setOpenRemoveModal(true);
  };

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Grid item xs={12} sm={12} md={12} className={classes.flex}>
            <Typography component="h1" style={{ width: '100%' }}>
              {i18n.__(`pages.AdminSingleGroupPage.${params._id ? 'edition' : 'creation'}`)}{' '}
              <b>{getGroupName(group)}</b>
            </Typography>
          </Grid>

          <form noValidate autoComplete="off">
            <Grid container spacing={2} style={{ alignItems: 'center' }}>
              <Grid item xs={isMobile ? 12 : 6} style={{ paddingLeft: '18px' }}>
                <TextField
                  onChange={onUpdateField}
                  value={groupData.name}
                  name="name"
                  label={i18n.__('pages.AdminSingleGroupPage.name')}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  disabled={(!isAdmin && !!params._id) || !groupEnableChangeName || isAutomaticGroup}
                />
                <TextField
                  onChange={onUpdateField}
                  value={groupData.slug}
                  name="slug"
                  label={i18n.__('pages.AdminSingleGroupPage.slug')}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  disabled
                />
                {Object.keys(groupPlugins).map((p) => groupPluginsShow(p))}
                {plugins.nextcloud === true ? (
                  <TextField
                    onChange={onUpdateField}
                    value={groupData.shareName}
                    name="shareName"
                    label={i18n.__('pages.AdminSingleGroupPage.shareName')}
                    variant="outlined"
                    margin="normal"
                    error={errorShare}
                    helperText={errorShareText}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment className={classes.adornment} position="start">
                          groupe-
                        </InputAdornment>
                      ),
                    }}
                    disabled={(!isAdmin && !!params._id) || (!!params._id && !!group?.circleId)}
                  />
                ) : null}
                <FormControl variant="outlined" fullWidth margin="normal">
                  <InputLabel htmlFor="type" id="type-label" ref={typeLabel}>
                    {i18n.__('pages.AdminSingleGroupPage.type')}
                  </InputLabel>
                  <Select
                    labelId="type-label"
                    label={i18n.__('pages.AdminSingleGroupPage.type')}
                    id="type"
                    name="type"
                    value={groupData.type}
                    onChange={onUpdateField}
                    disabled={(!isAdmin && !!params._id) || isAutomaticGroup}
                  >
                    {Object.keys(Groups.typeLabels)
                      .filter((type) => type !== '15')
                      .map((val) => (
                        <MenuItem key={val} value={val}>
                          {i18n.__(Groups.typeLabels[val])}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <TextField
                  onChange={onUpdateField}
                  value={groupData.description}
                  name="description"
                  label={i18n.__('pages.AdminSingleGroupPage.description')}
                  variant="outlined"
                  inputProps={{ maxLength: 64 }}
                  fullWidth
                  multiline
                  margin="normal"
                />
              </Grid>
              <Grid item xs={isMobile ? 12 : 6}>
                <AvatarPicker
                  avatar={groupData.avatar || ''}
                  type={groupData.type}
                  group={groupData}
                  onAssignAvatar={onAssignAvatar}
                  profil="true"
                  userActive={user.isActive}
                />
              </Grid>
            </Grid>
            <div className={classes.wysiwyg}>
              <InputLabel htmlFor="content">{i18n.__('pages.AdminSingleGroupPage.content')}</InputLabel>
              <CustomToolbarArticle withMedia={false} withWebcam={false} />
              <ReactQuill
                id="content"
                value={content}
                onChange={onUpdateRichText}
                modules={quillOptions}
                formats={formats}
              />
            </div>
            {params._id ? (
              // user management is not possible when creating a new group
              <>
                <Tabs
                  value={tabId}
                  to={tabId}
                  onChange={handleChangeTab}
                  indicatorColor="primary"
                  textColor="primary"
                  centered
                >
                  {groupData.type === 5 && <Tab label={i18n.__('api.groups.labels.candidates')} />}
                  <Tab label={i18n.__('api.groups.labels.members')} />
                  <Tab label={i18n.__('api.groups.labels.animators')} />
                  <Tab label={i18n.__('api.groups.labels.admins')} />
                </Tabs>
                {groupData.type === 5 && <TabPanel value={tabId} index={0} userRole="candidate" groupId={group._id} />}
                <TabPanel value={tabId} index={groupData.type === 5 ? 1 : 0} userRole="member" groupId={group._id} />
                <TabPanel value={tabId} index={groupData.type === 5 ? 2 : 1} userRole="animator" groupId={group._id} />
                <TabPanel value={tabId} index={groupData.type === 5 ? 3 : 2} userRole="admin" groupId={group._id} />
              </>
            ) : null}
            <div className={classes.buttonGroup}>
              <Button variant="contained" onClick={cancelForm} className={classes.button}>
                {i18n.__('pages.AdminSingleGroupPage.cancel')}
              </Button>
              {params._id && canDelete ? (
                <Button
                  variant="contained"
                  onClick={deleteGroup}
                  style={{ backgroundColor: 'red', color: 'white' }}
                  className={classes.button}
                >
                  {i18n.__('pages.AdminSingleGroupPage.delete')}
                </Button>
              ) : null}
              <Button
                variant="contained"
                color="primary"
                onClick={submitUpdateGroup}
                disabled={nameIsInvalid() || typeIsInvalid() || errorShare}
                className={classes.button}
              >
                {params._id ? i18n.__('pages.AdminSingleGroupPage.update') : i18n.__('pages.AdminSingleGroupPage.save')}
              </Button>
            </div>
          </form>
        </Paper>
        {openRemoveModal ? (
          <AdminGroupDelete
            group={group}
            open={openRemoveModal}
            onClose={() => {
              setOpenRemoveModal(false);
            }}
          />
        ) : null}
      </Container>
    </Fade>
  );
};

export default withTracker(
  ({
    match: {
      params: { _id },
    },
  }) => {
    let group = {};
    let ready = false;
    if (_id) {
      const subGroup = Meteor.subscribe('groups.one.admin', { _id });
      group = Groups.findOneFromPublication('groups.one.admin', { _id });
      ready = subGroup.ready();
    } else {
      ready = true;
    }
    return {
      group,
      ready,
    };
  },
)(AdminSingleGroupPage);

AdminSingleGroupPage.defaultProps = {
  group: {},
};

AdminSingleGroupPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  group: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
