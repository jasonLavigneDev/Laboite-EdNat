import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import i18n from 'meteor/universe:i18n';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useAppContext } from '../../contexts/context';
import { copy } from '../../utils/copy';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
  },
  blured: {
    color: 'transparent',
    textShadow: '0 0 6px rgba(0,0,0,0.5)',
    userSelect: 'none',
  },
  whitespace: {
    maxWidth: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  label: {
    whiteSpace: 'nowrap',
    marginRight: theme.spacing(1),
  },
  password: {
    cursor: 'pointer',
  },
}));

/**
 * @typedef {Object} FoldDataProps
 * @property {?any} foldStatus
 * @property {?any} foldData
 */

/**
 * @param {import('@mui/material/Box').BoxProps & FoldDataProps} props
 * @returns
 */
export default function FoldData(props) {
  const { foldStatus, foldData, className, ...rest } = props;

  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);

  const done = foldStatus?.status === '032-PAT' && !!foldData;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Paper {...rest} className={clsx(className, classes.container)}>
      {done ? (
        <Box flex={1} display="flex" gap={2} flexDirection="column" overflow="hidden">
          <Typography variant="h5" mb={6}>
            {i18n.__('pages.UploadPage.summary.title')}
          </Typography>
          <Typography>
            {i18n.__('pages.UploadPage.summary.expiryDate', {
              date: moment(foldData.preferences.dateValidite).format('LL'),
            })}
          </Typography>

          {foldData.typePli === 'LIE' && (
            <>
              <Box display="flex" alignItems="center">
                <Typography className={classes.label}>{i18n.__('pages.UploadPage.summary.link')}</Typography>
                <Link
                  className={classes.whitespace}
                  href={foldData.lienTelechargementPublic}
                  target="_blank"
                  rel="noreferrer"
                >
                  {foldData.lienTelechargementPublic}
                </Link>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography className={classes.label}>{i18n.__('pages.UploadPage.summary.password')}</Typography>
                <Tooltip title={i18n.__('pages.UploadPage.summary.clickToCopy')}>
                  <Typography
                    className={clsx(!showPassword && classes.blured, classes.password)}
                    onClick={() => {
                      copy(foldData.preferences.motDePasse)
                        .then(() => {
                          toast.info(i18n.__('pages.UploadPage.summary.linkCopied'));
                        })
                        .catch((err) => {
                          toast.error(i18n.__('pages.UploadPage.summary.errorWhenCopying'));
                          console.error(err);
                        });
                    }}
                  >
                    {foldData.preferences.motDePasse}
                  </Typography>
                </Tooltip>
                <Button onClick={() => setShowPassword((prev) => !prev)}>
                  {showPassword
                    ? i18n.__('pages.UploadPage.summary.hidePassword')
                    : i18n.__('pages.UploadPage.summary.showPassword')}
                </Button>
              </Box>
            </>
          )}
        </Box>
      ) : (
        <Box flex={1} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <CircularProgress />
          <Typography mt={2} variant="body1">
            {foldStatus?.label ?? ''}...
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

FoldData.displayName = 'FoldData';
FoldData.propTypes = {
  foldStatus: PropTypes.object,
  foldData: PropTypes.object,
  ...Box.prototype,
};
FoldData.defaultProps = {
  foldStatus: undefined,
  foldData: undefined,
};
