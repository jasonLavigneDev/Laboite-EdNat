import React, { useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Resumable from 'resumablejs';

import { toast } from 'react-toastify';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
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

const fileMaxSize = 2000000000; // 2 GB
const chunkSize = 5242880; // 5 MB

const endpoint = 'https://test-francetransfert.aot.agency';
const apiKey = 'RlNjMDNkMzIcTRWGZrg5W8I4LWEwMDIJYzxzMwZmE4ZjUwYjCo';

const FT = axios.create({
  baseURL: endpoint,
  headers: {
    cleAPI: apiKey,
  },
});

function foldTypeToFTTypePli(foldType) {
  if (foldType === 0) return 'COU';
  if (foldType === 1) return 'LIE';

  throw new Error('Unkown foldType');
}

export function initializeFold(sender, { data, files }) {
  const typePli = foldTypeToFTTypePli(data.foldType);

  const body = {
    typePli,
    courrielExpediteur: sender,
    Message: data.message,
    preferences: {
      dateValidite: data?.settings?.expiryDate,
      motDePasse: data?.settings?.password,
      langueCourriel: data?.settings?.language,
      protectionArchive: data?.settings?.encrypt,
    },
    fichiers: files.map((file) => ({
      idFichier: file.id,
      nomFichier: file.name,
      tailleFichier: file.size,
    })),
  };

  if (typePli === 'COU') {
    body.objet = data.subject;
    body.destinataires = data.recipients;
  }
  if (typePli === 'LIE') {
    body.objet = data.title;
  }

  return FT.post(`/api-public/initPli`, body);
}

export default function UploadPage() {
  const [{ isMobile, user }] = useAppContext();
  const { classes } = useStyles(isMobile);
  const { state } = useLocation();

  /** @type {useState<Resumable.ResumableFile[]>} */
  const [files, setFiles] = useState([]);
  const dropzone = useRef();
  const upload = useRef();
  /**
   * @type {import('react').MutableRefObject<import('resumablejs')>
   */
  const resumable = useRef();

  useEffect(() => {
    resumable.current = new Resumable({
      // target: '/api/francetransfert/upload',
      target: endpoint,
      headers: {
        cleAPI: apiKey,
      },

      chunkSize,
      maxFileSize: fileMaxSize,
      chunkNumberParameterName: 'numMorceauFichier',
      currentChunkSizeParameterName: 'tailleMorceauFichier',
      totalSizeParameterName: 'tailleFichier',
      identifierParameterName: 'idFichier',
      fileNameParameterName: 'nomFichier',
      totalChunksParameterName: 'totalMorceauxFichier',
      fileParameterName: 'fichier',
      chunkSizeParameterName: 'tailleMorceau',
      relativePathParameterName: 'cheminFichier',
      typeParameterName: 'typeFichier',
      method: 'multipart',
      uploadMethod: 'POST',
      testChunks: false,

      maxChunkRetries: 0,
      permanentErrors: [400, 401, 403, 404, 409, 415, 500, 501],
      chunkRetryInterval: 10000000,
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

      resumable.current.on('fileSuccess', console.log);
      resumable.current.on('fileError', console.log);
      resumable.current.on('uploadStart', console.log);

      resumable.current.upload();
      // success!
    },
    [sender],
  );

  const handleSubmit = useCallback(
    (formData) => {
      const data = {
        data: formData,
        files: files.map((f) => ({
          id: f.uniqueIdentifier,
          name: f.fileName,
          size: f.size,
        })),
      };

      // Meteor.call('francetransfert.initFold', data, (err, res) => {
      //   if (err) {
      //     toast.error(err.message);
      //   } else {
      //     console.log('Successfuly created fold : ', res);
      //     if(res.statutPli.codeStatutPli) uploadFiles(res.idPli);
      //   }
      // });

      initializeFold(sender, data).then(({ data: res }) => {
        console.log('Successfuly created fold : ', res);
        if (res.statutPli.codeStatutPli) uploadFiles(res.idPli);
      });
    },
    [files, user?.emails[0].address, user?.primaryEmail],
  );

  console.log(files);

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
