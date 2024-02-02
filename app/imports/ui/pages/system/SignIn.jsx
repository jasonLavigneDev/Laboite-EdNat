import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import sanitizeHtml from 'sanitize-html';
import { withTracker } from 'meteor/react-meteor-data';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';
import validate from 'validate.js';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import Fade from '@mui/material/Fade';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import Spinner from '../../components/system/Spinner';
import AppSettings from '../../../api/appsettings/appsettings';
import { useAppContext } from '../../contexts/context';

import Structures from '../../../api/structures/structures';
import { getCurrentIntroduction, sanitizeParameters } from '../../../api/utils';

validate.options = {
  fullMessages: false,
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

// notify login failure after redirect (useful if another account with same email already exists)
Accounts.onLoginFailure((details) => {
  let errMsg;
  if (details.error.reason === 'Email already exists.') {
    errMsg = i18n.__('pages.SignIn.EmailAlreadyExists');
  } else if (details.error.reason === 'Missing Keycloak Data') {
    errMsg = i18n.__('pages.SignIn.MissingKeycloakData');
  } else {
    errMsg = `${i18n.__('pages.SignIn.keycloakError')} (${details.error.reason})`;
  }
  msg.error(errMsg);
});

export const checkAccessAndLogin = async (isIframed) => {
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

function SignIn({ loggingIn, introduction, appsettings, ready }) {
  const [{ isIframed }] = useAppContext();
  const { classes } = useStyles();

  const [rememberMe, setRememberMe] = useState(true);

  const checkRememberMe = () => {
    window.localStorage.setItem('rememberMe', rememberMe);
    // always reset window.onunload and window.onbeforeunload at login
    window.onunload = null;
    window.onbeforeunload = null;
  };

  const handleKeycloakAuth = async () => {
    await checkAccessAndLogin(isIframed);
    let keycloackLoginStyle = 'redirect';

    // trackEvent({
    //   category: 'signin-page',
    //   action: 'connexion-click',
    //   name: 'Connexion avec Keycloak', // optional
    // });

    checkRememberMe();

    if (
      (isIframed && Meteor.settings.public.keycloackPopupStyleIframe) ||
      (!isIframed && Meteor.settings.public.keycloackPopupStyle)
    ) {
      keycloackLoginStyle = 'popup';
    }
    Meteor.loginWithKeycloak({ loginStyle: keycloackLoginStyle });
  };

  const RememberButton = () => (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} name="rememberMe" />}
        label={i18n.__('pages.SignIn.rememberMe')}
      />
    </FormGroup>
  );

  return loggingIn ? (
    <Spinner />
  ) : (
    <Fade in>
      <div>
        <Typography variant="h5" color="inherit" paragraph>
          {i18n.__('pages.SignIn.appDescription')}
        </Typography>
        {!ready && !loggingIn && <Spinner />}
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(introduction, sanitizeParameters) }} />
        <div className={classes.form} noValidate>
          {loggingIn && <Spinner full />}
          <Button
            disabled={loggingIn}
            fullWidth
            variant="contained"
            color={appsettings.maintenance ? 'inherit' : 'primary'}
            className={classes.submit}
            onClick={handleKeycloakAuth}
          >
            {appsettings.maintenance ? i18n.__('pages.SignIn.maintenanceLogin') : i18n.__('pages.SignIn.loginKeycloak')}
          </Button>
          <RememberButton />
        </div>
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
