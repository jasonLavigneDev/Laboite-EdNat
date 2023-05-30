import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Button, Input, InputLabel, TextField, Typography } from '@mui/material';
import { useAppContext } from '../contexts/context';

export const GlobalInfoTest = () => {
  const [messages, setMessages] = useState([]);
  const [{ language, user }] = useAppContext();

  const [newMessage, setNewMessage] = useState();
  const [validity, setValidity] = useState(30);
  const [userDateOfLastMessage, setUserDateOfLastMessage] = useState();
  const [languageMessage, setLanguageMessage] = useState('fr');

  const deleteMessage = (messageId) => {
    console.log('user', user);
    Meteor.call('globalInfos.deleteGlobalInfo', { messageId }, (error) => {
      if (error) {
        console.log('error', error);
      }
      const test = messages.filter((message) => message._id !== messageId);
      setMessages(test);
    });
  };

  console.log('validity', validity);

  console.log('languageMessage', languageMessage);
  const handleSubmit = (e) => {
    e.preventDefault();

    const newMessageBE = {
      language: languageMessage,
      content: newMessage,
      expirationDays: validity,
    };

    Meteor.call('globalInfos.createGlobalInfo', { ...newMessageBE }, (error, res) => {
      if (error) {
        console.log('error', error);
        return;
      }
      console.log('create success');
      const oldMessages = [...messages];
      oldMessages.push(res);
      setMessages(oldMessages);
    });
  };
  const modifyLastMessageRead = () => {
    Meteor.call('users.setLastGlobalInfoRead', { lastGlobalInfoReadDate: new Date(userDateOfLastMessage) });
  };

  useEffect(() => {
    Meteor.call('globalInfos.getGlobalInfoByLanguageAndNotExpired', { language, date: new Date() }, (error, res) => {
      if (error) {
        console.log('error', error);
        return;
      }
      setMessages(res);
    });
  }, []);

  // const getAllMessagesByLanguage = () => {
  //   Meteor.call('globalInfos.getAllGlobalInfoByLanguage', { language }, (error, res) => {
  //     if (error) {
  //       console.log('error', error);
  //       return;
  //     }
  //     setMessages(res);
  //   });
  // };

  const getAllMessages = () => {
    Meteor.call('globalInfos.getAllGlobalInfo', { language }, (error, res) => {
      if (error) {
        console.log('error', error);
        return;
      }
      setMessages(res);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '2vh' }}>
        <Typography>INFOS USER : dernier message lu : {user?.lastGlobalInfoReadDate?.toLocaleDateString()}</Typography>
        <div>
          <Typography>Definir la date du dernier message lu</Typography>
          <Input
            type="date"
            name=""
            id=""
            value={userDateOfLastMessage}
            onChange={(e) => setUserDateOfLastMessage(e.target.value)}
          />
          <Button style={{ height: '30px' }} type="button" onClick={modifyLastMessageRead}>
            Definir la date du dernier message lu
          </Button>
        </div>
      </div>

      <h1>CREER MESSAGE</h1>
      <InputLabel htmlFor="newMessage">texte du message</InputLabel>
      <TextField id="newMessage" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} name="newMessage" />
      <InputLabel htmlFor="validity">validité du message en jours</InputLabel>
      <TextField id="validity" value={validity} onChange={(e) => setValidity(e.target.value)} name="validity" />
      <InputLabel htmlFor="lang">language</InputLabel>
      <select name="language" id="" onChange={(e) => setLanguageMessage(e.target.value)}>
        <option>t</option>
        <option value="fr">fr</option>
        <option value="en">en</option>
      </select>
      <Button type="button" onClick={handleSubmit}>
        Envoyer
      </Button>

      <div>
        <Button type="button" onClick={getAllMessages}>
          Afficher tous les messages de la base
        </Button>
        <h1>Liste des messages en base</h1>
        {messages.map((info) => (
          <Paper
            key={info._id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '80%',
              alignItems: 'start',
              marginBottom: '1vh',
              padding: '2vh 10vw',
            }}
          >
            <p style={{ height: '1vh' }}>Crée le : {info?.createdAt?.toLocaleDateString()}</p>
            <p>Expire le : {info?.expirationDate?.toLocaleDateString()}</p>
            <p>Langue du message : {info?.language}</p>
            <Chip label="Ma super structure" color="primary" />
            <p>Message : {info?.content}</p>
            <div style={{ display: 'flex', alignSelf: 'center', justifyContent: 'space-between', width: '80%' }}>
              <Button type="button">Modifier le message</Button>
              <Button type="button" onClick={() => deleteMessage(info._id)}>
                Supprimer le message
              </Button>
            </div>
          </Paper>
        ))}
      </div>
    </div>
  );
};

export default GlobalInfoTest;
