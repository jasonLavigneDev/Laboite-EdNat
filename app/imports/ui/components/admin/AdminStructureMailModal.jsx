import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';

import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';

import Spinner from '../system/Spinner';
import { CustomToolbarArticle } from '../system/CustomQuill';
import { quillOptions } from './InfoEditionComponent';
import { useStructure, useAdminSelectedStructure } from '../../../api/structures/hooks';

const AdminStructureMailModal = ({ setIsModalMail, choosenStructureMail }) => {
  const userStructure = useStructure();
  const [content, setContent] = useState();

  const [selectedStructureId, setSelectedStructureId] = useState(
    userStructure && userStructure._id ? userStructure._id : '',
  );

  const { loading } = useAdminSelectedStructure({
    selectedStructureId,
    setSelectedStructureId,
  });

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
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
            <Paper sx={style.paperList}>
              <Checkbox />
              <div style={style.divText}>
                <span style={{ textOverflow: 'ellipsis' }}>Prénom ADMIN</span>
                <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {choosenStructureMail.name}
                </span>
              </div>
            </Paper>
            <Paper sx={style.paperList}>
              <Checkbox />
              <div style={style.divText}>
                <span>Prénom ADMIN</span>
                <span>adresse@adresse.fr</span>
              </div>
            </Paper>
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
