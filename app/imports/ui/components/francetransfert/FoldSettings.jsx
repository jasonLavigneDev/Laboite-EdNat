import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

import { makeStyles } from 'tss-react/mui';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useForm, useWatch } from 'react-hook-form';
import { FormContainer, PasswordElement, SelectElement, CheckboxElement, DatePickerElement } from 'react-hook-form-mui';

import ErrorIcon from '@mui/icons-material/Error';
import CheckIcon from '@mui/icons-material/Check';

import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles()((theme) => ({
  conditionsList: {
    listStyleType: 'none',
    padding: 0,
    paddingLeft: theme.spacing(0.5),
    '& li': {
      display: 'flex',
      gap: theme.spacing(1),
    },
    '& li:not(:last-child)': {
      marginBottom: theme.spacing(0.5),
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

/**
 * @typedef {Object} FTFoldSettingsProps
 * @property {() => void} onGoBack
 * @property {(data: any) => void} onChange
 * @property {any} values
 */

/**
 * @param {import('@mui/material/Box').BoxProps & FTFoldSettingsProps} props
 * @returns
 */
export default function FTFoldSettings({ onGoBack, onChange, values, ...rest }) {
  const form = useForm({
    defaultValues: {
      expiryDate: new Date(),
      language: availableLangs[0],
      ...values,
    },
    mode: 'all',
    reValidateMode: 'onChange',
  });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  return (
    <FormContainer
      formContext={form}
      handleSubmit={handleSubmit((data) => {
        onChange(data);
        onGoBack();
      })}
    >
      <Box display="flex" flexDirection="column" {...rest}>
        <Box flex="1">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePickerElement
              name="expiryDate"
              minDate={new Date()}
              label={i18n.__('pages.UploadPage.settings.expiryDateLabel')}
              inputProps={{ fullWidth: true }}
            />
          </LocalizationProvider>
          <PasswordWithCondition />
          <SelectElement
            name="language"
            labelId="language-select-label"
            id="language-select"
            fullWidth
            label={i18n.__('pages.UploadPage.settings.languageLabel')}
            options={availableLangs.map((lang) => ({
              id: lang,
              label: capitalizeFirstLetter(languageNames.of(lang.replace(/_/g, '-'))),
            }))}
          />
          <CheckboxElement
            name="encrypt"
            label={<Typography variant="body2">{i18n.__('pages.UploadPage.settings.encryptLabel')}</Typography>}
          />
        </Box>
        <Box padding={1} display="flex" justifyContent="space-between" alignItems="center">
          <Button type="button" onClick={() => onGoBack()}>
            {i18n.__('pages.UploadPage.settings.cancel')}
          </Button>
          <Button type="submit" disabled={!isValid}>
            {i18n.__('pages.UploadPage.settings.save')}
          </Button>
        </Box>
      </Box>
    </FormContainer>
  );
}

function PasswordWithCondition() {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);

  const validate = useCallback((value) => {
    const validations = {
      minMax: /(?=.{12,64})/g.test(value),
      lowerCase: /(?=(.*[a-z]){3,})/g.test(value),
      upperCase: /(?=(.*[A-Z]){3,})/g.test(value),
      digits: /(?=(.*[0-9]){3,})/g.test(value),
      specialChars: /(?=(.*[!@#$%^&*()_\-:+]){3,})/g.test(value),
      validChars: !/^.*[^!@#$%^&*()_\-:+a-zA-Z0-9].*$/g.test(value),
    };

    return {
      conditions: validations,
      ok: Object.values(validations).every((c) => c === true) || !value,
    };
  }, []);

  /**
   * @type {string}
   */
  const password = useWatch({ name: 'password' }) || '';
  const hints = useMemo(() => validate(password).conditions, [password]);

  return (
    <>
      <PasswordElement
        validation={{
          validate: (v) => validate(v).ok,
        }}
        name="password"
        type="password"
        autoComplete="new-password"
        label={i18n.__('pages.UploadPage.settings.passwordLabel')}
        fullWidth
      />
      <ul className={classes.conditionsList}>
        <li>
          {hints.minMax ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
          {i18n.__('pages.UploadPage.settings.passwordConditions.minMaxChars')}
        </li>
        <li>
          {hints.lowerCase ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
          {i18n.__('pages.UploadPage.settings.passwordConditions.lowercase')}
        </li>
        <li>
          {hints.upperCase ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
          {i18n.__('pages.UploadPage.settings.passwordConditions.uppercase')}
        </li>
        <li>
          {hints.digits ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
          {i18n.__('pages.UploadPage.settings.passwordConditions.numbers')}
        </li>
        <li>
          {hints.specialChars ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
          {i18n.__('pages.UploadPage.settings.passwordConditions.specialChars')}
        </li>
        <li>
          {hints.validChars ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
          {i18n.__('pages.UploadPage.settings.passwordConditions.supported')}
        </li>
      </ul>
    </>
  );
}

FTFoldSettings.propTypes = {
  onGoBack: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  values: PropTypes.object,
  ...Box.prototype,
};

FTFoldSettings.defaultProps = {
  values: {},
};
