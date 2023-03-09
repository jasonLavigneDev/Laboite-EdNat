import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';

import AddCircleIcon from '@mui/icons-material/AddCircle';

import { alpha } from '@mui/material/styles';
import clsx from 'clsx';
import { useAppContext } from '../../contexts/context';
import usePrettyBytes from '../../hooks/usePrettyBytes';
import { forkRef } from '../../utils/hooks';
import FileSummary from './FileSummary';

const useStyles = makeStyles()((theme) => ({
  dropzone: {
    width: '100%',
    flex: 1,
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
 * @template T
 * @typedef {import('react').MutableRefObject<T>} useRef
 */

/**
 * @typedef {Object} FTDropzoneProps
 * @property {Flow.FlowFile[]} files
 * @property {(file: Flow.FlowFile, index: number) => void} onRemoveFile
 * @property {() => void} forceUpdate
 * @property {any} updateState
 */

/**
 * @param {import('@mui/material/Box').BoxProps & FTDropzoneProps} props
 * @returns
 */
export default function FTDropzone(props) {
  const {
    files,
    onRemoveFile,
    className,
    dropzoneRef,
    inputRef,
    forceUpdate,
    updateState,
    updateState: _,
    ...rest
  } = props;
  /**
   * @type {useRef<HTMLInputElement>}
   */
  const ref = useRef();

  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);

  const totalSize = useMemo(() => files.reduce((acc, curr) => acc + curr.size, 0), [files]);
  const [isDragActive, setDragActive] = useState(false);

  const formattedTotalSize = usePrettyBytes(totalSize);
  const formattedMaxTotalSize = usePrettyBytes(maxTotalSize);

  const open = useCallback(() => {
    ref.current.click();
  }, []);

  return (
    <Box
      {...rest}
      ref={dropzoneRef}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      className={clsx(className, classes.dropzone, isDragActive && classes.dropzoneActive)}
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
            {files.map((resumable, index) => (
              <FileSummary
                updateState={updateState}
                forceUpdate={forceUpdate}
                key={resumable.uniqueIdentifier}
                file={resumable}
                onRemove={() => onRemoveFile(resumable, index)}
              />
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
        <IconButton color="primary" size={files.length <= 0 ? 'medium' : 'large'} onClick={open}>
          <input ref={forkRef(ref, inputRef)} multiple hidden />
          <AddCircleIcon fontSize="inherit" />
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

FTDropzone.displayName = 'FTDropzone';
FTDropzone.propTypes = {
  files: PropTypes.array.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  dropzoneRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]).isRequired,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]).isRequired,
  forceUpdate: PropTypes.func.isRequired,
  updateState: PropTypes.any.isRequired,
  ...Box.prototype,
};
