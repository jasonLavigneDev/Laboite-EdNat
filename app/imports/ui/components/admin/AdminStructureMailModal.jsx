import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';

import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';

import Spinner from '../system/Spinner';
import { CustomToolbarArticle } from '../system/CustomQuill';
import { quillOptions } from './InfoEditionComponent';

const AdminStructureMailModal = ({ setIsModalMail, choosenStructureMail }) => {
  const [content, setContent] = useState();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  useEffect(() => {
    if (choosenStructureMail) {
      if (loading) {
        Meteor.call(
          'users.getAdminsFromStructure',
          { structure: choosenStructureMail._id, subStructure: false },
          (error, result) => {
            if (result) {
              if (result.length > 0) {
                setUsers(result);
                setLoading(false);
              } else {
                setIsModalMail(false);
              }
            } else {
              setIsModalMail(false);
            }
          },
        );
      }
    }
  }, []);

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
      padding: 1,
      gap: 1,
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

  return loading ? (
    <Spinner />
  ) : (
    <div>
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
          <Paper sx={{ ...style.paper, ...style.paperContainerList }}>
            {users && users.length > 0 && !loading
              ? users.map((user) => (
                  <Paper sx={style.paperList}>
                    <Checkbox />
                    <div style={style.divText}>
                      <span style={{ textOverflow: 'ellipsis' }}>
                        {user.firstName} {user.lastName}
                      </span>
                      <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {choosenStructureMail.name}
                      </span>
                    </div>
                  </Paper>
                ))
              : null}
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
    </div>
  );
};

AdminStructureMailModal.propTypes = {
  setIsModalMail: PropTypes.func.isRequired,
  choosenStructureMail: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default AdminStructureMailModal;
