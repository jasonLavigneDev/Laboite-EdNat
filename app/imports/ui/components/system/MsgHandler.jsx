import React, { useState, useEffect } from 'react';
import i18n from 'meteor/universe:i18n';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

const defaultOptions = {
  duration: 4000, // time before autohide
  hideOnClick: false, // if true, alert doesn't autohide
};

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const MsgHandler = () => {
  const [options, setOptions] = useState(defaultOptions);
  const [openError, setOpenError] = useState(false);
  useEffect(() => {
    setOpenError(!!options.message);
  }, [options]);

  const checkErrMsg = (msg) => {
    // handles translation of some specific server side error messages
    let finalMsg = msg;
    if (msg.startsWith('api.rateLimitError')) {
      const [i18nTag, timeToReset] = msg.split(':');
      finalMsg = i18n.__(i18nTag, { timeToReset });
    }
    return finalMsg;
  };

  global.msg = {
    success: (newMessage, newOptions = defaultOptions) => {
      setOptions({
        ...newOptions,
        message: newMessage,
        severity: 'success',
      });
    },
    error: (newMessage, newOptions = defaultOptions) => {
      setOptions({
        ...newOptions,
        message: checkErrMsg(newMessage),
        severity: 'error',
      });
    },
    warning: (newMessage, newOptions = defaultOptions) => {
      setOptions({
        ...newOptions,
        message: newMessage,
        severity: 'warning',
      });
    },
    info: (newMessage, newOptions = defaultOptions) => {
      setOptions({
        ...newOptions,
        message: newMessage,
        severity: 'info',
      });
    },
  };

  const handleMsgClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOptions(defaultOptions);
  };
  if (!openError) {
    return null;
  }
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={openError}
      autoHideDuration={options.hideOnClick ? null : options.duration}
      onClose={handleMsgClose}
    >
      <Alert onClose={handleMsgClose} severity={options.severity}>
        {options.message}
      </Alert>
    </Snackbar>
  );
};

export default MsgHandler;
