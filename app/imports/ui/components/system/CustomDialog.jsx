import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

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
