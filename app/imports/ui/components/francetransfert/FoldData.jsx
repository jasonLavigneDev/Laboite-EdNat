import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Box from '@mui/material/Box';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles()(() => ({}));

/**
 * @typedef {Object} FoldDataProps
 * @property {any} foldStatus
 * @property {any} foldData
 */

/**
 * @param {import('@mui/material/Box').BoxProps & FoldDataProps} props
 * @returns
 */
export default function FoldData(props) {
  const { foldStatus, foldData, ...rest } = props;

  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);

  console.log(foldData);

  return (
    <Box {...rest}>
      {foldStatus.status !== '032-PAT' && `${foldStatus.label}...`}
      {foldData?.typePli === 'LIE' ? (
        <div>
          <a href={foldData.lienTelechargementPublic} target="_blank" rel="noreferrer">
            {foldData.lienTelechargementPublic}
          </a>
          <p>{foldData.preferences?.motDePasse}</p>
        </div>
      ) : (
        <p>Le pli a été envoyé avec succès</p>
      )}
      {foldData && <pre>{JSON.stringify(foldData, null, 2)}</pre>}
    </Box>
  );
}

FoldData.displayName = 'FoldData';
FoldData.propTypes = {
  foldStatus: PropTypes.object.isRequired,
  foldData: PropTypes.object,
  ...Box.prototype,
};
FoldData.defaultProps = {
  foldData: null,
};
