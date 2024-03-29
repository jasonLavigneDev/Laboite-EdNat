/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useState } from 'react';
import i18n from 'meteor/universe:i18n';
import AvatarEditor from 'react-avatar-editor';
import { makeStyles } from 'tss-react/mui';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import PropTypes from 'prop-types';
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';

const useStyles = makeStyles()((theme, isMobile) => ({
  root: COMMON_STYLES.root,
  media: COMMON_STYLES.media,
  video: COMMON_STYLES.video,
  actions: COMMON_STYLES.actions,
  paper: COMMON_STYLES.paper(isMobile, '50%'),
  iconWrapper: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  alert: COMMON_STYLES.alert,
}));

const AvatarEdit = ({
  open,
  avatar,
  onClose,
  onSendImage,
  cardTitle,
  cardSubtitle,
  sendButtonText,
  isMediaStorageCropping,
}) => {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const editor = useRef(null);

  const onScale = (e, newValue) => {
    setScale(newValue);
  };

  const onRotate = (factor) => {
    setRotate(rotate + factor * 90);
  };

  const onLocalSendImage = () => {
    if (editor) {
      const canvasScaled = editor.current.getImageScaledToCanvas();
      onSendImage([{ image: canvasScaled.toDataURL() }]);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={cardTitle}
            subheader={cardSubtitle}
            action={
              <IconButton onClick={onClose} size="large">
                <ClearIcon />
              </IconButton>
            }
          />
          <div className={classes.iconWrapper}>
            <AvatarEditor
              ref={editor}
              image={avatar}
              width={isMediaStorageCropping ? 300 : 250}
              height={isMediaStorageCropping ? 300 : 250}
              border={isMediaStorageCropping ? 0 : 50}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={scale}
              rotate={rotate}
            />
          </div>
          <Grid className={classes.iconWrapper} container spacing={4}>
            <Grid item xs={4}>
              <Tooltip
                title={i18n.__('components.AvatarEdit.zoom')}
                aria-label={i18n.__('components.AvatarEdit.zoom')}
                placement="top"
              >
                <Grid container spacing={1}>
                  <Grid item>
                    <Typography variant="h6" style={{ textAlign: 'center' }}>
                      x1
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Slider name="scale" value={scale} onChange={onScale} min={1} max={2} step={0.01} />
                  </Grid>
                  <Grid item>
                    <Typography variant="h6" style={{ textAlign: 'center' }}>
                      x2
                    </Typography>
                  </Grid>
                </Grid>
              </Tooltip>
            </Grid>
            <Grid item />

            <Grid item xs={4}>
              <Tooltip
                title={i18n.__('components.AvatarEdit.turnLeft')}
                aria-label={i18n.__('components.AvatarEdit.turnLeft')}
                placement="top"
              >
                <IconButton onClick={() => onRotate(-1)} size="large">
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={i18n.__('components.AvatarEdit.turnRight')}
                aria-label={i18n.__('components.AvatarEdit.turnRight')}
                placement="top"
              >
                <IconButton onClick={() => onRotate(1)} size="large">
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <CardActions className={classes.actions}>
            <Button variant="contained" color="primary" onClick={onLocalSendImage}>
              {sendButtonText}
            </Button>
            <Button onClick={onClose}>{i18n.__('components.AvatarEdit.cancel')}</Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AvatarEdit.propTypes = {
  open: PropTypes.bool.isRequired,
  avatar: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSendImage: PropTypes.func.isRequired,
  cardTitle: PropTypes.string.isRequired,
  cardSubtitle: PropTypes.string.isRequired,
  sendButtonText: PropTypes.string.isRequired,
  isMediaStorageCropping: PropTypes.bool.isRequired,
};

export default AvatarEdit;
