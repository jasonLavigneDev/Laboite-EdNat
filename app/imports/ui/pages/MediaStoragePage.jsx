import React, { useEffect, useState, useCallback } from 'react';
import { Random } from 'meteor/random';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import i18n from 'meteor/universe:i18n';
import { useDropzone } from 'react-dropzone';
import { useAppContext } from '../contexts/context';
import { storageToSize, toBase64 } from '../utils/filesProcess';
import SingleStorageFile from '../components/mediaStorage/SingleStoragefile';
import SelectedMediaModal from '../components/mediaStorage/SelectedMediaModal';
import Spinner from '../components/system/Spinner';
import AvatarEdit from '../components/users/AvatarEdit';

const { maxMinioDiskPerUser } = Meteor.settings.public;

const useStyles = makeStyles()((theme) => ({
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileWrapper: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 200,
  },
  dragWrapper: {
    borderWidth: 2,
    borderRadius: theme.shape.borderRadius,
    borderColor: theme.palette.primary.main,
    borderStyle: 'dashed',
    minHeight: '80vh',
  },
  wrapper: {
    minHeight: '80vh',
    outline: 'none',
  },
}));

const calcultedUsedDisk = (total, currentValue) => total + currentValue.size;

const MediaStoragePage = ({ selectFile, modal }) => {
  const [{ isMobile }, dispatch] = useAppContext();
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState();
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);
  const [objectUsed, setObjectUsed] = useState(null);
  const [openImageEdit, setOpenImageEdit] = useState(false);
  const [imageInBase64, setImageInBase64] = useState('');
  const [fileMetaData, setFileMetaData] = useState({});

  const updateFilesList = () => {
    // get current user files from minio
    setLoading(true);
    Meteor.call('files.user', {}, (error, results) => {
      if (error) {
        msg.error(error.reason);
      } else {
        setFiles(results);
      }
      setSelected(null);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (modal && selected) {
      selectFile(selected);
    }
  }, [selected]);

  const sendFiles = (selectedFiles) => {
    [...selectedFiles].forEach(async (file) => {
      const media = file?.image ? fileMetaData : await toBase64(file);
      const date = new Date().toISOString().replace('T', '-').replaceAll(':', '-').split('.')[0];
      const fileName = file?.image
        ? media.name.substring(0, media.name.lastIndexOf('.')) || media.name
        : file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      dispatch({
        type: 'uploads.add',
        data: {
          name: file?.image ? media.name : file.name,
          fileName: `${fileName}-${date}`,
          file: file?.image ? file.image : media,
          type: file?.image
            ? media.name.split('.')[media.name.split('.').length - 1]
            : file.name.split('.')[file.name.split('.').length - 1],
          path: `users/${Meteor.userId()}`,
          storage: true,
          onFinish: updateFilesList,
        },
      });
    });
  };
  const onDrop = useCallback(sendFiles, []);
  const { getRootProps, isDragActive } = useDropzone({ onDrop });

  const onAddClick = () => {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = (e) => {
      const file = e.target.files;
      setFileMetaData(file[0]);

      if (file[0].type.includes('video')) {
        sendFiles(file);
      } else {
        const readerImg = new FileReader();

        readerImg.onload = function onImgLoad() {
          setImageInBase64(readerImg.result);

          setOpenImageEdit(true);
        };
        readerImg.readAsDataURL(file[0]);
      }
    };
    input.click();
  };

  const onClose = () => {
    setSelected(null);
    setObjectUsed(null);
  };

  const deleteFile = () => {
    setObjectUsed(null);
    Meteor.call(
      'files.selectedRemove',
      {
        path: `users/${Meteor.userId()}`,
        toRemove: [selected.name],
      },
      (err) => {
        if (err) {
          msg.error(err.reason);
        }
        setTimeout(updateFilesList, 1000);
      },
    );
  };
  const onDelete = () => {
    setLoading(true);
    if (objectUsed) {
      // if article with the used object has already been found, so it is a confirmation, delete the file
      deleteFile();
    } else {
      // check if the file is used in a publication
      Meteor.call(
        'articles.checkSelectedInPublications',
        {
          path: selected.name,
        },
        (err, result) => {
          if (err) {
            msg.error(err.reason);
            setLoading(false);
          } else if (result) {
            // Object used, ask for confirmation
            setObjectUsed(result);
            setLoading(false);
          } else {
            // not used, delete the file
            deleteFile();
          }
        },
      );
    }
  };

  useEffect(() => {
    updateFilesList();
  }, []);

  const usedDisk = files.reduceRight(calcultedUsedDisk, 0);

  return (
    <>
      {loading && <Spinner full />}
      <Fade in>
        <Container {...getRootProps()} className={isDragActive ? classes.dragWrapper : classes.wrapper}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                {i18n.__('pages.MediaStoragePage.title')}
                <div>
                  <IconButton onClick={updateFilesList} size="large">
                    <RefreshIcon fontSize="large" />
                  </IconButton>
                  <IconButton onClick={onAddClick} size="large">
                    <AddIcon fontSize="large" />
                  </IconButton>
                </div>
              </Typography>
              <Typography className={classes.flex}>
                {i18n.__('pages.MediaStoragePage.usage')} {storageToSize(usedDisk)}/{storageToSize(maxMinioDiskPerUser)}
              </Typography>
              <Alert severity="warning">{i18n.__('pages.MediaStoragePage.publicWarning')}</Alert>
            </Grid>
            {files.map((file) => (
              <Grid item xs={6} sm={3} md={2} key={Random.id()} className={classes.fileWrapper}>
                <SingleStorageFile file={file} onSelect={setSelected} sendFiles={sendFiles} />
              </Grid>
            ))}
          </Grid>

          {openImageEdit && (
            <AvatarEdit
              open={openImageEdit}
              avatar={imageInBase64}
              onClose={() => setOpenImageEdit(false)}
              onSendImage={sendFiles}
              cardTitle={i18n.__('components.MediaStorageEdit.title')}
              cardSubTitle={i18n.__('components.MediaStorageEdit.subtitle')}
              sendButtonText={i18n.__('components.MediaStorageEdit.sendImage')}
              isMediaStorageCropping
            />
          )}

          {!!selected && !modal && (
            <SelectedMediaModal
              objectUsed={objectUsed}
              file={selected}
              onClose={onClose}
              onDelete={onDelete}
              loading={loading}
            />
          )}
        </Container>
      </Fade>
    </>
  );
};

export default MediaStoragePage;

MediaStoragePage.propTypes = {
  selectFile: PropTypes.func,
  modal: PropTypes.bool,
};

MediaStoragePage.defaultProps = {
  selectFile: null,
  modal: false,
};
