import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import { useTracker } from 'meteor/react-meteor-data';
import { useHistory } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import Fade from '@material-ui/core/Fade';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MailIcon from '@material-ui/icons/Mail';
import Input from '@material-ui/core/Input';
import AutoComplete from '@material-ui/lab/Autocomplete';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import LanguageSwitcher from '../../components/system/LanguageSwitcher';
import debounce from '../../utils/debounce';
import { useObjectState } from '../../utils/hooks';
import { downloadBackupPublications, uploadBackupPublications } from '../../../api/articles/methods';
import AvatarPicker from '../../components/users/AvatarPicker';
import Structures from '../../../api/structures/structures';
import { getStructure, useStructure } from '../../../api/structures/hooks';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(5),
  },
  form: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: '10px',
  },
  keycloakMessage: {
    padding: theme.spacing(1),
  },
  inputFile: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    opacity: 0,
  },
  fileWrap: {
    position: 'relative',
  },
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  maxWidth: {
    maxWidth: '88vw',
  },
  labelLanguage: {
    fontSize: 16,
    margin: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  keycloakLink: {
    textDecoration: 'underline',
    '&:hover, &:focus': {
      color: theme.palette.secondary.main,
      outline: 'none',
    },
  },
}));

const defaultState = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  structureSelect: '',
  logoutType: '',
  avatar: '',
  advancedPersonalPage: false,
  articlesEnable: false,
};

const logoutTypeLabels = {
  ask: 'api.users.logoutTypes.ask',
  local: 'api.users.logoutTypes.local',
  global: 'api.users.logoutTypes.global',
};

