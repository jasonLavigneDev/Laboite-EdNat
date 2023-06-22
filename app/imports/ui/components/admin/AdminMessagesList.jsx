import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Button, InputLabel, MenuItem, FormControl, Select, Paper, Chip } from '@mui/material';
import sanitizeHtml from 'sanitize-html';
import PropTypes from 'prop-types';

export const AdminMessagesList = ({ messages, deleteMessage, selectMessageLanguage, selectMessageToUpdate }) => {
  const handleChangeMessageLanguage = (e) => {
    selectMessageLanguage(e.target.value);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: '70vh',
        overflow: 'scroll',
        overflowX: 'hidden',
        gap: '1vh',
        width: '100%',
      }}
    >
      <FormControl sx={{ width: '92%', paddingBottom: '1vh', marginTop: '1vh' }}>
        <InputLabel id="demo-simple-select-label">langue des messages</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="langue des messages"
          onChange={handleChangeMessageLanguage}
        >
          <MenuItem value="all">all</MenuItem>
          <MenuItem value="fr">fr</MenuItem>
          <MenuItem value="en">en</MenuItem>
        </Select>
      </FormControl>

      {messages
        ?.sort((a, b) => b.updatedAt - a.updatedAt)
        .map((message) => (
          <Paper
            key={message._id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1vh',
              padding: '1vh 2vw',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '20px',
              width: '66vw',
            }}
          >
            {message.structureId.length ? (
              <Chip style={{ width: '40%' }} label="Ma super structure" color="primary" />
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(message?.content) }} />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '10vw',
                  border: '1px solid black',
                  borderRadius: '15px',
                  padding: '1vh 1vw',
                  height: 'max-content',
                }}
              >
                <span>Crée le : {message?.createdAt?.toLocaleDateString()}</span>
                <span>Mis a jour le : {message?.updatedAt?.toLocaleDateString()}</span>
                <span>Expire le : {message?.expirationDate?.toLocaleDateString()}</span>
                <span>Langue du message : {message?.language}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1vw' }}>
              <Button variant="contained" onClick={() => selectMessageToUpdate(message._id)}>
                Modifier le message
              </Button>
              <Button variant="contained" onClick={() => deleteMessage(message._id)}>
                Supprimer le message
              </Button>
            </div>
          </Paper>
        ))}
    </div>
  );
};

AdminMessagesList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.string),
  deleteMessage: PropTypes.func,
  selectMessageToUpdate: PropTypes.func,
  selectMessageLanguage: PropTypes.string,
};

AdminMessagesList.defaultProps = {
  messages: undefined,
  deleteMessage: undefined,
  selectMessageLanguage: undefined,
  selectMessageToUpdate: undefined,
};
