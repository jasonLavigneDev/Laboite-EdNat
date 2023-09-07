import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import './types';

/**
 * @typedef {Object} ImportBookmarkTableRowProps
 * @property {BookmarkToImport} bookmark - The bookmark's
 * @property {function} handleKeepChange
 * @property {function} handleAddToFavChange
 * @property {number} id
 */

/**
 * @param {ImportBookmarkTableRowProps} props
 */
export const ImportBookmarkTableRow = memo((props) => {
  const { bookmark, handleKeepChange, handleAddToFavChange, id } = props;
  const handleKeepChangeCbk = useCallback(
    (event, checked) => {
      handleKeepChange(id, checked);
    },
    [handleKeepChange, id],
  );
  const handleAddToFavChangeCbk = useCallback(
    (event, checked) => {
      handleAddToFavChange(id, checked);
    },
    [handleAddToFavChange, id],
  );

  return (
    <TableRow>
      <TableCell component="th" scope="row" className="import-bookmark-cell" title={bookmark.name}>
        {bookmark.name}
      </TableCell>
      <TableCell component="th" scope="row" className="import-bookmark-cell" title={bookmark.url}>
        {bookmark.url}
      </TableCell>
      <TableCell>
        <Checkbox checked={bookmark.keep} onChange={handleKeepChangeCbk} />
      </TableCell>
      <TableCell component="th" scope="row">
        <Checkbox checked={bookmark.addToPersonalSpace} disabled={!bookmark.keep} onChange={handleAddToFavChangeCbk} />
      </TableCell>
    </TableRow>
  );
});

ImportBookmarkTableRow.propTypes = {
  bookmark: PropTypes.object.isRequired,
  handleKeepChange: PropTypes.func.isRequired,
  handleAddToFavChange: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
};
