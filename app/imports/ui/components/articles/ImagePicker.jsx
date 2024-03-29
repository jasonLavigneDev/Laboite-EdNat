import React from 'react';
import { makeStyles } from 'tss-react/mui';
import Modal from '@mui/material/Modal';
import PropTypes from 'prop-types';
import MediaStoragePage from '../../pages/MediaStoragePage';

const useStyles = makeStyles()((theme, isMobile) => ({
  paper: {
    position: 'absolute',
    width: isMobile ? '95%' : '80%',
    maxHeight: '80%',
    top: isMobile ? 0 : '50%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    left: isMobile ? '2.5%' : '50%',
    transform: isMobile ? 'translateY(50%)' : 'translate(-50%, -50%)',
    overflow: 'auto',
  },
}));

const ImagePicker = ({ onClose, selectFile, isMobile }) => {
  const { classes } = useStyles(isMobile);
  return (
    <Modal open onClose={onClose}>
      <div className={classes.paper}>
        <MediaStoragePage modal selectFile={selectFile} />
      </div>
    </Modal>
  );
};

export default ImagePicker;

ImagePicker.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectFile: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};
