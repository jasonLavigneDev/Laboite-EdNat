import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function LogoutDialog({ open, onAccept, onClose }) {
  const [dontAsk, setDontAsk] = useState(false);
  const simpleLogout = () => {
    if (dontAsk) Meteor.call('users.setLogoutType', { logoutType: 'local' });
    onClose();
    Meteor.logout();
  };
  const keycloakLogout = () => {
    if (dontAsk) Meteor.call('users.setLogoutType', { logoutType: 'global' });
    onAccept();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">{i18n.__('components.LogoutDialog.dialogTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {i18n.__('components.LogoutDialog.dialogContent')}
        </DialogContentText>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={dontAsk} onChange={() => setDontAsk(!dontAsk)} name="dontAsk" />}
            label={i18n.__('components.LogoutDialog.dontAskAgain')}
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={keycloakLogout} color="primary">
          {i18n.__('components.LogoutDialog.buttonYes')}
        </Button>
        <Button onClick={simpleLogout} color="primary">
          {i18n.__('components.LogoutDialog.buttonNo')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LogoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
};

export default LogoutDialog;
