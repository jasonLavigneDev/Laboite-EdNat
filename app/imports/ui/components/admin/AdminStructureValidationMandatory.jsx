import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';

import { useAppContext } from '../../contexts/context';
import { setUserStructureAdminValidationMandatoryStatus } from '../../../api/structures/methods';

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

const AdminStructureValidationMandatory = ({
  structure = null,
  userStructureValidationMandatory = false,
  isUserStructureValidationMandatoryButtonActive = false,
  onCheckStructureAdminValidationMandatory = null,
  onSetUserStructureValidationMandatoryStatus = null,
}) => {
  const { classes } = useStyles();
  const [{ isMobile }] = useAppContext();
  const [userStructureAdminValidationMandatory, setUserStructureAdminValidationMandatory] = useState(
    structure === null
      ? userStructureValidationMandatory
      : structure.userStructureValidationMandatory !== undefined
      ? structure.userStructureValidationMandatory
      : false,
  );

  const onCheckUserStructureAdminValidationMandatory = (e) => {
    setUserStructureAdminValidationMandatory(e.target.checked);
    if (onCheckStructureAdminValidationMandatory !== null) {
      onCheckStructureAdminValidationMandatory(e.target.checked);
    }
  };

  const isUserStructureAdminValidationMandatoryButtonActive =
    structure === null
      ? isUserStructureValidationMandatoryButtonActive
      : userStructureAdminValidationMandatory !== structure.userStructureValidationMandatory;

  const onSetUserStructureAdminValidationMandatoryStatus = () => {
    if (onSetUserStructureValidationMandatoryStatus !== null) {
      onSetUserStructureValidationMandatoryStatus();
    } else {
      setUserStructureAdminValidationMandatoryStatus.call(
        { structureId: structure._id, userStructureValidationMandatory: userStructureAdminValidationMandatory },
        (error) => {
          if (error) {
            msg.error(error.message);
          } else {
            msg.success(i18n.__('api.methods.operationSuccessMsg'));
          }
        },
      );
    }
  };
  return (
    <Grid container spacing={4} style={{ paddingLeft: structure === null ? '' : '60px' }}>
      <Grid item md={12}>
        <Typography variant={isMobile ? 'h6' : 'h4'}>
          {structure === null
            ? i18n.__('pages.AdminSettingsPage.userStructureValidationMandatory')
            : i18n.__('pages.AdminSettingsPage.userStructureAdminValidationMandatory')}
        </Typography>
      </Grid>
      <Grid item md={12} className={classes.container}>
        <FormControlLabel
          control={
            <Checkbox
              checked={userStructureAdminValidationMandatory}
              onChange={onCheckUserStructureAdminValidationMandatory}
              name="external"
              color="primary"
            />
          }
          label={
            structure === null
              ? i18n.__(`pages.AdminSettingsPage.toggleUserStructureValidationMandatory`)
              : i18n.__(`pages.AdminSettingsPage.userStructureAdminValidationMandatory`)
          }
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
              disabled={!isUserStructureAdminValidationMandatoryButtonActive}
              onClick={onSetUserStructureAdminValidationMandatoryStatus}
            >
              {i18n.__(`pages.AdminSettingsPage.buttonUserStructureValidationMandatory`)}
            </Button>
          </div>
        }
      />
    </Grid>
  );
};

AdminStructureValidationMandatory.defaultProps = {
  structure: null,
  userStructureValidationMandatory: false,
  isUserStructureValidationMandatoryButtonActive: false,
  onCheckStructureAdminValidationMandatory: null,
  onSetUserStructureValidationMandatoryStatus: null,
};

AdminStructureValidationMandatory.propTypes = {
  structure: PropTypes.objectOf(PropTypes.any),
  userStructureValidationMandatory: PropTypes.bool,
  isUserStructureValidationMandatoryButtonActive: PropTypes.bool,
  onCheckStructureAdminValidationMandatory: PropTypes.func,
  onSetUserStructureValidationMandatoryStatus: PropTypes.func,
};

export default AdminStructureValidationMandatory;
