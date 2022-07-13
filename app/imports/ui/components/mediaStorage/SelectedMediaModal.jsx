/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import i18n from 'meteor/universe:i18n';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Tooltip from '@mui/material/Tooltip';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import AssignmentIcon from '@mui/icons-material/Assignment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useAppContext } from '../../contexts/context';
import { storageToSize } from '../../utils/filesProcess';
import ValidationButton from '../system/ValidationButton';
import Spinner from '../system/Spinner';
import { PICTURES_TYPES, VIDEO_TYPES, SOUND_TYPES } from './SingleStoragefile';
import COMMON_STYLES from '../../themes/styles';

const { minioEndPoint, minioPort, minioBucket, minioSSL } = Meteor.settings.public;

const HOST = `http${minioSSL ? 's' : ''}://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;

const useStyles = (isMobile) =>
  makeStyles(() => ({
    root: COMMON_STYLES.root,
    media: COMMON_STYLES.media,
    video: COMMON_STYLES.video,
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    paper: COMMON_STYLES.paper(isMobile, '50%'),
    iconWrapper: COMMON_STYLES.iconWrapper,
    alert: COMMON_STYLES.alert,
  }));

export default function SelectedMediaModal({ file, onClose, onDelete, loading, objectUsed }) {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const fileName = file.name.replace(`users/${Meteor.userId()}/`, '');
  const extension = file.name.split('.').pop();

  const isPicture = !!PICTURES_TYPES.find((ext) => ext === extension);
  const isVideo = !!VIDEO_TYPES.find((ext) => ext === extension);
  const isSound = !!SOUND_TYPES.find((ext) => ext === extension);

  if (!file) {
    return null;
  }

  const handleCopyURL = () => {
    navigator.clipboard
      .writeText(`${HOST}${file.name}`)
      .then(msg.success(i18n.__('components.SelectedMediaModal.successCopyURL')));
  };

  return (
    <Modal open onClose={onClose}>
      <div className={classes.paper}>
        {loading && <Spinner full />}
        <Card className={classes.root}>
          <CardHeader
            title={`${fileName} / ${storageToSize(file.size)}`}
            subheader={file.lastModified.toLocaleDateString()}
          />

          {!isVideo && !isSound && !isPicture && (
            <div className={classes.iconWrapper}>
              <DescriptionIcon style={{ fontSize: '8rem' }} color="primary" />
            </div>
          )}

          {isPicture && <CardMedia className={classes.media} image={`${HOST}${file.name}`} title={fileName} />}

          {isVideo && <video controls src={`${HOST}${file.name}`} className={classes.video} />}

          {isSound && (
            <div className={classes.iconWrapper}>
              <audio controls preload="auto">
                <source src={`${HOST}${file.name}`} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {!!objectUsed && (
            <Alert severity="warning" className={classes.alert}>
              <AlertTitle>Publication: {objectUsed.title}</AlertTitle>
              {i18n.__('pages.MediaStoragePage.objectUsedText')}
            </Alert>
          )}

          <CardActions className={classes.actions}>
            <ValidationButton
              color="red"
              disabled={loading}
              icon={<DeleteIcon />}
              text={
                objectUsed ? i18n.__('pages.MediaStoragePage.confirmDelete') : i18n.__('pages.MediaStoragePage.delete')
              }
              onAction={onDelete}
            />
            <div name="accessButtons">
              <Tooltip
                title={i18n.__('components.SelectedMediaModal.OpenInWindow')}
                aria-label={i18n.__('components.SelectedMediaModal.OpenInWindow')}
              >
                <IconButton
                  onClick={() => window.open(`${HOST}${file.name}`, '_blank', 'noreferrer,noopener')}
                  size="large"
                >
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={i18n.__('components.SelectedMediaModal.copyUrl')}
                aria-label={i18n.__('components.SelectedMediaModal.copyUrl')}
              >
                <IconButton onClick={handleCopyURL} size="large">
                  <AssignmentIcon />
                </IconButton>
              </Tooltip>
            </div>
            <IconButton onClick={onClose} size="large">
              <ClearIcon />
            </IconButton>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
}

SelectedMediaModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  file: PropTypes.objectOf(PropTypes.any).isRequired,
  objectUsed: PropTypes.objectOf(PropTypes.any),
};

SelectedMediaModal.defaultProps = {
  objectUsed: null,
};
