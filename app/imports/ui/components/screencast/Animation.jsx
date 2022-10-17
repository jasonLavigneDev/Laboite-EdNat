import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import { makeStyles } from 'tss-react/mui';
import { useAppContext } from '../../contexts/context';

const Animation = ({ videoLink, notReady }) => {
  const [{ isMobile }] = useAppContext();
  const useStyles = makeStyles()({
    grid: {
      display: 'grid',
      justifyContent: 'center',
      padding: '20px',
      marginLeft: isMobile ? '15%' : '0px',
      maxWidth: '70vw',
    },
    iframe: {
      width: isMobile ? '90vw' : '55vw',
      height: isMobile ? '50vmin' : '55vh',
    },
  });
  const { classes } = useStyles();

  if (notReady) return null;

  return (
    <Grid className={classes.grid}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video controls className={classes.iframe}>
        <source
          // eslint-disable-next-line max-len
          src={videoLink}
          type="video/webm"
        />
      </video>
    </Grid>
  );
};
Animation.propTypes = {
  videoLink: PropTypes.string,
  notReady: PropTypes.bool,
};

Animation.defaultProps = {
  videoLink: '',
  notReady: false,
};
export default Animation;
