import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import sanitizeHtml from 'sanitize-html';
import { withTracker } from 'meteor/react-meteor-data';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';
import validate from 'validate.js';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Fade from '@mui/material/Fade';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import Spinner from '../../components/system/Spinner';
import AppSettings from '../../../api/appsettings/appsettings';

import Structures from '../../../api/structures/structures';
import { getCurrentIntroduction } from '../../../api/utils';
import { usePageTracking } from '../../utils/matomo';
import { useAppContext } from '../../contexts/context';
import { useFormStateValidator } from '../../utils/hooks';

validate.options = {
  fullMessages: false,
};

const schema = {
  email: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 64,
    },
  },
  password: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 128,
    },
  },
};

const useStyles = makeStyles()((theme) => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
    position: 'relative',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
}));

if (Meteor.settings.public.enableKeycloak === true) {
  // notify login failure after redirect (useful if another account with same email already exists)
  Accounts.onLoginFailure((details) => {
    let errMsg;
    if (details.error.reason === 'Email already exists.') {
      errMsg = i18n.__('pages.SignIn.EmailAlreadyExists');
    } else {
      errMsg = `${i18n.__('pages.SignIn.keycloakError')} (${details.error.reason})`;
    }
    msg.error(errMsg);
  });
}

function SignIn({ loggingIn, introduction, appsettings, ready }) {
  const [{ isIframed }] = useAppContext();
  const { classes } = useStyles();
  const { trackEvent } = useMatomo();
  usePageTracking({
    documentTitle: 'Page de connexion',
    customDimensions: [
      {
        id: 'Widget',
        value: isIframed,
      },
    ], // optional
  });

  const [formState, handleChange] = useFormStateValidator(schema);

  const [rememberMe, setRememberMe] = useState(true);

  const checkRememberMe = () => {
    window.localStorage.setItem('rememberMe', rememberMe);
    // always reset window.onunload and window.onbeforeunload at login
    window.onunload = null;
    window.onbeforeunload = null;
  };

  const checkAccessAndLogin = async () => {
    if (document.hasStorageAccess && document.requestStorageAccess && isIframed) {
      const hasAccess = await document.hasStorageAccess();
      if (!hasAccess) {
        await document.requestStorageAccess();
        window.location.reload();
        return true;
      }
    }
    return false;
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (formState.isValid === true) {
      checkRememberMe();
      await checkAccessAndLogin();
      const { email, password } = formState.values;
      Meteor.loginWithPassword(email, password, (err) => {
        if (err) {
          msg.error(i18n.__('pages.SignIn.loginError'));
        }
      });
    }
  };

  const handleKeycloakAuth = async () => {
    await checkAccessAndLogin();
    trackEvent({
      category: 'signin-page',
      action: 'connexion-click',
      name: 'Connexion avec Keycloak', // optional
    });
    checkRememberMe();
    Meteor.loginWithKeycloak();
  };

  const hasError = (field) => !!(formState.touched[field] && formState.errors[field]);
  const useKeycloak = Meteor.settings.public.enableKeycloak;

  const RememberButton = () => (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} name="rememberMe" />}
        label={i18n.__('pages.SignIn.rememberMe')}
      />
    </FormGroup>
  );

  return useKeycloak && loggingIn ? (
    <Spinner />
  ) : (
    <Fade in>
      <div>
        <Typography variant="h5" color="inherit" paragraph>
          {i18n.__('pages.SignIn.appDescription')}
        </Typography>
        {!ready && !loggingIn && <Spinner />}
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(introduction) }} />
        <form onSubmit={handleSignIn} className={classes.form} noValidate>
          {loggingIn && <Spinner full />}
          {useKeycloak ? (
            <>
              <Button
                disabled={loggingIn}
                fullWidth
                variant="contained"
                color={appsettings.maintenance ? 'inherit' : 'primary'}
                className={classes.submit}
                onClick={handleKeycloakAuth}
              >
                {appsettings.maintenance
                  ? i18n.__('pages.SignIn.maintenanceLogin')
                  : i18n.__('pages.SignIn.loginKeycloak')}
              </Button>
              <RememberButton />
            </>
          ) : (
            <>
              <TextField
                margin="normal"
                required
                id="email"
                label={i18n.__('pages.SignIn.emailLabel')}
                name="email"
                autoComplete="email"
                autoFocus
                error={hasError('email')}
                fullWidth
                helperText={hasError('email') ? i18n.__(formState.errors.email[0]) : null}
                onChange={handleChange}
                type="text"
                value={formState.values.email || ''}
                variant="outlined"
                disabled={loggingIn}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label={i18n.__('pages.SignIn.pwdLabel')}
                type="password"
                id="password"
                autoComplete="current-password"
                error={hasError('password')}
                helperText={hasError('password') ? i18n.__(formState.errors.password[0]) : null}
                onChange={handleChange}
                value={formState.values.password || ''}
                disabled={loggingIn}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={!formState.isValid || loggingIn}
              >
                {i18n.__('pages.SignIn.connect')}
              </Button>
              <RememberButton />
              <Grid container>
                <Grid item xs>
                  <Link to="/" variant="body2">
                    {i18n.__('pages.SignIn.forgotPwd')}
                  </Link>
                </Grid>
                <Grid item>
                  <Link to="/signup" variant="body2">
                    {i18n.__('pages.SignIn.createAccount')}
                  </Link>
                </Grid>
              </Grid>
            </>
          )}
        </form>
      </div>
    </Fade>
  );
}

export const mainPagesTracker = (settingsSegment = 'all', component) => {
  return withTracker(() => {
    const loggingIn = Meteor.loggingIn();
    const subSettings = Meteor.subscribe(`appsettings.${settingsSegment}`);
    const appsettings = AppSettings.findOne() || {};
    const ready = subSettings.ready();
    const { introduction = [] } = appsettings;
    const currentEntry = getCurrentIntroduction({ introduction }) || {};

    /**
     * @todo
     * This does not work
     */
    if (settingsSegment === 'introduction') {
      const structuresHandle = Meteor.subscribe('structures.all');
      const loadingStructure = !structuresHandle.ready();
      const structures = Structures.find({}, { sort: { name: 1 } }).fetch();
      return {
        loggingIn,
        ready,
        appsettings,
        introduction: currentEntry.content,
        structures,
        loadingStructure,
      };
    }
    return {
      loggingIn,
      ready,
      appsettings,
      introduction: currentEntry.content,
    };
  })(component);
};

export default mainPagesTracker('all', SignIn);

SignIn.defaultProps = {
  introduction: '',
  loggingIn: false,
  appsettings: {},
};

SignIn.propTypes = {
  loggingIn: PropTypes.bool,
  ready: PropTypes.bool.isRequired,
  appsettings: PropTypes.objectOf(PropTypes.any),
  introduction: PropTypes.string,
};
