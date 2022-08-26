import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from '../../contexts/context';

export default function Animation() {
  const [{ isMobile }] = useAppContext();

  const useStyles = makeStyles({
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
  const classes = useStyles();

  return (
    <Grid className={classes.grid}>
      <iframe
        className={classes.iframe}
        title="screencast_frame"
        sandbox="allow-same-origin allow-scripts allow-popups"
        // eslint-disable-next-line max-len
        src="https://podeduc.apps.education.fr/media/videos/0ae723528c10898605f3c4fbc97f2a84b0647030813b2c8330db76cdced9c5ab/2959/360p.mp4"
        allowFullScreen
      />
    </Grid>
  );
}
