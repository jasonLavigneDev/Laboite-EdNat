import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

import { useTheme } from '@mui/system';
import SwipeableViews from 'react-swipeable-views';
import { toast } from 'react-toastify';
import { Controller, useForm } from 'react-hook-form';

import { FormContainer, TextFieldElement, CheckboxElement } from 'react-hook-form-mui';
import TagsInput from '../form/TagInput';
import FTFoldSettings from './FoldSettings';
import { validateEmail } from '../../utils/utilsFuncs';
import TabPanel, { a11yProps } from './TabPanel';

/**
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

/**
 * @typedef {Object} FTFoldFormProps
 * @property {{formData: any} => string} onSubmit
 * @property {boolean} isUploadable
 * @property {boolean} isSubmitting
 * @property {boolean} isUploading
 * @property {import('@flowjs/flow.js')} uploader
 * @property {() => void} forceUpdate
 * @property {any} updateState
 * @property {() => void} onCancel
 */

/**
 * @param {import('@mui/material/Box').BoxProps & FTFoldFormProps} props
 * @returns
 */
export default function FTFoldForm(props) {
  const { onSubmit, isUploadable, isSubmitting, isUploading, uploader, forceUpdate, onCancel, ...rest } = props;
  const theme = useTheme();

  const form = useForm({
    defaultValues: {
      /**
       * 0 - Email
       * 1 - Link
       */
      foldType: 0,
      recipients: [],
      settings: {},
    },
    mode: 'all',
  });
  const {
    control,
    setValue,
    getValues,
    trigger,
    handleSubmit,
    watch,
    formState: { isValid },
  } = form;
  const foldType = watch('foldType');

  const handleFoldTypeChange = useCallback(
    (_e, newfoldType) => {
      setValue('foldType', newfoldType);
      trigger('recipients');
    },
    [trigger, setValue],
  );

  /**
   * @type {useState<boolean>}
   */
  const [showSettings, setSettingsDisplay] = useState(false);

  const tosCeckbox = (
    <CheckboxElement
      name="tos"
      disabled={isSubmitting}
      validation={{ validate: (v) => v === true }}
      label={
        <Typography variant="body2">
          {i18n.__('pages.UploadPage.tosLabel.a')}
          <Link
            href="https://francetransfert.numerique.gouv.fr/cgu"
            rel="noopener noreferrer"
            target="_blank"
            variant="body2"
          >
            {i18n.__('pages.UploadPage.tosLabel.b')}
          </Link>
          {i18n.__('pages.UploadPage.tosLabel.c')}
        </Typography>
      }
    />
  );

  const messageField = (
    <TextFieldElement
      name="message"
      id="message"
      disabled={isSubmitting}
      label={i18n.__('pages.UploadPage.messageLabel')}
      multiline
      minRows={3}
      maxRows={3}
      fullWidth
    />
  );

  if (showSettings && !isSubmitting)
    return (
      <FTFoldSettings
        onChange={(settings) => setValue('settings', settings)}
        onGoBack={() => setSettingsDisplay(false)}
        values={getValues().settings}
        {...rest}
      />
    );

  return (
    <FormContainer formContext={form} handleSubmit={handleSubmit(onSubmit)}>
      <Box display="flex" flexDirection="column" {...rest}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={foldType} onChange={handleFoldTypeChange} centered>
            <Tab disabled={isSubmitting} label={i18n.__('pages.UploadPage.emailFold')} {...a11yProps(0)} />
            <Tab disabled={isSubmitting} label={i18n.__('pages.UploadPage.linkFold')} {...a11yProps(1)} />
          </Tabs>
        </Box>
        <Box flex="1">
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={foldType}
            onChangeIndex={handleFoldTypeChange}
          >
            <TabPanel value={foldType} index={0}>
              <Controller
                name="recipients"
                disabled={isSubmitting}
                control={control}
                rules={{
                  validate: (v, formState) => {
                    if (formState.foldType === 0) {
                      return v.length > 0;
                    }

                    return true;
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <TagsInput
                    onAddTag={(tag) => {
                      onChange([...value, tag]);
                    }}
                    onRemoveTag={(index) => {
                      const newValue = value.slice();
                      newValue.splice(index, 1);

                      onChange(newValue);
                    }}
                    validate={(tag) => {
                      if (validateEmail(tag)) return true;

                      toast.error(i18n.__('pages.UploadPage.wrongEmailFormat'));
                      return false;
                    }}
                    tags={value}
                    multiline
                    id="recipients"
                    label={i18n.__('pages.UploadPage.recipientsLabel')}
                    placeholder={i18n.__('pages.UploadPage.recipientsPlaceholder')}
                    required
                    maxRows={2}
                    fullWidth
                  />
                )}
              />
              <TextFieldElement
                name="subject"
                label={i18n.__('pages.UploadPage.subjectLabel')}
                fullWidth
                disabled={isSubmitting}
              />
              {messageField}
              {tosCeckbox}
            </TabPanel>
            <TabPanel value={foldType} index={1}>
              <TextFieldElement
                name="title"
                label={i18n.__('pages.UploadPage.linkNameLabel')}
                fullWidth
                disabled={isSubmitting}
              />
              {messageField}
              {tosCeckbox}
            </TabPanel>
          </SwipeableViews>
        </Box>
        <Box padding={1} display="flex" justifyContent="space-between" alignItems="center">
          {uploader && isUploading ? (
            <>
              <Button type="button" onClick={onCancel}>
                {i18n.__('pages.UploadPage.abort')}
              </Button>
              {uploader.isUploading() ? (
                <Button
                  type="button"
                  onClick={() => {
                    uploader.pause();
                    forceUpdate();
                  }}
                >
                  {i18n.__('pages.UploadPage.pause')}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    uploader.resume();
                    forceUpdate();
                  }}
                >
                  {i18n.__('pages.UploadPage.resume')}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" onClick={() => setSettingsDisplay(true)}>
                {i18n.__('pages.UploadPage.settingsBtn')}
              </Button>
              <Button type="submit" disabled={!isValid || !isUploadable || isSubmitting}>
                {i18n.__('pages.UploadPage.send')}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </FormContainer>
  );
}

FTFoldForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isUploadable: PropTypes.bool.isRequired,
  isUploading: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  forceUpdate: PropTypes.func.isRequired,
  updateState: PropTypes.any.isRequired,
  onCancel: PropTypes.func.isRequired,
  ...Box.prototype,
};

FTFoldForm.defaultProps = {};
