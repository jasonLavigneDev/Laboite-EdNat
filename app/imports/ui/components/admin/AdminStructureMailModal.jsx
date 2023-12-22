import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';

import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
// eslint-disable-next-line no-restricted-imports
import { Fade, Modal } from '@mui/material';

import { useAppContext } from '../../contexts/context';
import { CustomToolbarArticle } from '../system/CustomQuill';
import { quillOptions } from './InfoEditionComponent';
import Spinner from '../system/Spinner';

const AdminStructureMailModal = ({ open, onClose, setIsModalMail, choosenStructureMail }) => {
  const [content, setContent] = useState();
  const [{ user }] = useAppContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subStructure, setSubStructure] = useState(true);
  const [structures, setStructures] = useState([]);

  // Il faut entrer/supprimer uniquement les adresses mails dans cette liste, par l'event case à cocher
  // ok
  // eslint-disable-next-line no-unused-vars
  const [selectedUsers, setSelectedUsers] = useState([]);

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  useEffect(() => {
    if (choosenStructureMail) {
      if (loading) {
        Meteor.call(
          'users.getAdminsFromStructure',
          { structure: choosenStructureMail._id, subStructure },
          (error, result) => {
            if (result) {
              if (result.users.length > 0) {
                setUsers(result.users);
                setStructures(result.structures);
              }
            }
            setLoading(false);
          },
        );
      }
    }
  }, [subStructure]);

  const toggleFilterOnSubStructure = () => {
    setSubStructure(!subStructure);
    setLoading(true);
  };

  const findStructureOfUser = (structureId) => {
    const currentStructure = structures.find((structure) => structure._id === structureId);
    if (currentStructure) return currentStructure.name;
    return 'N/A';
  };

  // A lier au bouton envoyer.
  // eslint-disable-next-line no-unused-vars
  const SendMailToUsers = () => {
    if (selectedUsers && selectedUsers.length > 0) {
      Meteor.call('smtp.sendMailToDiffusionList', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emails[0].address,
        text: content,
        mailList: selectedUsers,
      });
    }
  };

  const style = {
    paper: {
      display: 'flex',
      flexDirection: 'column',
      margin: 5,
    },
    divContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    paperMessage: {
      flexGrow: 2,
      padding: '5px 10px',
      flexDirection: 'column',
    },
    containerQuill: {
      padding: '20px 50px',
    },
    textEditor: {
      height: '50vh',
    },
    paperContainerList: {
      flexDirection: 'column',
      width: '20vw',
      maxHeight: '67vh',
      padding: 1,
      gap: 1,
      overflow: 'auto',
    },
    paperList: {
      width: '100%',
      paddingTop: '1vh',
      paddingBottom: '1vh',
      paddingLeft: '1vw',
      display: 'flex',
    },
    divText: {
      display: 'flex',
      flexDirection: 'column',
      placeContent: 'center',
      marginLeft: '3vw',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    divButton: {
      display: 'flex',
      placeContent: 'center',
      paddingBottom: '2vh',
      gap: '350px',
    },
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Fade in={open}>
        <Paper sx={style.paper}>
          <div style={style.divContainer}>
            <Paper sx={{ ...style.paper, ...style.paperMessage }}>
              <h2>Créer un nouveau message</h2>
              <div style={style.containerQuill}>
                <CustomToolbarArticle />
                <ReactQuill
                  id="content"
                  value={content || ''}
                  onChange={onUpdateRichText}
                  {...quillOptions}
                  style={style.textEditor}
                />
              </div>
            </Paper>
            <Paper sx={style.paper}>
              <div style={{ ...style.paper, ...style.paperContainerList }}>
                <FormControl component="fieldset" variant="standard">
                  <FormControlLabel
                    control={
                      <Switch checked={!subStructure} onChange={toggleFilterOnSubStructure} name="subStructure" />
                    }
                    label="afficher uniquement les administrateurs de la structure sélectionnée."
                  />
                </FormControl>
                {!loading ? (
                  users && users.length > 0 ? (
                    users.map((admin) => (
                      <Paper sx={style.paperList}>
                        <Checkbox />
                        <div style={style.divText}>
                          <span style={{ textOverflow: 'ellipsis' }}>
                            {admin.firstName} {admin.lastName}
                          </span>
                          <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {findStructureOfUser(admin.structure)}
                          </span>
                        </div>
                      </Paper>
                    ))
                  ) : (
                    <p> Aucun administrateur pour cette structure </p>
                  )
                ) : (
                  <Spinner />
                )}
              </div>
            </Paper>
          </div>
          <div style={style.divButton}>
            <Button variant="contained" onClick={() => setIsModalMail(false)}>
              Annuler
            </Button>
            <Button variant="contained" onClick={() => setIsModalMail(false)}>
              Envoyer
            </Button>
          </div>
        </Paper>
      </Fade>
    </Modal>
  );
};

AdminStructureMailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setIsModalMail: PropTypes.func.isRequired,
  choosenStructureMail: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default AdminStructureMailModal;
