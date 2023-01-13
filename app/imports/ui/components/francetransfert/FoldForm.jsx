import React, { useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

import { useTheme } from '@mui/system';
import SwipeableViews from 'react-swipeable-views';
import { toast } from 'react-toastify';

import TagsInput from '../form/TagInput';
import { useAppContext } from '../../contexts/context';
import FTFoldSettings from './FoldSettings';

const useStyles = makeStyles()((theme) => ({
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1),
  },
}));

/**
 *
 * @param {string} email
 * @returns
 */
const validateEmail = (email) => {
  return email.match(
    // eslint-disable-next-line max-len, no-useless-escape
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

/**
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

/**
 * @typedef {Object} FTFoldFormProps
 */

/**
 * @param {import('@mui/material/Box').BoxProps & FTFoldFormProps} props
 * @returns
 */
export default function FTFoldForm(props) {
  const { ...rest } = props;

  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);
  const theme = useTheme();

  /**
   * 0 - Email
   * 1 - Link
   * @typedef {number} FoldType
   */
  /** @type {useState<FoldType>} */
  const [foldType, setfoldType] = React.useState(0);

  const handleFoldTypeChange = (event, newfoldType) => {
    setfoldType(newfoldType);
  };

  /**
   * @type {useState<string[]>}}
   */
  const [recipients, setRecipients] = React.useState([]);

  const tosCeckbox = (
    <FormControlLabel
      sx={{
        mt: 4,
      }}
      control={<Checkbox />}
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
    <TextField
      id="message"
      label={i18n.__('pages.UploadPage.messageLabel')}
      multiline
      minRows={3}
      maxRows={3}
      fullWidth
    />
  );

  /**
   * @type {useState<boolean>}
   */
  const [showSettings, setSettingsDisplay] = useState(false);

  if (showSettings)
    return (
      <Box display="flex" flexDirection="column" {...rest}>
        <FTFoldSettings onGoBack={() => setSettingsDisplay(false)} />
      </Box>
    );

  return (
    <Box display="flex" flexDirection="column" {...rest}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={foldType} onChange={handleFoldTypeChange} centered>
          <Tab label={i18n.__('pages.UploadPage.emailFold')} {...a11yProps(0)} />
          <Tab label={i18n.__('pages.UploadPage.linkFold')} {...a11yProps(1)} />
        </Tabs>
      </Box>
      <Box flex="1">
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={foldType}
          onChangeIndex={handleFoldTypeChange}
        >
          <TabPanel value={foldType} index={0}>
            <TagsInput
              onAddTag={(tag) => {
                setRecipients((prev) => [...prev, tag]);
              }}
              onRemoveTag={(index) => {
                setRecipients(([...prev]) => {
                  prev.splice(index, 1);
                  return prev;
                });
              }}
              validate={(tag) => {
                if (validateEmail(tag)) return true;

                toast.error(i18n.__('pages.UploadPage.wrongEmailFormat'));
                return false;
              }}
              tags={recipients}
              multiline
              id="recipients"
              label={i18n.__('pages.UploadPage.recipientsLabel')}
              placeholder={i18n.__('pages.UploadPage.recipientsPlaceholder')}
              required
              maxRows={2}
              fullWidth
            />
            <TextField id="subjet" label={i18n.__('pages.UploadPage.subjectLabel')} fullWidth />
            {messageField}
            {tosCeckbox}
          </TabPanel>
          <TabPanel value={foldType} index={1}>
            <TextField id="subjet" label={i18n.__('pages.UploadPage.linkNameLabel')} fullWidth />
            {messageField}
            {tosCeckbox}
          </TabPanel>
        </SwipeableViews>
      </Box>
      <div className={classes.actions}>
        <Button onClick={() => setSettingsDisplay(true)}>{i18n.__('pages.UploadPage.settingsBtn')}</Button>
        <Button>{i18n.__('pages.UploadPage.send')}</Button>
      </div>
    </Box>
  );
}

FTFoldForm.propTypes = {
  ...Box.prototype,
};

FTFoldForm.defaultProps = {};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
TabPanel.defaultProps = {
  children: undefined,
};
