import React, { useEffect, useState } from 'react';
import i18n from 'meteor/universe:i18n';
// eslint-disable-next-line no-restricted-imports
import { Button, Input, InputLabel, Typography, Select, MenuItem, FormControl, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import CloseIcon from '@mui/icons-material/Close';
import { CustomToolbarArticle } from '../system/CustomQuill';
import { quillOptions } from './InfoEditionComponent';
import { useAppContext } from '../../contexts/context';

export const AdminMessageForm = ({ createMessage, initialMessage, isOnUpdateMessage, updateMessage, closeModal }) => {
  const DEFAULT_VALIDITY_MESSAGE_IN_DAYS = 10;
  const today = new Date();
  const defaultExpiration = new Date(today.setDate(today.getDate() + DEFAULT_VALIDITY_MESSAGE_IN_DAYS));

  const [{ language: userLanguage }] = useAppContext();

  const [content, setContent] = useState();
  const [expirationDate, setExpirationDate] = useState();
  const [language, setLanguage] = useState(userLanguage);
  const title = isOnUpdateMessage
    ? i18n.__('components.AdminMesssage.button_modify')
    : i18n.__('components.AdminMesssage.button_create');
  const action = isOnUpdateMessage
    ? i18n.__('components.AdminMesssage.button_modify')
    : i18n.__('components.AdminMesssage.button_create');

  useEffect(() => {
    setContent(initialMessage?.content || '');
    setExpirationDate(initialMessage?.expirationDate || defaultExpiration.toISOString().slice(0, 10));
    setLanguage(initialMessage?.language || userLanguage);
  }, [initialMessage]);

  const handleSubmit = (e, publish = false) => {
    e.preventDefault();

    if (content !== '') {
      if (isOnUpdateMessage) {
        const updatedMessage = { ...initialMessage, content, expirationDate, language };
        updateMessage(updatedMessage, publish);
        closeModal();
        msg.success(i18n.__('components.AdminMesssage.update_info_success'));
      } else {
        const newMessage = {
          language,
          content,
          expirationDate: new Date(expirationDate),
        };
        createMessage(newMessage);
        closeModal();
        msg.success(i18n.__('components.AdminMesssage.create_info_success'));
      }
      setLanguage('fr');
      setContent('');
      setExpirationDate(defaultExpiration);
    } else {
      msg.error(i18n.__('components.AdminMesssage.missing_content'));
    }
  };

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3vh', padding: '2vh 2vw', width: '60vw' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">{title}</Typography>
        <IconButton onClick={closeModal}>
          <CloseIcon fontSize="large" />
        </IconButton>
      </div>
      <form style={{ display: 'flex', gap: '1vh', flexDirection: 'column' }}>
        <FormControl fullWidth>
          <InputLabel id="select-langage">{i18n.__('components.AdminMesssage.select_language_form')}</InputLabel>
          <Select
            labelId="select-langage"
            id="select-langage"
            value={language}
            label={i18n.__('components.AdminMesssage.select_language')}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="fr">{i18n.__('components.InfoEditionComponent.language_fr')}</MenuItem>
            <MenuItem value="en">{i18n.__('components.InfoEditionComponent.language_en')}</MenuItem>
          </Select>
        </FormControl>

        <div>
          <CustomToolbarArticle />
          <ReactQuill
            id="content"
            value={content || ''}
            onChange={onUpdateRichText}
            {...quillOptions}
            style={{ height: '20vh' }}
          />
        </div>

        <Typography variant="h6">{i18n.__('components.AdminMesssage.label_expire')}</Typography>
        <Input
          type="date"
          name=""
          id=""
          value={expirationDate}
          onChange={(e) => {
            setExpirationDate(e.target.value);
          }}
        />
        <div style={{ display: 'flex', gap: '1vw' }}>
          <Button variant="contained" onClick={closeModal} style={{ width: '10vw', marginTop: '2vh' }}>
            {i18n.__('components.AdminMesssage.cancel')}
          </Button>
          <Button variant="contained" onClick={handleSubmit} style={{ width: '10vw', marginTop: '2vh' }}>
            {action}
          </Button>
          {isOnUpdateMessage ? (
            <Button
              variant="contained"
              onClick={(evt) => handleSubmit(evt, true)}
              style={{ width: '10vw', marginTop: '2vh' }}
            >
              {i18n.__('components.AdminMesssage.button_publish')}
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
};

AdminMessageForm.propTypes = {
  createMessage: PropTypes.func,
  updateMessage: PropTypes.func,
  isOnUpdateMessage: PropTypes.bool,
  initialMessage: PropTypes.object,
  closeModal: PropTypes.func,
};

AdminMessageForm.defaultProps = {
  createMessage: undefined,
  updateMessage: PropTypes.func,
  isOnUpdateMessage: false,
  initialMessage: {
    content: '',
    expirationDate: undefined,
    language: 'fr',
  },
  closeModal: undefined,
};
