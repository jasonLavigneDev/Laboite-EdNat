import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import MovieIcon from '@mui/icons-material/Movie';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';

import { toast } from 'react-toastify';
import { alpha } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { useAppContext } from '../../contexts/context';
import usePrettyBytes from '../../hooks/usePrettyBytes';

const useStyles = makeStyles()((theme) => ({
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
  },
  dropzoneActive: {
    backgroundColor: alpha(theme.palette.info.light, 0.25),
  },
  filesList: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: '0',
    flex: 1,
  },
  fileSummaryPrimary: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
}));

const maxTotalSize = 20000000000; // 20 GB

/**
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

/**
 * @typedef {Object} FTDropzoneProps
 * @property {import('react').Dispatch<import('react').SetStateAction<File[]>>} setFiles
 * @property {File[]} files
 */

/**
 * @param {import('@mui/material/Box').BoxProps & FTDropzoneProps} props
 * @returns
 */
export default function FTDropzone(props) {
  const { files, setFiles, className, ...rest } = props;

  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);

  const totalSize = useMemo(() => files.reduce((acc, curr) => acc + curr.size, 0), [files]);

  const remainingSize = maxTotalSize - totalSize;
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    multiple: true,
    maxSize: remainingSize,
    onDropAccepted(newFiles) {
      setFiles(([...prev]) => {
        // check for duplicates
        newFiles.forEach((file) => {
          // if the file is a duplicate, dont add it again and notify the user
          if (prev.some((p) => p.path === file.path)) {
            toast.info(i18n.__('pages.UploadPage.fileAlreadyExists', { name: file.name }));
          } else {
            prev.push(file);
          }
        });

        return prev;
      });
    },
  });

  /**
   * @param {File} file
   */
  const handleRemoveFile = useCallback((file) => {
    setFiles((prev) => prev.filter((p) => p.path !== file.path));
  }, []);

  const formattedTotalSize = usePrettyBytes(totalSize);
  const formattedMaxTotalSize = usePrettyBytes(maxTotalSize);

  return (
    <Box
      {...getRootProps({
        ...rest,
        className: clsx(className, classes.dropzone, isDragActive && classes.dropzoneActive),
      })}
    >
      {files.length > 0 && (
        <>
          <h4>
            {i18n.__('pages.UploadPage.fileCount', { count: files.length })}
            {' - '}
            {i18n.__('pages.UploadPage.totalSize', {
              totalSize: formattedTotalSize,
              maxSize: formattedMaxTotalSize,
            })}
          </h4>
          <List dense className={classes.filesList}>
            {files.map((file) => (
              <FileSummary key={file.name} file={file} onRemove={() => handleRemoveFile(file)} />
            ))}
          </List>
        </>
      )}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection={files.length <= 0 ? 'column' : 'row'}
        flex={files.length <= 0 ? '1' : '0'}
      >
        <IconButton color="primary" size={files.length <= 0 ? 'medium' : 'large'}>
          <input {...getInputProps()} />
          <AddCircleIcon fontSize="inherit" onClick={open} />
        </IconButton>
        <Box mt={files.length <= 0 ? 4 : 0} textAlign="center">
          <Typography variant="subtitle1" fontWeight="700">
            {i18n.__('pages.UploadPage.addFilesLabel')}
          </Typography>
          {files.length <= 0 && <Typography variant="body2">{i18n.__('pages.UploadPage.addFilesLabel')}</Typography>}
        </Box>
      </Box>
    </Box>
  );
}

FTDropzone.propTypes = {
  ...Box.prototype,
};

/**
 *
 * @param {object} props
 * @param {File} props.file
 * @param {() => void} props.onRemove
 * @returns
 */
function FileSummary({ file, onRemove }) {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);

  const formattedSize = usePrettyBytes(file.size);

  const [type, extension] = file.type.split('/');

  let Icon = ArticleIcon;

  switch (type) {
    case 'image':
      Icon = ImageIcon;
      break;
    case 'audio':
      Icon = AudioFileIcon;
      break;

    case 'video':
      Icon = MovieIcon;
      break;

    case 'font':
      Icon = FontDownloadIcon;
      break;

    case 'application':
      if (extension === 'pdf') Icon = PictureAsPdfIcon;
      break;

    default:
      break;
  }

  return (
    <ListItem
      secondaryAction={
        <IconButton onClick={() => onRemove()} edge="end" aria-label="delete">
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <Icon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        classes={{
          primary: classes.fileSummaryPrimary,
        }}
        primary={file.name}
        secondary={formattedSize}
      />
    </ListItem>
  );
}

FileSummary.propTypes = {
  onRemove: PropTypes.func,
  file: PropTypes.instanceOf(File).isRequired,
};

// eslint-disable-next-line prettier/prettier
const noop = () => { };
FileSummary.defaultProps = {
  onRemove: noop,
};
