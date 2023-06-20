import React, { useEffect, useState } from 'react';
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
  const title = isOnUpdateMessage ? 'MODIFIER MESSAGE' : 'CREER MESSAGE';
  const action = isOnUpdateMessage ? 'MODIFIER' : 'CREER ';

  useEffect(() => {
    setContent(initialMessage?.content || '');
    setExpirationDate(initialMessage?.expirationDate || defaultExpiration.toISOString().slice(0, 10));
    setLanguage(initialMessage?.language || userLanguage);
  }, [initialMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (content !== '') {
      if (isOnUpdateMessage) {
        const updatedMessage = { ...initialMessage, content, expirationDate, language };
        updateMessage(updatedMessage);
        closeModal();
        msg.success('Information mise à jour avec succès');
      } else {
        const newMessage = {
          language,
          content,
          expirationDate: new Date(expirationDate),
        };
        createMessage(newMessage);
        closeModal();
        msg.success('Information créée avec succès');
      }
      setLanguage('fr');
      setContent('');
      setExpirationDate(defaultExpiration);
    } else {
      msg.error('Le contenu du message est vide !');
    }
  };

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  const handleChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3vh', padding: '2vh 2vw' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">{title}</Typography>
        <IconButton onClick={closeModal}>
          <CloseIcon fontSize="large" />
        </IconButton>
      </div>
      <form style={{ display: 'flex', gap: '1vh', flexDirection: 'column' }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Language</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={language}
            label="language"
            placeholder="language"
            onChange={handleChange}
          >
            <MenuItem value="fr">fr</MenuItem>
            <MenuItem value="en">en</MenuItem>
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

        <Typography variant="h6">date d expiration</Typography>
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
            Annuler
          </Button>
          <Button variant="contained" onClick={handleSubmit} style={{ width: '10vw', marginTop: '2vh' }}>
            {action}
          </Button>
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
