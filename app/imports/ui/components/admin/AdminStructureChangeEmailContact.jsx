import React, { useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useStyles } from './IntroductionEdition';

const AdminStructureChangeEmailContact = ({ structure }) => {
  const { classes } = useStyles();
  const [email, setEmail] = useState(structure.contactEmail || '');

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
  };

  return (
    <form className={classes.root} onSubmit={onEmailSubmit}>
      <div>
        <InputLabel htmlFor="contactEmail">{i18n.__('components.AdminStructureChangeEmailContact.label')}</InputLabel>
        <TextField id="contactEmail" value={email} onChange={onEmailChange} name="contactEmail" />
      </div>
      <div>
        <div className={classes.buttonGroup}>
          <Button variant="contained" color="primary" type="submit">
            {i18n.__('components.IntroductionEdition.update')}
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
