import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import MovieIcon from '@mui/icons-material/Movie';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { useAppContext } from '../../contexts/context';
import usePrettyBytes from '../../hooks/usePrettyBytes';

const useStyles = makeStyles()(() => ({
  textOverflowWrapEllipsis: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
}));

/**
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

/**
 * @template T
 * @typedef {import('react').MutableRefObject<T>} useRef
 */

const secondaryHeight = 24;

/**
 * @typedef {Object} FileSummaryProps
 * @property {Flow.FlowFile} file
 * @property {() => void} onRemove
 * @property {() => void} forceUpdate
 * @property {any} updateState
 */
const FileSummary = React.memo(
  /**
   * @param {FileSummaryProps} props
   * @returns
   */
  (props) => {
    // eslint-disable-next-line no-unused-vars
    const { file: flow, onRemove, forceUpdate, updateState: _ } = props;
    const { file } = flow;

    const [{ isMobile }] = useAppContext();
    const { classes } = useStyles(isMobile);

    const formattedSize = usePrettyBytes(file.size);
    const averageSpeed = usePrettyBytes(flow.averageSpeed, {
      unitDisplay: 'short',
    });

    const Icon = useMemo(() => {
      const [type, extension] = file.type.split('/');
      switch (type) {
        case 'image':
          return ImageIcon;
        case 'audio':
          return AudioFileIcon;

        case 'video':
          return MovieIcon;

        case 'font':
          return FontDownloadIcon;

        case 'application':
          if (extension === 'pdf') return PictureAsPdfIcon;
          return ArticleIcon;

        default:
          return ArticleIcon;
      }
    });

    const togglePause = useCallback(
      () => (state) => {
        let paused;
        if (state !== undefined) {
          paused = !state;
        } else paused = flow.paused;

        if (paused) {
          flow.resume();
        } else {
          flow.pause();
        }
        forceUpdate();
      },
      [forceUpdate],
    );

    let secondary;
    const isUploadingOrComplete = flow.isUploading() || flow.isComplete();
    if (flow.flowObj.isUploading()) {
      secondary = (
        <LinearProgressWithLabel
          variant={isUploadingOrComplete ? 'determinate' : 'indeterminate'}
          value={isUploadingOrComplete ? flow.progress() * 100 : undefined}
          label={!flow.isComplete() ? `${averageSpeed}/s` : null}
        />
      );
    } else {
      secondary = formattedSize;
    }

    return (
      <ListItem
        secondaryAction={
          flow.flowObj.isUploading() || flow.paused ? (
            flow.paused ? (
              <IconButton key="pause" onClick={togglePause(false)} edge="end" aria-label="delete">
                <PauseIcon />
              </IconButton>
            ) : (
              <IconButton key="resume" onClick={togglePause(true)} edge="end" aria-label="delete">
                <PlayArrowIcon />
              </IconButton>
            )
          ) : (
            <IconButton key="delete" onClick={() => onRemove()} edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          )
        }
      >
        <ListItemAvatar>
          <Avatar>
            <Icon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          classes={{
            primary: classes.textOverflowWrapEllipsis,
            secondary: classes.textOverflowWrapEllipsis,
          }}
          primary={file.name}
          secondaryTypographyProps={{ component: 'div', height: secondaryHeight }}
          secondary={secondary}
        />
      </ListItem>
    );
  },
);

FileSummary.displayName = 'FileSummary';
FileSummary.propTypes = {
  onRemove: PropTypes.func,
  forceUpdate: PropTypes.func.isRequired,
  updateState: PropTypes.any.isRequired,
  file: PropTypes.object.isRequired,
};

// eslint-disable-next-line prettier/prettier
const noop = () => {};
FileSummary.defaultProps = {
  onRemove: noop,
};

export default FileSummary;

/**
 * @param {import('@mui/material/LinearProgress').LinearProgressProps & { label: string }} props
 * @returns
 */
function LinearProgressWithLabel({ label, ...props }) {
  return (
    <Box sx={{ display: 'flex', height: secondaryHeight, alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  label: PropTypes.string,
  ...LinearProgress.propTypes,
};
LinearProgressWithLabel.defaultProps = {
  label: null,
};