const ProfilePage = () => {
  const history = useHistory();
  const [userData, setUserData] = useState(defaultState);
  const [submitOk, setSubmitOk] = useState(false);
  const [errors, setErrors] = useObjectState(defaultState);
  const [submitted, setSubmitted] = useState(false);
  const [structChecked, setStructChecked] = useState(false);
  const classes = useStyles();
  const { disabledFeatures = {}, enableKeycloak } = Meteor.settings.public;
  const enableBlog = !disabledFeatures.blog;
  const [{ user, loadingUser, isMobile }, dispatch] = useAppContext();

  const userStructure = useStructure();

  const [selectedStructure, setSelectedStructure] = useState(userStructure || null);
  useEffect(() => {
    (async () => {
      if (user.structure && user.structure.length > 0) {
        const structure = await getStructure(user.structure);
        setSelectedStructure(structure);
      }
    })();
  }, [userStructure, user.structure]);

  const [searchText, setSearchText] = useState('');
  const { flatData, isSearchLoading } = useTracker(() => {
    const subName = 'structures.top.with.direct.parent';
    const ret = { flatData: [], isSearchLoading: false };
    if (searchText.length > 2) {
      const handle = Meteor.subscribe(subName, { searchText });
      const isLoading = !handle.ready();
      const structures = Structures.findFromPublication(subName).fetch();
      ret.flatData = structures;
      ret.isSearchLoading = isLoading;
    }
    return ret;
  }, [searchText && searchText.length > 2]);

  const usernameLabel = React.useRef(null);
  const [labelUsernameWidth, setLabelUsernameWidth] = React.useState(0);
  useEffect(() => {
    setLabelUsernameWidth(usernameLabel.current.offsetWidth);
  }, []);
  const logoutTypeLabel = React.useRef(null);
  const [labelLogoutTypeWidth, setLabelLogoutTypeWidth] = React.useState(0);
  useEffect(() => {
    if (enableKeycloak) setLabelLogoutTypeWidth(logoutTypeLabel.current.offsetWidth);
  }, []);
  const [tempImageLoaded, setTempImageLoaded] = useState(false);
  const { minioEndPoint } = Meteor.settings.public;

  const checkSubmitOk = () => {
    const errSum = Object.keys(errors).reduce((sum, name) => {
      if (name === 'advancedPersonalPage' || name === 'articlesEnable') {
        // checkbox not concerned by errors
        return sum;
      }
      return sum + errors[name];
    }, '');
    if (errSum !== '') {
      return false;
    }
    return true;
  };

  const setData = (data, reset = false) => {
    setUserData({
      username: errors.username === '' || reset ? data.username : userData.username,
      structureSelect: data.structure,
      logoutType: data.logoutType || 'ask',
      firstName: errors.firstName === '' || reset ? data.firstName || '' : userData.firstName,
      lastName: errors.lastName === '' || reset ? data.lastName || '' : userData.lastName,
      email: errors.email === '' || reset ? data.emails[0].address : userData.email,
      avatar: userData.avatar === '' || reset ? data.avatar : userData.avatar,
      advancedPersonalPage:
        userData.advancedPersonalPage === false || reset ? data.advancedPersonalPage : userData.advancedPersonalPage,
      articlesEnable: userData.articlesEnable === false || reset ? data.articlesEnable : userData.articlesEnable,
    });
    if (reset === true) {
      setErrors(defaultState);
      setSubmitted(false);
    }
  };

  useEffect(() => {
    if (
      submitted &&
      userData.firstName === user.firstName &&
      userData.lastName === user.lastName &&
      userData.email === user.emails[0].address &&
      userData.username === user.username &&
      userData.structureSelect === user.structure &&
      userData.logoutType === user.logoutType &&
      userData.avatar === user.avatar &&
      userData.advancedPersonalPage === user.advancedPersonalPage &&
      userData.articlesEnable === user.articlesEnable
    ) {
      msg.success(i18n.__('pages.ProfilePage.updateSuccess'));
      setSubmitted(false);
    }
    if (user._id) {
      setData(user);
    }
  }, [user]);

  useEffect(() => {
    setSubmitOk(checkSubmitOk());
  }, [errors]);

  function validateName(name) {
    if (name.trim() !== '') {
      Meteor.call('users.checkUsername', { username: name.trim() }, (err, res) => {
        if (err) {
          msg.error(err.message);
        } else if (res === true) {
          setErrors({ username: '' });
        } else {
          setErrors({ username: i18n.__('pages.ProfilePage.usernameError') });
        }
      });
    }
  }
  const debouncedValidateName = debounce(validateName, 500);

  const resetForm = () => {
    if (tempImageLoaded && minioEndPoint) {
      // A temporary image has been loaded in minio with name "Avatar_TEMP"
      // => delete it
      Meteor.call('files.selectedRemove', {
        path: `users/${Meteor.userId()}`,
        toRemove: [`users/${Meteor.userId()}/Avatar_TEMP.png`],
      });
    }
    setTempImageLoaded(false);
    setData(user, true);
  };

  const onCheckOption = (event) => {
    const { name, checked } = event.target;
    setUserData({ ...userData, [name]: checked });
  };

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
    if (value.trim() === '') {
      setErrors({ [name]: i18n.__('pages.ProfilePage.valueRequired') });
    } else if (name === 'username') {
      setSubmitOk(false);
      // check for username validity
      debouncedValidateName(value);
    } else {
      setErrors({ [name]: '' });
    }
  };

  const submitUpdateUser = () => {
    setSubmitted(true);
    let modifications = false;
    if (userData.username !== user.username) {
      modifications = true;
      Meteor.call('users.setUsername', { username: userData.username.trim() }, (error) => {
        if (error) {
          msg.error(error.message);
        }
      });
    }
    if (userData.structureSelect !== user.structure) {
      modifications = true;
      Meteor.call('users.setStructure', { structure: userData.structureSelect }, (error) => {
        if (error) {
          msg.error(error.message);
        }
      });
      if (!user.advancedPersonalPage) {
        Meteor.call('personalspaces.generateDefaultPersonalSpace', {}, (error) => {
          if (error) {
            msg.error(error.message);
          }
        });
      }
    }
    if (userData.logoutType !== user.logoutType) {
      modifications = true;
      Meteor.call('users.setLogoutType', { logoutType: userData.logoutType }, (error) => {
        if (error) {
          msg.error(error.message);
        }
      });
    }
    if (userData.email !== user.emails[0].address) {
      modifications = true;
      Meteor.call('users.setEmail', { email: userData.email.trim() }, (error) => {
        if (error) {
          if (error.error === 'validation-error') {
            setErrors({ email: error.details[0].message });
          } else if (error.message === 'Email already exists. [403]') {
            setErrors({ email: i18n.__('pages.ProfilePage.emailAlreadyExists') });
          } else setErrors({ email: error.message });
        }
      });
    }
    if (userData.firstName !== user.firstName || userData.lastName !== user.lastName) {
      modifications = true;
      Meteor.call(
        'users.setName',
        { firstName: userData.firstName.trim(), lastName: userData.lastName.trim() },
        (error) => {
          if (error) {
            if (error.error === 'validation-error') {
              error.details.forEach((detail) => {
                if (detail.name === 'firstName') {
                  setErrors({ firstName: detail.message });
                } else setErrors({ lastName: detail.message });
              });
            } else {
              msg.error(error.message);
            }
          }
        },
      );
    }
    if (userData.avatar !== user.avatar) {
      modifications = true;
      if (tempImageLoaded && minioEndPoint) {
        // A temporary image has been loaded in user minio with name "Avatar_TEMP"
        if (userData.avatar.includes('Avatar_TEMP')) {
          // This image will be the new user's avatar
          Meteor.call('files.rename', {
            path: `users/${Meteor.userId()}`,
            oldName: 'Avatar_TEMP.png',
            newName: 'Avatar.png',
          });
        } else {
          // the temporary image will not be used => delete it
          Meteor.call('files.selectedRemove', {
            path: `users/${Meteor.userId()}`,
            toRemove: [`users/${Meteor.userId()}/Avatar_TEMP.png`],
          });
        }
        setTempImageLoaded(false);
      }
      // replace 'Avatar_TEMP.png' even if the image comes from gallery then the name will be unchanged
      Meteor.call('users.setAvatar', { avatar: userData.avatar.replace('Avatar_TEMP.png', 'Avatar.png') }, (error) => {
        if (error) {
          msg.error(error.message);
        }
      });
    }
    if (userData.advancedPersonalPage !== user.advancedPersonalPage) {
      modifications = true;
      Meteor.call('users.toggleAdvancedPersonalPage', {}, (error) => {
        if (error) {
          msg.error(error.message);
        }
      });
      if (
        !userData.advancedPersonalPage &&
        user.advancedPersonalPage &&
        confirm(i18n.__('pages.ProfilePage.confirmResetPersonalSpace')) // eslint-disable-line
      ) {
        Meteor.call('personalspaces.generateDefaultPersonalSpace', {}, (error) => {
          if (error) {
            msg.error(error.message);
          } else {
            msg.success(i18n.__('pages.ProfilePage.personalSpaceGenerated'));
          }
        });
      }
    }
    if (userData.articlesEnable !== user.articlesEnable) {
      modifications = true;
      Meteor.call('users.setArticlesEnable', {}, (error) => {
        if (error) {
          msg.error(error.message);
        }
      });
    }

    if (modifications === false) msg.info(i18n.__('pages.ProfilePage.noModifications'));
  };

  const useEmail = () => {
    setUserData({ ...userData, username: userData.email });
    setErrors({ username: '' });
  };
  const downloadBackup = () => {
    downloadBackupPublications.call((error, results) => {
      if (error) {
        msg.error(error.reason);
      } else {
        const file = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(results))}`;

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = file;
        // the filename you want
        a.download = `backup_${new Date().getTime()}.json`;
        a.click();
      }
    });
  };
  const uploadData = ({ target: { files = [] } }) => {
    const reader = new FileReader();

    reader.onload = function uploadArticles(theFile) {
      const articles = JSON.parse(theFile.target.result);
      uploadBackupPublications.call({ articles, updateStructure: structChecked }, (error) => {
        if (error) {
          msg.error(error.reason);
        } else {
          msg.success(i18n.__('pages.ProfilePage.uploadSuccess'));
        }
      });
    };
    reader.readAsText(files[0]);
  };

  // eslint-disable-next-line max-len
  const accountURL = `${Meteor.settings.public.keycloakUrl}/realms/${Meteor.settings.public.keycloakRealm}/account`;

  const SendNewAvatarToMedia = (avImg) => {
    dispatch({
      type: 'uploads.add',
      data: {
        name: 'Avatar_TEMP',
        fileName: 'Avatar_TEMP',
        file: avImg,
        type: 'png',
        path: `users/${Meteor.userId()}`,
        storage: true,
        isUser: true,
        onFinish: (url) => {
          // Add time to url to avoid caching
          setUserData({ ...userData, avatar: `${url}?${new Date().getTime()}` });
          setTempImageLoaded(true);
        },
      },
    });
  };

  const onAssignAvatar = (avatarObj) => {
    // avatarObj = {image: base64... or url: http...}
    if (avatarObj.image) {
      SendNewAvatarToMedia(avatarObj.image);
    } else if (avatarObj.url !== user.avatar) {
      setUserData({ ...userData, avatar: avatarObj.url });
    }
  };

  const getAuthToken = () => {
    Meteor.call('users.getAuthToken', (error, result) => {
      if (!result) {
        msg.error(i18n.__('pages.ProfilePage.noAuthToken'));
      } else if (error) {
        msg.error(error.reason);
      } else {
        navigator.clipboard.writeText(result).then(msg.success(i18n.__('pages.ProfilePage.successCopyAuthToken')));
      }
    });
  };

  const resetAuthToken = () => {
    Meteor.call('users.resetAuthToken', (error, result) => {
      if (!result) {
        msg.error(i18n.__('pages.ProfilePage.noAuthToken'));
      } else if (error) {
        msg.error(error.reason);
      } else {
        navigator.clipboard
          .writeText(result)
          .then(msg.success(i18n.__('pages.ProfilePage.successResetAndCopyAuthToken')));
      }
    });
  };

  if (loadingUser) {
    return <Spinner />;
  }

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.ProfilePage.title')}</Typography>
          <form noValidate autoComplete="off">
            <Grid container className={classes.form} spacing={2}>
              <Grid container spacing={2} style={{ alignItems: 'center' }}>
                <Grid item xs={isMobile ? 16 : 8} style={{ paddingLeft: '18px' }}>
                  {enableKeycloak ? (
                    <Paper className={classes.keycloakMessage}>
                      <Typography>{i18n.__('pages.ProfilePage.keycloakProcedure')}</Typography>
                      <br />
                      <Typography>
                        <a href={accountURL} className={classes.keycloakLink}>
                          {i18n.__('pages.ProfilePage.keycloakProcedureLink')}
                        </a>
                      </Typography>
                    </Paper>
                  ) : null}
                  <TextField
                    disabled={enableKeycloak}
                    margin="normal"
                    autoComplete="fname"
                    id="firstName"
                    label={i18n.__('pages.SignUp.firstNameLabel')}
                    name="firstName"
                    error={errors.firstName !== ''}
                    helperText={errors.firstName}
                    onChange={onUpdateField}
                    fullWidth
                    type="text"
                    value={userData.firstName || ''}
                    variant="filled"
                  />
                  <TextField
                    disabled={enableKeycloak}
                    margin="normal"
                    id="lastName"
                    autoComplete="lname"
                    label={i18n.__('pages.SignUp.lastNameLabel')}
                    name="lastName"
                    error={errors.lastName !== ''}
                    helperText={errors.lastName}
                    onChange={onUpdateField}
                    fullWidth
                    type="text"
                    value={userData.lastName || ''}
                    variant="filled"
                  />
                  <TextField
                    disabled={enableKeycloak}
                    margin="normal"
                    id="email"
                    label={i18n.__('pages.SignUp.emailLabel')}
                    name="email"
                    autoComplete="email"
                    error={errors.email !== ''}
                    helperText={errors.email}
                    fullWidth
                    onChange={onUpdateField}
                    type="text"
                    value={userData.email || ''}
                    variant="filled"
                  />
                  <FormControl variant="filled" fullWidth disabled={enableKeycloak} margin="normal">
                    <InputLabel
                      error={errors.username !== ''}
                      htmlFor="username"
                      id="username-label"
                      ref={usernameLabel}
                    >
                      {i18n.__('api.users.labels.username')}
                    </InputLabel>
                    <OutlinedInput
                      id="username"
                      name="username"
                      value={userData.username}
                      error={errors.username !== ''}
                      onChange={onUpdateField}
                      // variant="filled"
                      labelWidth={labelUsernameWidth}
                      endAdornment={
                        <InputAdornment position="end">
                          <Tooltip
                            title={i18n.__('pages.ProfilePage.useEmail')}
                            aria-label={i18n.__('pages.ProfilePage.useEmail')}
                          >
                            <span>
                              <IconButton onClick={useEmail} disabled={enableKeycloak}>
                                <MailIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      }
                    />
                    <FormHelperText id="username-helper-text" error={errors.username !== ''}>
                      {errors.username}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={isMobile ? 12 : 4}>
                  <AvatarPicker
                    userAvatar={userData.avatar || ''}
                    userFirstName={userData.firstName || ''}
                    onAssignAvatar={onAssignAvatar}
                  />
                </Grid>
              </Grid>
              <Grid item />
              <Grid item className={classes.maxWidth}>
                <FormControl variant="filled" className={classes.formControl} fullWidth>
                  <Typography>
                    {selectedStructure && selectedStructure.name
                      ? `${i18n.__('pages.ProfilePage.currentStructure')} ${selectedStructure.name}`
                      : i18n.__('pages.ProfilePage.noCurrentStructure')}
                  </Typography>
                  <AutoComplete
                    options={flatData}
                    loading={isSearchLoading}
                    getOptionLabel={(option) => option.name}
                    renderOption={(option) => {
                      let parent;
                      if (option.parentId) {
                        parent = flatData.find((s) => s._id === option.parentId);
                      }
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div>{option.name}</div>
                          {!!option.parentId && (
                            <div style={{ fontSize: 10, color: 'grey', fontStyle: 'italic' }}>
                              {parent ? parent.name : ''}
                            </div>
                          )}
                        </div>
                      );
                    }}
                    onChange={(event, newValue) => {
                      if (newValue && newValue._id)
                        onUpdateField({
                          target: {
                            name: 'structureSelect',
                            value: newValue._id,
                          },
                        });
                    }}
                    inputValue={searchText}
                    onInputChange={(event, newInputValue) => {
                      setSearchText(newInputValue);
                    }}
                    getOptionSelected={(opt, val) => opt._id === val._id}
                    style={{ width: 500 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        onChange={({ target: { value } }) => setSearchText(value)}
                        variant="outlined"
                        label={i18n.__('pages.ProfilePage.chooseAttachementStructure')}
                        placeholder={i18n.__('pages.ProfilePage.noSelectedStructure')}
                      />
                    )}
                  />
                </FormControl>
                <FormControl variant="filled" className={classes.formControl} fullWidth>
                  <Button variant="outlined" onClick={() => history.push('/profileStructureSelection')}>
                    {i18n.__('pages.ProfilePage.openStructureSelection')}
                  </Button>
                </FormControl>
              </Grid>
              {enableKeycloak ? (
                <Grid item>
                  <FormControl variant="filled" fullWidth>
                    <InputLabel htmlFor="logoutType" id="logoutType-label" ref={logoutTypeLabel}>
                      {i18n.__('pages.ProfilePage.logoutType')}
                    </InputLabel>
                    <Select
                      labelId="logoutType-label"
                      id="logoutType"
                      name="logoutType"
                      value={userData.logoutType}
                      onChange={onUpdateField}
                      labelWidth={labelLogoutTypeWidth}
                    >
                      {Object.keys(logoutTypeLabels).map((val) => (
                        <MenuItem key={val} value={val}>
                          {i18n.__(logoutTypeLabels[val])}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ) : null}
              <Grid item>
                <Grid container spacing={2} style={{ alignItems: 'center' }}>
                  <p className={classes.labelLanguage}>{i18n.__('pages.ProfilePage.languageLabel')}</p>
                  <LanguageSwitcher relative />
                </Grid>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="advancedPersonalPage"
                      name="advancedPersonalPage"
                      color="primary"
                      checked={userData.advancedPersonalPage}
                      onChange={onCheckOption}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  }
                  label={i18n.__('pages.ProfilePage.advancedPersonalPage')}
                />
                {enableBlog && (
                  <>
                    <br />
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="articlesEnable"
                          name="articlesEnable"
                          color="primary"
                          checked={userData.articlesEnable}
                          onChange={onCheckOption}
                          inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                      }
                      label={i18n.__('pages.ProfilePage.activateArticles')}
                    />
                  </>
                )}
              </Grid>
            </Grid>
            <div className={classes.buttonGroup}>
              <Button variant="contained" onClick={resetForm}>
                {i18n.__('pages.ProfilePage.reset')}
              </Button>
              <Button variant="contained" disabled={!submitOk} color="primary" onClick={submitUpdateUser}>
                {i18n.__('pages.ProfilePage.update')}
              </Button>
            </div>
          </form>
        </Paper>
        {enableBlog && (
          <Paper className={classes.root}>
            <Typography variant={isMobile ? 'h4' : 'h5'}>{i18n.__('pages.ProfilePage.backupTitle')}</Typography>
            <p>{i18n.__('pages.ProfilePage.backupMessage')}</p>

            <Grid container>
              <Grid item xs={12} sm={6} md={6} className={classes.buttonWrapper}>
                <Button variant="contained" onClick={downloadBackup} color="secondary">
                  {i18n.__('pages.ProfilePage.downloadPublicationBackup')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={6} className={classes.buttonWrapper}>
                <div className={classes.fileWrap}>
                  <label htmlFor="upload">
                    <Input className={classes.inputFile} type="file" id="upload" onChange={uploadData} />
                    <Button variant="contained" color="secondary" component="span" tabIndex={-1}>
                      {i18n.__('pages.ProfilePage.UploadPublicationBackup')}
                    </Button>
                  </label>
                </div>
              </Grid>
            </Grid>
            {user.structure ? (
              <p>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={!user.structure}
                      color="primary"
                      checked={structChecked}
                      onChange={() => setStructChecked(!structChecked)}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  }
                  label={i18n.__('pages.ProfilePage.structureMessage')}
                />
              </p>
            ) : null}
          </Paper>
        )}
        <Paper className={classes.root}>
          <Typography variant={isMobile ? 'h4' : 'h5'}>{i18n.__('pages.ProfilePage.authTokenTitle')}</Typography>
          <p>{i18n.__('pages.ProfilePage.authTokenMessage')}</p>
          <p>
            <b>{i18n.__('pages.ProfilePage.resetTokenMessage')}</b>
          </p>

          <Grid container centered>
            <Grid item xs={12} sm={6} md={6} className={classes.buttonWrapper}>
              <Button variant="contained" onClick={getAuthToken} color="primary">
                {i18n.__('pages.ProfilePage.getAuthToken')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={6} className={classes.buttonWrapper}>
              <Button variant="contained" onClick={resetAuthToken} color="secondary">
                {i18n.__('pages.ProfilePage.resetAuthToken')}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

export default ProfilePage;

// export default withTracker(() => {
//   const structuresHandle = Meteor.subscribe('structures.all');
//   const loading = !structuresHandle.ready();
//   const structures = Structures.find({}, { sort: { name: 1 } }).fetch();
//   return {
//     structures,
//     loading,
//   };
// })(ProfilePage);
