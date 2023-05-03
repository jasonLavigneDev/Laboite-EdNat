import React, { useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// eslint-disable-next-line no-restricted-imports
import { Checkbox, FormControlLabel, Grid } from '@mui/material';
import { useStyles } from './InfoEditionComponent';

const AdminStructureChangeEmailContact = ({ structure }) => {
  const { classes } = useStyles();
  const [email, setEmail] = useState(structure.contactEmail || '');
  const [externalUrl, setExternalUrl] = useState(structure.externalUrl || '');
  const [sendMailToParent, setSendMailToParent] = useState(structure.sendMailToParent || false);
  const [sendMailToStructureAdmin, setSendMailToStructureAdmin] = useState(structure.sendMailToStructureAdmin || false);

  // si l'email de contact est saisi --> url, case admin structure, et case parent sont désactivés
  // si ni l'URL, ni email de contact sont saisis --> case admin structure, et case parent sont activés

  const onEmailSubmit = (e) => {
    e.preventDefault();
    Meteor.call(
      'structures.updateContactEmail',
      {
        structureId: structure._id,
        contactEmail: e.target.contactEmail.value,
      },
      (err) => {
        if (err) {
          const messages = err.details.map((detail) => detail.message);
          msg.error(messages.join(' / '));
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
  };

  const onEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value.length > 0) {
      setExternalUrl('');
    }
  };

  const onExternalUrlChange = (e) => {
    setExternalUrl(e.target.value);
  };

  const onSendMailTargetChange = () => {
    setSendMailToParent(!sendMailToParent);
  };

  const onSendMailToStructureAdmin = () => {
    setSendMailToStructureAdmin(!sendMailToStructureAdmin);
  };

  return (
    <form className={classes.root} onSubmit={onEmailSubmit}>
      <div>
        <Grid>
          {structure.ancestorsIds.length > 0 ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendMailToParent}
                  disabled={externalUrl || email || sendMailToStructureAdmin}
                  onChange={onSendMailTargetChange}
                  name="external"
                />
              }
              label={i18n.__(`pages.AdminSettingsPage.sendMailToParentStructure`)}
            />
          ) : null}
          <FormControlLabel
            control={
              <Checkbox
                checked={sendMailToStructureAdmin}
                disabled={externalUrl || email || sendMailToParent}
                onChange={onSendMailToStructureAdmin}
                name="external"
              />
            }
            label={i18n.__(`pages.AdminSettingsPage.sendMailToAdminStructure`)}
          />
        </Grid>
        {sendMailToParent === false && sendMailToStructureAdmin === false ? (
          <div>
            <div>
              <InputLabel htmlFor="contactEmail">
                {i18n.__('components.AdminStructureChangeEmailContact.label')}
              </InputLabel>
              <TextField
                id="contactEmail"
                value={email}
                fullWidth
                disabled={externalUrl}
                onChange={onEmailChange}
                name="contactEmail"
              />
            </div>
            <div>
              <InputLabel htmlFor="externalUrl">{i18n.__('pages.AdminSettingsPage.externalUrl')}</InputLabel>
              <TextField
                id="externalUrl"
                value={externalUrl}
                fullWidth
                disabled={email}
                onChange={onExternalUrlChange}
                name="externalUrl"
              />
            </div>
          </div>
        ) : null}
        <div className={classes.buttonGroup}>
          <Button variant="contained" color="primary" type="submit">
            {i18n.__('components.InfoEditionComponent.update')}
          </Button>
        </div>
      </div>
    </form>
  );
};

AdminStructureChangeEmailContact.propTypes = {
  structure: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default AdminStructureChangeEmailContact;
