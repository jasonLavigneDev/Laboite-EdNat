import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import Container from '@mui/material/Container';
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
import FoldData from '../components/francetransfert/FoldData';

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
    display: 'flex',
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
  resultPaper: {
    display: 'flex',
    padding: '1rem',
    width: '80%',
    height: '40rem',
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
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [updateState, update] = useState({});
  const forceUpdate = useCallback(() => update({}), []);

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

    resumable.current.on('fileRemoved', (file) => {
      setFiles(([...prev]) => {
        return prev.filter(({ uniqueIdentifier }) => uniqueIdentifier !== file.uniqueIdentifier);
      });
    });

    resumable.current.on(
      'fileProgress',
      (file) => {
        setFiles((prev) => {
          const newFiles = prev.slice();
          const fileIndex = newFiles.findIndex((f) => f.uniqueIdentifier === file.uniqueIdentifier);

          if (fileIndex !== -1) newFiles[fileIndex] = file;

          return newFiles;
        });
      },
      [],
    );

    resumable.current.on('fileError', (file) => {
      toast.error(i18n.__('pages.UploadPage.errorWhenLoadingFile', { fileName: file.name }));
      console.error(file.error);
    });
    resumable.current.on('uploadStart', () => {
      setUploading(true);
    });

    return () => {
      resumable.current.off();
    };
  }, []);

  const [foldStatus, setFoldStatus] = useState(null);
  const [foldData, setFoldData] = useState(null);
  useEffect(() => {
    async function waitStatus() {
      const foldIdBody = {
        foldId: resumable.current.opts.query.idPli,
      };

      let status;
      while (status !== '032-PAT') {
        // eslint-disable-next-line no-await-in-loop
        status = await new Promise((resolve, reject) => {
          Meteor.call('francetransfert.getFoldStatus', foldIdBody, (err, res) => {
            if (err) {
              reject(err);
            } else {
              setFoldStatus({
                status: res.statutPli.codeStatutPli,
                label: res.statutPli.libelleStatutPli,
              });
              resolve(res.statutPli.codeStatutPli);
            }
          });
        });

        if (['010-ECC', '011-ECH', '021-ETG', '022-EAV', '031-EEC'].includes(status)) {
          toast.error(i18n.__('pages.UploadPage.errorWhenVerifyingFiles'));
          return false;
        }

        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 1000));
      }

      return true;
    }

    function handleComplete() {
      setUploading(false);
      setSubmitting(false);

      const foldIdBody = {
        foldId: resumable.current.opts.query.idPli,
      };

      waitStatus().then((success) => {
        if (success === true) {
          Meteor.call('francetransfert.getFoldData', foldIdBody, (err, res) => {
            if (err) {
              toast.error(i18n.__('pages.UploadPage.errorWhenRetrievingFoldData'));
            } else {
              setFoldData(res);
            }
          });
        }
      });
    }

    resumable.current.on('complete', handleComplete);
    return () => {
      resumable.current.off('complete', handleComplete);
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

  const handleAbort = useCallback(() => {
    resumable.current.cancel();
    files.forEach((file) => resumable.current.addFile(file.file));
    forceUpdate();
  }, [files]);

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

      setSubmitting(true);

      Meteor.call('francetransfert.initFold', data, (err, res) => {
        if (err) {
          toast.error(err.message);
        } else {
          // console.log('Successfuly created fold : ', res);
          // eslint-disable-next-line no-lonely-if
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
        <Box mt={6}>
          <Box display={foldStatus ? 'flex' : 'none'} justifyContent="center">
            <FoldData foldStatus={foldStatus} foldData={foldData} mt={6} mx="auto" className={classes.resultPaper} />
          </Box>
          <Box display={foldStatus ? 'none' : 'flex'} justifyContent="space-around" mt={6}>
            <Paper className={classes.sectionPaper}>
              <FTDropzone
                files={files}
                onRemoveFile={(file) => resumable.current.removeFile(file)}
                dropzoneRef={dropzone}
                inputRef={upload}
                updateState={updateState}
                forceUpdate={forceUpdate}
              />
            </Paper>
            <Paper className={classes.sectionPaper}>
              <FTFoldForm
                isUploadable={files.length > 0}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
                isUploading={uploading}
                uploader={resumable.current}
                updateState={updateState}
                onCancel={handleAbort}
                forceUpdate={forceUpdate}
              />
            </Paper>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
}

UploadPage.propTypes = {};

UploadPage.defaultProps = {};
