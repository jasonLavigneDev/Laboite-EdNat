import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Flow, { FlowChunk } from '@flowjs/flow.js';

import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/context';
import FTDropzone from '../components/francetransfert/Dropzone';
import FTFoldForm from '../components/francetransfert/FoldForm';

FlowChunk.prototype.getParams = function getParams() {
  return {
    numMorceauFichier: this.offset + 1, // flowChunkNumber
    tailleMorceau: this.chunkSize, // flowChunkSize
    tailleMorceauFichier: this.endByte - this.startByte, // flowCurrentChunkSize
    tailleFichier: this.fileObj.size, // flowTotalSize
    idFichier: this.fileObj.uniqueIdentifier, // flowIdentifier
    nomFichier: this.fileObj.name, // flowFilename
    cheminFichier: this.fileObj.relativePath, // flowRelativePath
    totalMorceauxFichier: this.fileObj.chunks.length, // flowTotalChunks
  };
};

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

const fileMaxSize = 2000000000; // 2 GB
const chunkSize = 5242880; // 5 MB

export default function UploadPage() {
  const [{ isMobile, user }] = useAppContext();
  const { classes } = useStyles(isMobile);
  const { state } = useLocation();

  /** @type {useState<Flow.FlowFile[]>} */
  const [files, setFiles] = useState([]);
  const dropzone = useRef();
  const upload = useRef();
  /**
   * @type {import('react').MutableRefObject<Flow>
   */
  const resumable = useRef();

  useEffect(() => {
    resumable.current = new Flow({
      target: '/api/francetransfert/upload',

      chunkSize,
      maxFileSize: fileMaxSize,
      fileParameterName: 'fichier',
      method: 'multipart',
      uploadMethod: 'POST',
      testChunks: false,
    });

    resumable.current.assignDrop(dropzone.current);
    resumable.current.assignBrowse(upload.current);

    resumable.current.removeFile();
    resumable.current.on('fileAdded', (file) => {
      setFiles(([...prev]) => {
        if (prev.some((p) => p.uniqueIdentifier === file.uniqueIdentifier)) {
          toast.info(i18n.__('pages.UploadPage.fileAlreadyExists', { name: file.fileName }));
        } else {
          prev.push(file);
        }

        return prev;
      });
    });

    resumable.current.on('fileError', (file) => {
      toast.error(`Erreur lors du chargement de ${file.name}`);
      console.error(file.error);
    });
    resumable.current.on('complete', () => {
      console.log('complete');
    });

    return () => {
      resumable.current.off();
    };
  }, []);

  useEffect(() => {
    if (state) {
      if (Array.isArray(state)) {
        state.forEach((file) => {
          if (file instanceof File) {
            resumable.current.addFile(file);
          }
        });
      }
    }
  }, [state]);

  /**
   * @param {Resumable.ResumableFile} file
   * @returns
   */
  const handleRemoveFile = useCallback((file, index) => {
    setFiles((prev) => {
      const newFiles = prev.slice();
      newFiles.splice(index, 1);
      return newFiles;
    });
    resumable.current.removeFile(file);
  }, []);

  const sender = user.primaryEmail || user.emails[0].address;
  const uploadFiles = useCallback(
    (foldID) => {
      resumable.current.opts.query = {
        idPli: foldID,
        courrielExpediteur: sender,
      };

      resumable.current.upload();
    },
    [sender],
  );

  const handleSubmit = useCallback(
    (formData) => {
      const data = {
        data: formData,
        files: files.map((f) => ({
          id: f.uniqueIdentifier,
          name: f.name,
          size: f.size,
        })),
      };

      Meteor.call('francetransfert.initFold', data, (err, res) => {
        if (err) {
          toast.error(err.message);
        } else {
          console.log('Successfuly created fold : ', res);
          if (res.statutPli.codeStatutPli === '000-INI') uploadFiles(res.idPli);
        }
      });
    },
    [files, user?.emails[0].address, user?.primaryEmail],
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
              <FTDropzone
                files={files}
                className={classes.sectionPaper}
                onRemoveFile={handleRemoveFile}
                dropzoneRef={dropzone}
                inputRef={upload}
              />
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
