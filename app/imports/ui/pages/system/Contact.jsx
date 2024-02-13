import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { useTracker, withTracker } from 'meteor/react-meteor-data';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import GlobalStyles from '@mui/material/GlobalStyles';
import i18n from 'meteor/universe:i18n';
import { useHistory } from 'react-router-dom';
import FormHelperText from '@mui/material/FormHelperText';
import CustomSelect from '../../components/admin/CustomSelect';
import Structures from '../../../api/structures/structures';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import { useFormStateValidator } from '../../utils/hooks';

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
  email: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    email: {
      message: 'validatejs.isEmail',
    },
    length: {
      maximum: 64,
    },
  },
  text: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
    length: {
      maximum: 5096,
    },
  },
  structureSelect: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
  },
  captcha: {
    presence: { allowEmpty: false, message: 'validatejs.isRequired' },
  },
};

const useStyles = makeStyles()((theme) => ({
  paper: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emailForm: {
    marginTop: -15,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const rndmNr1 = Math.floor(Math.random() * 100);
const rndmNr2 = Math.floor(Math.random() * 10);
const totalNr = rndmNr1 + rndmNr2;

const Contact = ({ structures, loading }) => {
  if (loading) return <Spinner full />;
  const [{ user }] = useAppContext();
  const history = useHistory();
  const { classes, theme } = useStyles();
  const [formState, handleChange] = useFormStateValidator(schema);
  const [externalSite, setExternalSite] = useState(null);

  const userStructure = useTracker(() => {
    if (user) {
      const st = Structures.findOne({ _id: user.structure }) || {};
      return st;
    }
    return null;
  }, [user]);

  useEffect(() => {
    if (userStructure) {
      Meteor.call('structures.getContactURL', {}, (err, res) => {
        if (res) {
          setExternalSite(res);
        }
      });
    }
  }, [userStructure]);

  const externalRedirect = () => {
    const url =
      !externalSite.startsWith('http://') && !externalSite.startsWith('https://')
        ? `http://${externalSite}`
        : externalSite;
    window.open(url, '_blank', 'noopener,noreferrer');
    history.push('/personal');
  };

  const hasError = (field) => !!(formState.touched[field] && formState.errors[field]);

  const [captchaIsValid, setCaptchaIsValid] = useState(true);

  const [formSubmit, setFormSubmit] = useState(false);

  const [counter, setCounter] = React.useState(0);

  function onlySpaces(str) {
    return str.trim().length === 0;
  }

  React.useEffect(() => {
    const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onlySpaces(formState.values.text)) {
      msg.error(i18n.__('pages.ContactForm.errorMsgEmpty'));
      return;
    }
    if (user) {
      if (formState.values.text) {
        if (!user.isActive && parseInt(formState.values.captcha, 10) !== totalNr) setCaptchaIsValid(false);
        else {
          setCaptchaIsValid(true);
          const { firstName, lastName } = user;
          const email = user.emails[0].address;
          const { text } = formState.values;
          const { _id: structureId } = userStructure;

          Meteor.call('smtp.sendContactEmail', { firstName, lastName, email, text, structureId }, (err) => {
            if (err) {
              msg.error(err.reason || err.message);
            } else {
              setFormSubmit(true);
              setCounter(5);
              setTimeout(() => {
                history.push('/personal');
              }, 5000);
            }
          });
        }
      }
    } else if (formState.isValid === true) {
      if (parseInt(formState.values.captcha, 10) === totalNr) {
        setCaptchaIsValid(true);
        const { firstName, lastName, email, text, structureSelect: structureId } = formState.values;
        Meteor.call('smtp.sendContactEmail', { firstName, lastName, email, text, structureId }, (err) => {
          if (err) {
            msg.error(err.reason || err.message);
          } else {
            setFormSubmit(true);
            setCounter(5);
            setTimeout(() => {
              history.push('/');
            }, 5000);
          }
        });
      } else {
        setCaptchaIsValid(false);
      }
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: { backgroundColor: theme.palette.common.white },
        }}
      />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {i18n.__('pages.ContactForm.appDescription')}
        </Typography>
        {externalSite ? (
          <>
            <Typography>{i18n.__('pages.ContactForm.externalDescription')}</Typography>
            <Button variant="contained" onClick={externalRedirect}>
              {i18n.__('pages.ContactForm.externalButton')}
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={classes.form} id="my-form" noValidate>
            <Grid container spacing={4}>
              <Grid container item xs={12} sm={6}>
                <TextField
                  autoComplete="fname"
                  required
                  id="firstName"
                  autoFocus
                  fullWidth
                  disabled={!!user}
                  label={i18n.__('pages.ContactForm.firstNameLabel')}
                  name="firstName"
                  type="text"
                  value={user ? user.firstName : formState.values.firstName || ''}
                  error={hasError('firstName')}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item container xs={12} sm={6}>
                <TextField
                  required
                  id="lastName"
                  autoComplete="lname"
                  fullWidth
                  disabled={!!user}
                  label={i18n.__('pages.ContactForm.nameLabel')}
                  name="lastName"
                  type="text"
                  value={user ? user.lastName : formState.values.lastName || ''}
                  error={hasError('lastName')}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid container item xs={12} className={classes.emailForm}>
                <TextField
                  margin="normal"
                  required
                  id="email"
                  label={i18n.__('pages.ContactForm.emailLabel')}
                  name="email"
                  disabled={!!user}
                  autoComplete="email"
                  fullWidth
                  helperText=""
                  type="text"
                  value={user ? (user.emails ? user.emails[0].address : '') : formState.values.email || ''}
                  error={hasError('email')}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid container item xs={12}>
                <FormControl variant="outlined" className={classes.formControl} fullWidth>
                  {user && userStructure ? (
                    <TextField
                      margin="normal"
                      required
                      id="structure"
                      name="structure"
                      label={i18n.__('pages.ContactForm.structureLabel')}
                      disabled={!!user}
                      autoComplete="structure"
                      fullWidth
                      helperText=""
                      type="text"
                      value={userStructure && userStructure._id ? userStructure.name : ''}
                      error={hasError('structureSelect')}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  ) : (
                    <>
                      <InputLabel id="structure-label" className={hasError('structureSelect') ? 'Mui-error' : ''}>
                        {i18n.__('pages.ContactForm.structureLabel')}
                      </InputLabel>
                      <CustomSelect
                        disabled={!!user}
                        value={(user && userStructure._id ? userStructure._id : formState.values.structureSelect) || ''}
                        error={hasError('structureSelect')}
                        onChange={handleChange}
                        options={structures.map((opt) => ({ value: opt._id, label: opt.name }))}
                      />
                    </>
                  )}
                  <FormHelperText className={hasError('structureSelect') ? 'Mui-error' : ''}>
                    {hasError('structureSelect') ? i18n.__(formState.errors.structureSelect[0]) : null}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid container item xs={12}>
                <TextField
                  name="text"
                  multiline
                  fullWidth
                  rows={10}
                  autoFocus={!!user}
                  label={i18n.__('pages.ContactForm.textLabel')}
                  value={formState.values.text || ''}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
                {!user || !user.isActive ? (
                  <TextField
                    margin="normal"
                    name="captcha"
                    required
                    label={`${rndmNr1} + ${rndmNr2}`}
                    fullWidth
                    helperText={i18n.__('pages.ContactForm.captchaInfo')}
                    type="text"
                    error={!user || !user.isActive ? !captchaIsValid : false}
                    value={formState.values.captcha || ''}
                    onChange={handleChange}
                    variant="outlined"
                  />
                ) : null}
              </Grid>
              <Grid container item xs={12}>
                {!formSubmit ? (
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    disabled={user ? !formState.values.text || onlySpaces(formState.values.text) : !formState.isValid}
                  >
                    {i18n.__('pages.ContactForm.submitButtonLabel')}
                  </Button>
                ) : (
                  <p>
                    {i18n.__('pages.ContactForm.redirectMsg')}
                    <br />
                    {counter} {i18n.__('pages.ContactForm.redirectTime')}
                  </p>
                )}
                <Button
                  fullWidth
                  variant="contained"
                  className={classes.submit}
                  onClick={() => history.push(user ? '/personal' : '/')}
                >
                  {i18n.__('pages.ContactForm.cancel')}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </div>
    </Container>
  );
};

Contact.propTypes = {
  structures: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const structuresHandle = Meteor.subscribe('structures.all');
  const loading = !structuresHandle.ready();
  const structures = Structures.find({}, { sort: { name: 1 } }).fetch();
  return {
    structures,
    loading,
  };
})(Contact);
