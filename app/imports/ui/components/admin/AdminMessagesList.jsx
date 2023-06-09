import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Button, InputLabel, MenuItem, FormControl, Select, Paper, Chip } from '@mui/material';
import sanitizeHtml from 'sanitize-html';
import PropTypes from 'prop-types';

export const AdminMessagesList = ({
  messages,
  deleteMessage,
  selectMessageLanguage,
  selectMessageToUpdate,
  isNotInAdminPanel,
  user,
}) => {
  const handleChangeMessageLanguage = (e) => {
    selectMessageLanguage(e.target.value);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxHeight: user ? '' : '70vh',
        overflow: user ? 'hidden' : 'scroll',
        overflowX: 'hidden',
        gap: '1vh',
        width: user ? '80%' : '50%',
      }}
    >
      {!isNotInAdminPanel && (
        <FormControl sx={{ width: '92%', paddingBottom: '1vh' }}>
          <InputLabel id="demo-simple-select-label">langue des messages</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="language"
            onChange={handleChangeMessageLanguage}
          >
            <MenuItem value="all">all</MenuItem>
            <MenuItem value="fr">fr</MenuItem>
            <MenuItem value="en">en</MenuItem>
          </Select>
        </FormControl>
      )}

      {messages
        ?.sort((a, b) => b.updatedAt - a.updatedAt)
        .map((message) => (
          <Paper
            key={message._id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: user ? '60vw' : '30vw',
              marginBottom: '1vh',
              padding: '1vh 2vw',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '20px',
            }}
          >
            <p style={{ height: '1vh' }}>Crée le : {message?.createdAt?.toLocaleDateString()}</p>
            <p style={{ height: '1vh' }}>Mis a jour le : {message?.updatedAt?.toLocaleDateString()}</p>

            <p>Expire le : {message?.expirationDate?.toLocaleDateString()}</p>
            <p>Langue du message : {message?.language}</p>
            <Chip style={{ width: '40%' }} label="Ma super structure" color="primary" />
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(message?.content) }} />
            {/* <Typography>Message : {message?.content}</Typography> */}
            {!isNotInAdminPanel && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1vw' }}>
                <Button variant="contained" onClick={() => selectMessageToUpdate(message._id)}>
                  Modifier le message
                </Button>
                <Button variant="contained" onClick={() => deleteMessage(message._id)}>
                  Supprimer le message
                </Button>
              </div>
            )}
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
  user: PropTypes.bool,
  isNotInAdminPanel: PropTypes.bool,
};

AdminMessagesList.defaultProps = {
  messages: undefined,
  deleteMessage: undefined,
  selectMessageLanguage: undefined,
  selectMessageToUpdate: undefined,
  user: false,
  isNotInAdminPanel: false,
};
