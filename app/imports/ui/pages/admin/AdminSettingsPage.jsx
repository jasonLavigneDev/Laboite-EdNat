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
import TabbedForms from '../../components/system/TabbedForms';

import { useAppContext } from '../../contexts/context';
import {
  switchMaintenanceStatus,
  updateTextMaintenance,
  setUserStructureValidationMandatoryStatus,
} from '../../../api/appsettings/methods';
import InfoEditionComponent from '../../components/admin/InfoEditionComponent';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
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
}));

const AdminSettingsPage = ({ appsettings }) => {
  const [msgMaintenance, setMsgMaintenance] = useState(appsettings.textMaintenance);
  const { classes } = useStyles();
  const [userStructureValidationMandatory, setUserStructureValidationMandatory] = useState(
    appsettings.userStructureValidationMandatory,
  );
  const [loading, setLoading] = useState(true);
  const [{ isMobile }] = useAppContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (appsettings.textMaintenance !== msgMaintenance) setMsgMaintenance(appsettings.textMaintenance);
    if (appsettings.userStructureValidationMandatory !== userStructureValidationMandatory)
      setUserStructureValidationMandatory(appsettings.userStructureValidationMandatory);
  }, [appsettings]);

  const switchMaintenance = (unlockMigration = false) => {
    setLoading(true);
    setOpen(false);
    switchMaintenanceStatus.call({ unlockMigration }, (error) => {
      setLoading(false);
      if (error) {
        msg.error(i18n.__('pages.AdminSettingsPage.errorMongo'));
      }
    });
  };

  const onSetUserStructureValidationMandatoryStatus = () => {
    setLoading(true);
    setUserStructureValidationMandatoryStatus.call(
      { isValidationMandatory: userStructureValidationMandatory },
      (error) => {
        setLoading(false);
        if (error) {
          // console.log(error);
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
  };

  const onCheckUserStructureValidationMandatory = (e) => {
    setUserStructureValidationMandatory(e.target.checked);
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

  const isUserStructureValidationMandatoryButtonActive =
    userStructureValidationMandatory !== appsettings.userStructureValidationMandatory;

  const tabs = [
    {
      key: 'introduction',
      title: i18n.__('pages.AdminSettingsPage.introduction'),
      Element: InfoEditionComponent,
      ElementProps: { introduction: appsettings.introduction },
    },
    {
      key: 'legal',
      title: i18n.__('pages.AdminSettingsPage.legal'),
      Element: LegalComponent,
      ElementProps: { legal: appsettings.legal },
    },
    {
      key: 'personalData',
      title: i18n.__('pages.AdminSettingsPage.personalData'),
      Element: LegalComponent,
      ElementProps: { personalData: appsettings.personalData },
    },
    {
      key: 'accessibility',
      title: i18n.__('pages.AdminSettingsPage.accessibility'),
      Element: LegalComponent,
      ElementProps: { accessibility: appsettings.accessibility },
    },
    {
      key: 'gcu',
      title: i18n.__('pages.AdminSettingsPage.gcu'),
      Element: LegalComponent,
      ElementProps: { gcu: appsettings.gcu },
    },
    {
      key: 'personalSpace',
      title: i18n.__('pages.AdminSettingsPage.personalSpace'),
      Element: LegalComponent,
      ElementProps: { personalSpace: appsettings.personalSpace },
      hideExternal: false,
    },
  ];

  return loading && !appsettings ? (
    <Spinner full />
  ) : (
    <Fade in>
      <Container>
        <TabbedForms tabs={tabs} globalTitle={i18n.__('pages.AdminSettingsPage.edition')} />
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
        <Paper className={classes.root}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>
                {i18n.__('pages.AdminSettingsPage.userStructureValidationMandatory')}
              </Typography>
            </Grid>
            <Grid item md={12} className={classes.container}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={userStructureValidationMandatory}
                    onChange={onCheckUserStructureValidationMandatory}
                    name="external"
                    color="primary"
                  />
                }
                label={i18n.__(`pages.AdminSettingsPage.toggleUserStructureValidationMandatory`)}
              />
            </Grid>
            <FormControlLabel
              className={classes.containerForm}
              control={
                <div style={{ marginTop: '-20px', marginLeft: '25px' }}>
                  <Button
                    size="medium"
                    variant="contained"
                    color="primary"
                    disabled={!isUserStructureValidationMandatoryButtonActive}
                    onClick={onSetUserStructureValidationMandatoryStatus}
                  >
                    {i18n.__(`pages.AdminSettingsPage.buttonUserStructureValidationMandatory`)}
                  </Button>
                </div>
              }
            />
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
            <Button onClick={() => switchMaintenance()} color="secondary">
              {i18n.__('pages.AdminSettingsPage.unlockMigration.cancel')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Fade>
  );
};

export default withTracker(() => {
  // const subSettings = Meteor.subscribe('appsettings.all');
  const appsettings = AppSettings.findOne();
  return {
    appsettings,
  };
})(AdminSettingsPage);

AdminSettingsPage.defaultProps = {
  appsettings: {},
};

AdminSettingsPage.propTypes = {
  appsettings: PropTypes.objectOf(PropTypes.any),
};
