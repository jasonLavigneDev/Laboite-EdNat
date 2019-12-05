import React, { useState, useEffect } from 'react';
import { Accounts } from 'meteor/accounts-base';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { useHistory } from 'react-router-dom';
import validate from 'validate.js';
import i18n from 'meteor/universe:i18n';
import { Snackbar } from '@material-ui/core';

validate.options = {
  fullMessages: false,
};

const schema = {
  firstName: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 32,
    },
  },
  lastName: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 32,
    },
  },
  userName: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 32,
    },
  },
  email: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    email: {
      message: 'validatejs.isEmail',
    },
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
  structureSelect: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
  },
};

const useStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
  const history = useHistory();
  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
  });
  const [values, setValues] = React.useState({
    showPassword: false,
  });
  const [openError, setOpenError] = useState(false);

  const structureLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(structureLabel.current.offsetWidth);
  }, []);

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState(() => ({
      ...formState,
      isValid: !errors,
      errors: errors || {},
    }));
  }, [formState.values]);

  const handleChange = (event) => {
    event.persist();

    setFormState(() => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true,
      },
    }));
  };

  const handleBlurEmail = (event) => {
    if (formState.values.userName === undefined || formState.values.userName === '') {
      setFormState({
        ...formState,
        values: {
          ...formState.values,
          userName: event.target.value,
        },
      });
    }
  };

  const handleSignUp = (event) => {
    event.preventDefault();
    history.push('/');
    if (formState.isValid === true) {
      const {
        firstName, lastName, email, userName, password, structureSelect,
      } = formState.values;
      Accounts.createUser(
        {
          firstName,
          lastName,
          username: userName,
          email,
          password,
          structure: structureSelect,
        },
        (error) => {
          if (error) {
            setOpenError(true);
          } else {
            history.push('/');
          }
        },
      );
    }
  };

  const hasError = (field) => !!(formState.touched[field] && formState.errors[field]);

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {i18n.__('pages.SignUp.appDescription')}
        </Typography>
        <form onSubmit={handleSignUp} className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                required
                id="firstName"
                autoFocus
                error={hasError('firstName')}
                fullWidth
                helperText={hasError('firstName') ? i18n.__(formState.errors.firstName[0]) : null}
                label={i18n.__('pages.SignUp.firstNameLabel')}
                name="firstName"
                onChange={handleChange}
                type="text"
                value={formState.values.firstName || ''}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="lastName"
                autoComplete="lname"
                error={hasError('lastName')}
                fullWidth
                helperText={hasError('lastName') ? i18n.__(formState.errors.lastName[0]) : null}
                label={i18n.__('pages.SignUp.lastNameLabel')}
                name="lastName"
                onChange={handleChange}
                type="text"
                value={formState.values.lastName || ''}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} spacing={2}>
              <TextField
                margin="normal"
                required
                id="email"
                label={i18n.__('pages.SignUp.emailLabel')}
                name="email"
                autoComplete="email"
                error={hasError('email')}
                fullWidth
                helperText={hasError('email') ? i18n.__(formState.errors.email[0]) : null}
                onChange={handleChange}
                onBlur={handleBlurEmail}
                type="text"
                value={formState.values.email || ''}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} spacing={6}>
              <TextField
                required
                id="userName"
                name="userName"
                autoComplete="username"
                error={hasError('userName')}
                fullWidth
                helperText={hasError('userName') ? i18n.__(formState.errors.userName[0]) : null}
                label={i18n.__('pages.SignUp.userNameLabel')}
                onChange={handleChange}
                type="text"
                value={formState.values.userName || ''}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} spacing={2}>
              <FormControl variant="outlined" fullWidth required>
                <InputLabel htmlFor="password" className={hasError('password') ? 'Mui-error' : ''}>
                  {i18n.__('pages.SignUp.pwdLabel')}
                </InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={values.showPassword ? 'text' : 'password'}
                  value={formState.values.password || ''}
                  error={hasError('password')}
                  labelWidth={100}
                  onChange={handleChange}
                  endAdornment={(
                    <InputAdornment position="end">
                      <IconButton
                        title={i18n.__('pages.SignUp.pwdButtonLabel')}
                        aria-label={i18n.__('pages.SignUp.pwdButtonLabel')}
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {values.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )}
                />
                <FormHelperText className={hasError('password') ? 'Mui-error' : ''}>
                  {hasError('password') ? i18n.__(formState.errors.password[0]) : null}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} spacing={2}>
              <FormControl variant="outlined" className={classes.formControl} fullWidth>
                <InputLabel
                  ref={structureLabel}
                  id="structure-label"
                  className={hasError('structureSelect') ? 'Mui-error' : ''}
                >
                  {i18n.__('pages.SignUp.structureLabel')}
                </InputLabel>
                <Select
                  labelId="structure-label"
                  id="structureSelect"
                  name="structureSelect"
                  value={formState.values.structureSelect || ''}
                  error={hasError('structureSelect')}
                  onChange={handleChange}
                  labelWidth={labelWidth}
                >
                  {/* FIXME : translate those items ? */}
                  <MenuItem value="">
                    <em>Aucune</em>
                  </MenuItem>
                  <MenuItem value="Ministère Education">Ministére Education</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                  <MenuItem value="Auvergne-Rhône-Alpes">Région académique Auvergne-Rhône-Alpes</MenuItem>
                  <MenuItem value="Bourgogne-Franche-Comté">Région académique Bourgogne-Franche-Comté</MenuItem>
                  <MenuItem value="Bretagne">Région académique Bretagne</MenuItem>
                  <MenuItem value="Centre-Val de Loire">Région académique Centre-Val de Loire</MenuItem>
                  <MenuItem value="Corse">Région académique de Corse</MenuItem>
                  <MenuItem value="Grand Est">Région académique Grand Est</MenuItem>
                  <MenuItem value="Guadeloupe">Région académique de la Guadeloupe</MenuItem>
                  <MenuItem value="Guyane">Région académique de la Guyane</MenuItem>
                  <MenuItem value="Hauts-de-France">Région académique Hauts-de-France</MenuItem>
                  <MenuItem value="Île-de-France">Région académique Île-de-France</MenuItem>
                  <MenuItem value="Martinique">Région académique de Martinique</MenuItem>
                  <MenuItem value="Normandie">Région académique Normandie</MenuItem>
                  <MenuItem value="Nouvelle-Aquitaine">Région académique Nouvelle-Aquitaine</MenuItem>
                  <MenuItem value="Occitanie">Région académique Occitanie</MenuItem>
                  <MenuItem value="Pays de la Loire">Région académique Pays de la Loire</MenuItem>
                  <MenuItem value="Provence-Alpes-Côte d'Azur">
                    Région académique Provence-Alpes-Côte d&apos;Azur
                  </MenuItem>
                  <MenuItem value="La Réunion">Région académique de La Réunion</MenuItem>
                  <MenuItem value="Collectivité">Collectivité</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
                </Select>
                <FormHelperText className={hasError('structureSelect') ? 'Mui-error' : ''}>
                  {hasError('structureSelect') ? i18n.__(formState.errors.structureSelect[0]) : null}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={!formState.isValid}
            >
              {i18n.__('pages.SignUp.submitButtonLabel')}
            </Button>
          </Grid>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={openError}
            autoHideDuration={4000}
            onClose={handleErrorClose}
            ContentProps={{
              'aria-describedby': 'message-id',
              className: classes.error,
            }}
            message={<span id="message-id">{i18n.__('pages.SignUp.createError')}</span>}
          />
        </form>
      </div>
    </Container>
  );
}
