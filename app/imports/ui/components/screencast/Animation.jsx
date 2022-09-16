import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import { makeStyles } from 'tss-react/mui';
import { useAppContext } from '../../contexts/context';

const Animation = ({ videoLink }) => {
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

  return (
    <Grid className={classes.grid}>
      <iframe
        className={classes.iframe}
        title="screencast_frame"
        sandbox="allow-same-origin allow-scripts allow-popups"
        // eslint-disable-next-line max-len
        src={videoLink}
        allowFullScreen
      />
    </Grid>
  );
};
Animation.propTypes = {
  videoLink: PropTypes.string,
};

Animation.defaultProps = {
  videoLink: '',
};
export default Animation;
