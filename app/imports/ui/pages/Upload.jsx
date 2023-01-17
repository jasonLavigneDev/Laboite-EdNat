import React, { useCallback, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import { useAppContext } from '../contexts/context';
import FTDropzone from '../components/francetransfert/Dropzone';
import FTFoldForm from '../components/francetransfert/FoldForm';

const useStyles = makeStyles()((theme) => ({
  description: {
    display: 'inline-block',
    padding: theme.spacing(2),
    whiteSpace: 'nowrap',
  },
  sectionPaper: {
    padding: '1rem',

    // No mobile first because laboite is an app used more on desktop than mobile
    width: '35rem',
    height: '40rem',
    [theme.breakpoints.down('xl')]: {
      width: '30rem',
    },
    [theme.breakpoints.down('lg')]: {
      width: '25rem',
    },
    [theme.breakpoints.down('md')]: {
      width: '20rem',
    },
    [theme.breakpoints.down('sm')]: {
      width: '15rem',
    },
    [theme.breakpoints.down('xs')]: {
      width: '10rem',
    },
  },
}));

/**
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

export default function UploadPage() {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);

  /** @type {useState<File[]>} */
  const [files, setFiles] = useState([]);

  const handleSubmit = useCallback(
    (data) => {
      console.log({
        data,
        files,
      });
    },
    [files],
  );

  return (
    <Fade in>
      <Container>
        <Paper>
          <Typography className={classes.description}>
            {i18n.__('pages.UploadPage.description', { appName: Meteor.settings.public.appName })}
          </Typography>
        </Paper>
        <Box display="flex" justifyContent="space-around" mt={6}>
          <Grid item xs={6}>
            <Paper>
              <FTDropzone files={files} setFiles={setFiles} className={classes.sectionPaper} />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper>
              <FTFoldForm isUploadable={files.length > 0} className={classes.sectionPaper} onSubmit={handleSubmit} />
            </Paper>
          </Grid>
        </Box>
      </Container>
    </Fade>
  );
}

UploadPage.propTypes = {};

UploadPage.defaultProps = {};
