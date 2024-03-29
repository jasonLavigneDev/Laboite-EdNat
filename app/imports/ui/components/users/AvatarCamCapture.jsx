/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import ClearIcon from '@mui/icons-material/Clear';
import Webcam from 'react-webcam';
import PropTypes from 'prop-types';
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';

const useStyles = makeStyles()((theme, isMobile) => ({
  root: COMMON_STYLES.root,
  media: COMMON_STYLES.media,
  video: COMMON_STYLES.video,
  actions: COMMON_STYLES.actions,
  paper: COMMON_STYLES.paper(isMobile, '50%'),
  iconWrapper: COMMON_STYLES.iconWrapper,
  alert: COMMON_STYLES.alert,
}));

const AvatarCamCapture = ({ open, onClose, onSendImage }) => {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);
  const webcamRef = React.useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onSendImage({ image: imageSrc });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.AvatarCamCapture.title')}
            subheader={i18n.__('components.AvatarCamCapture.subtitle')}
            action={
              <IconButton onClick={onClose} size="large">
                <ClearIcon />
              </IconButton>
            }
          />
          <div className={classes.iconWrapper}>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          </div>
          <CardActions className={classes.actions}>
            <Button variant="contained" color="primary" onClick={capture}>
              {i18n.__('components.AvatarCamCapture.takePicture')}
            </Button>
            <Button onClick={onClose}>{i18n.__('components.AvatarCamCapture.cancel')}</Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AvatarCamCapture.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSendImage: PropTypes.func.isRequired,
};

export default AvatarCamCapture;
