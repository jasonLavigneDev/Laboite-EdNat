import React, { useEffect, useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';

import Spinner from '../../components/system/Spinner';
import AppSettings from '../../../api/appsettings/appsettings';
import LegalComponent from '../../components/admin/LegalComponent';
import IntroductionEdition from '../../components/admin/IntroductionEdition';
import { useAppContext } from '../../contexts/context';
import { switchMaintenanceStatus, updateTextMaintenance } from '../../../api/appsettings/methods';

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
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  buttonText: {
    marginLeft: 10,
  },
  container: {
    flexGrow: 1,
    display: 'flex',
  },
  containerForm: {
    padding: 25,
    display: 'block',
    width: '100%',
  },
  tab: {
    '& > span': {
      alignItems: 'end',
    },
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const tabs = [
  {
    key: 'introduction',
    title: i18n.__('pages.AdminSettingsPage.introduction'),
    Element: IntroductionEdition,
  },
  {
    key: 'legal',
    title: i18n.__('pages.AdminSettingsPage.legal'),
    Element: LegalComponent,
  },
  {
    key: 'personalData',
    title: i18n.__('pages.AdminSettingsPage.personalData'),
    Element: LegalComponent,
  },
  {
    key: 'accessibility',
    title: i18n.__('pages.AdminSettingsPage.accessibility'),
    Element: LegalComponent,
  },
  {
    key: 'gcu',
    title: i18n.__('pages.AdminSettingsPage.gcu'),
    Element: LegalComponent,
  },
];

const AdminSettingsPage = ({ ready, appsettings }) => {
  const [selected, setSelected] = useState(0);
  const [msgMaintenance, setMsgMaintenance] = useState(appsettings.textMaintenance);
  const { classes } = useStyles();
  const [loading, setLoading] = useState(true);
  const [{ isMobile }] = useAppContext();
  const [open, setOpen] = useState(false);

  const onChangeTab = (e, newTab) => {
    setSelected(newTab);
  };

  if (loading && !ready && !appsettings) {
    return <Spinner full />;
  }

  useEffect(() => {
    if (appsettings.textMaintenance !== msgMaintenance) setMsgMaintenance(appsettings.textMaintenance);
  }, [appsettings]);

  const switchMaintenance = (unlockMigration = false) => {
    setLoading(true);
    setOpen(false);
    switchMaintenanceStatus.call({ unlockMigration }, (error) => {
      setLoading(false);
      if (error) {
        console.log(error);
        msg.error(error.message);
      }
    });
  };

  const onCheckMaintenance = () => {
    if (appsettings.maintenance && appsettings.textMaintenance === 'api.appsettings.migrationLockedText') {
      setOpen(true);
    } else {
      switchMaintenance();
    }
  };

  const onButtonMaintenanceClick = () => {
    setLoading(true);
    updateTextMaintenance.call({ text: msgMaintenance }, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
    });
  };

  const onUpdateField = (event) => {
    const { value } = event.target;
    setMsgMaintenance(value);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const buttonIsActive = !!(
    msgMaintenance === null ||
    msgMaintenance === undefined ||
    msgMaintenance === '' ||
    msgMaintenance === appsettings.textMaintenance
  );

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.AdminSettingsPage.edition')}</Typography>
            </Grid>
            <Grid item md={12} className={classes.container}>
              <Tabs orientation="vertical" value={selected} onChange={onChangeTab} className={classes.tabs}>
                {tabs.map(({ title, key }, index) => (
                  <Tab className={classes.tab} label={title} id={index} key={key} />
                ))}
              </Tabs>
              {tabs.map(({ key, Element }, i) => {
                if (selected !== i) return null;
                return <Element key={key} tabkey={key} data={appsettings[key]} />;
              })}
            </Grid>
          </Grid>
        </Paper>
        <Paper className={classes.root}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.AdminSettingsPage.maintenance')}</Typography>
            </Grid>
            <Grid item md={12} className={classes.container}>
              <FormControlLabel
                control={
                  <Checkbox checked={appsettings.maintenance || false} onChange={onCheckMaintenance} name="external" />
                }
                label={i18n.__(`pages.AdminSettingsPage.toggleMaintenance`)}
              />
            </Grid>
            <Grid item md={12} className={classes.container}>
              <FormControlLabel
                className={classes.containerForm}
                control={
                  <div style={{ marginTop: '-20px' }}>
                    <TextField
                      onChange={onUpdateField}
                      value={msgMaintenance}
                      name="link"
                      label={i18n.__(`pages.AdminSettingsPage.textMaintenance`)}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                    />
                    <Button
                      size="medium"
                      disabled={buttonIsActive}
                      variant="contained"
                      color="primary"
                      onClick={onButtonMaintenanceClick}
                    >
                      {i18n.__(`pages.AdminSettingsPage.buttonTextMaintenance`)}
                    </Button>
                  </div>
                }
              />
            </Grid>
          </Grid>
        </Paper>
        <Dialog
          open={open}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-migration-title"
          aria-describedby="alert-dialog-migration-description"
        >
          <DialogContent>
            <DialogTitle id="alert-dialog-migration-title">
              {i18n.__('pages.AdminSettingsPage.unlockMigration.title')}
            </DialogTitle>
            <DialogContentText id="alert-dialog-migration-description">
              {i18n.__('pages.AdminSettingsPage.unlockMigration.mainText')}
              <br />
              {i18n.__('pages.AdminSettingsPage.unlockMigration.checkLogs')}
              <br />
              <br />
              {i18n.__('pages.AdminSettingsPage.unlockMigration.ask')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => switchMaintenance(true)} color="primary" autoFocus>
              {i18n.__('pages.AdminSettingsPage.unlockMigration.confirm')}
            </Button>
            <Button onClick={() => switchMaintenance()} color="primary">
              {i18n.__('pages.AdminSettingsPage.unlockMigration.cancel')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Fade>
  );
};

export default withTracker(() => {
  const subSettings = Meteor.subscribe('appsettings.all');
  const appsettings = AppSettings.findOne();
  const ready = subSettings.ready();
  return {
    appsettings,
    ready,
  };
})(AdminSettingsPage);

AdminSettingsPage.defaultProps = {
  appsettings: {},
};

AdminSettingsPage.propTypes = {
  appsettings: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
