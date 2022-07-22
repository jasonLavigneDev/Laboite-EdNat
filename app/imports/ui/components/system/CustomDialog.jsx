import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const CustomDialog = ({ nativeProps, isOpen, title, content, onCancel, onValidate, cancelText, validateText }) => {
  return (
    <Dialog {...nativeProps} open={isOpen}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onCancel}>
          <Typography>{cancelText}</Typography>
        </Button>
        <Button onClick={onValidate} variant="contained" color="primary">
          <Typography>{validateText}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
CustomDialog.defaultProps = {
  cancelText: i18n.__('components.CustomDialog.cancel'),
  validateText: i18n.__('components.CustomDialog.validate'),
  nativeProps: {},
};
CustomDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
  validateText: PropTypes.string,
  /** Any native props of <Dialog/> mui element */
  nativeProps: PropTypes.objectOf(PropTypes.any),
};
export default CustomDialog;
