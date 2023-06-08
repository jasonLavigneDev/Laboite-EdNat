import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Button, Input, InputLabel, Typography, Select, MenuItem, FormControl } from '@mui/material';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import { CustomToolbarArticle } from '../system/CustomQuill';
import { quillOptions } from './InfoEditionComponent';

export const AdminMessageForm = ({ createMessage, initialMessage, isOnUpdateMessage, updateMessage }) => {
  const today = new Date();
  const defaultDaysOfValidity = 10;
  const defaultExpiration = new Date(today.setDate(today.getDate() + defaultDaysOfValidity));

  const [content, setContent] = useState();
  const [expirationDate, setExpirationDate] = useState();
  const [language, setLanguage] = useState();
  const title = isOnUpdateMessage ? 'MODIFIER MESSAGE' : 'CREER MESSAGE';
  const action = isOnUpdateMessage ? 'MODIFIER' : 'CREER ';

  useEffect(() => {
    setContent(initialMessage?.content || '');
    setExpirationDate(initialMessage?.expirationDate || defaultExpiration);
    setLanguage(initialMessage?.language || 'fr');
  }, [initialMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isOnUpdateMessage) {
      const updatedMessage = { ...initialMessage, content, expirationDate, language };
      updateMessage(updatedMessage);
    } else {
      const newMessage = {
        language,
        content,
        expirationDate: new Date(expirationDate),
      };
      createMessage(newMessage);
    }
    setLanguage('fr');
    setContent('');
    setExpirationDate(defaultExpiration);
  };

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  const handleChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '45%', gap: '1vh' }}>
      <Typography variant="h5">{title}</Typography>
      <form style={{ display: 'flex', gap: '1vh', flexDirection: 'column' }}>
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

        <Button variant="contained" onClick={handleSubmit} style={{ width: '10vw', marginTop: '2vh' }}>
          {action}
        </Button>
      </form>
    </div>
  );
};

AdminMessageForm.propTypes = {
  createMessage: PropTypes.func,
  updateMessage: PropTypes.func,
  isOnUpdateMessage: PropTypes.bool,
  initialMessage: PropTypes.object,
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
};
