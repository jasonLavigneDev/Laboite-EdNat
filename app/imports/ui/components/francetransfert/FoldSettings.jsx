import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

import { makeStyles } from 'tss-react/mui';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles()((theme) => ({
  languageItem: {
    ':first-letter': {
      textTransform: 'uppercase',
    },
  },
}));

/**
 *
 * @param {string} str
 * @returns
 */
const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Voir §3.1
 */
const availableLangs = ['fr_FR', 'en_GB', 'es_ES'];

const languageNames = new Intl.DisplayNames([i18n._locale], { type: 'language' });

/**
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

export default function FTFoldSettings({ onGoBack }) {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);

  const [language, setLanguage] = React.useState('fr_FR');

  const handleChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <>
      <Box flex="1">
        <TextField id="expiryDate" type="date" label={i18n.__('pages.UploadPage.settings.expiryDateLabel')} fullWidth />
        <TextField
          id="password"
          type="password"
          autoComplete="new-password"
          label={i18n.__('pages.UploadPage.settings.passwordLabel')}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="language-select-label">{i18n.__('pages.UploadPage.settings.languageLabel')}</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={language}
            label={i18n.__('pages.UploadPage.settings.languageLabel')}
            onChange={handleChange}
          >
            {availableLangs.map((lang) => (
              <MenuItem className={classes.languageItem} value={lang}>
                {capitalizeFirstLetter(languageNames.of(lang.replace(/_/g, '-')))}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          sx={{
            mt: 4,
          }}
          control={<Checkbox />}
          label={<Typography variant="body2">{i18n.__('pages.UploadPage.settings.encryptLabel')}</Typography>}
        />
      </Box>
      <Box padding={1}>
        <Button onClick={() => onGoBack()}>{i18n.__('pages.UploadPage.settings.goBack')}</Button>
      </Box>
    </>
  );
}

FTFoldSettings.propTypes = {
  onGoBack: PropTypes.func.isRequired,
};

FTFoldSettings.defaultProps = {};
