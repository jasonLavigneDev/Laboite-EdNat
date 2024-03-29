/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';
import DescriptionIcon from '@mui/icons-material/Description';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VideocamIcon from '@mui/icons-material/Videocam';
import PropTypes from 'prop-types';

const { minioEndPoint, minioPort, minioBucket } = Meteor.settings.public;

const HOST = `https://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;

export const PICTURES_TYPES = Meteor.settings.public.imageFilesTypes;
export const SOUND_TYPES = Meteor.settings.public.audioFilesTypes;
export const VIDEO_TYPES = Meteor.settings.public.videoFilesTypes;

const useStyles = makeStyles()((theme) => ({
  singleFile: {
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    wordBreak: 'break-all',
    position: 'relative',
    overflow: 'hidden',
  },
  image: { position: 'absolute', height: '100%' },
}));

const SingleStorageFile = ({ file, onSelect }) => {
  const { classes } = useStyles();
  const extension = file.name.split('.').pop();
  const isPicture = !!PICTURES_TYPES.find((ext) => ext === extension);
  const isVideo = !!VIDEO_TYPES.find((ext) => ext === extension);
  const isSound = !!SOUND_TYPES.find((ext) => ext === extension);
  const fileName = file.name.replace(`users/${Meteor.userId()}/`, '');

  const selectCurrent = () => onSelect(file);

  return (
    <div className={classes.singleFile} onClick={selectCurrent}>
      {!isPicture ? (
        <>
          {!isVideo && !isSound && <DescriptionIcon style={{ fontSize: '8rem' }} color="primary" />}
          {isVideo && <VideocamIcon style={{ fontSize: '8rem' }} color="primary" />}
          {isSound && <MusicNoteIcon style={{ fontSize: '8rem' }} color="primary" />}

          <Typography>{fileName}</Typography>
        </>
      ) : (
        <img alt={file.name} className={classes.image} src={`${HOST}${file.name}`} />
      )}
    </div>
  );
};

export default SingleStorageFile;

SingleStorageFile.propTypes = {
  onSelect: PropTypes.func.isRequired,
  file: PropTypes.objectOf(PropTypes.any).isRequired,
};
