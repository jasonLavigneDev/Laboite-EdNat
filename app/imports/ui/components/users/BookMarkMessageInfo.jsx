import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import i18n from 'meteor/universe:i18n';
import Button from '@mui/material/Button';
import AddBoxIcon from '@mui/icons-material/AddBox';

const BookmarkMessageInfo = ({ bookmarkClasse, clipboardIsNotSupported }) => {
  return (
    <Grid className={bookmarkClasse}>
      {i18n.__('pages.PersonalPage.newBookMarkWithCtrV')}
      {!clipboardIsNotSupported ? i18n.__('pages.PersonalPage.newBookMarkWithCtrVOrButton') : ''}
      <br />
      {!clipboardIsNotSupported && (
        <Button startIcon={<AddBoxIcon />} style={{ backgroundColor: '#E5E5E5', color: 'black' }} variant="contained">
          {' '}
          {i18n.__('pages.BookmarksPage.materialTableLocalization.body_addTooltip')}
        </Button>
      )}
    </Grid>
  );
};

BookmarkMessageInfo.propTypes = {
  bookmarkClasse: PropTypes.string.isRequired,
  clipboardIsNotSupported: PropTypes.bool.isRequired,
};

export default BookmarkMessageInfo;
