import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Checkbox from '@mui/material/Checkbox';
import Spinner from '../../components/system/Spinner';
import { CustomToolbarArticle } from '../../components/system/CustomQuill';
import { quillOptions } from '../../components/admin/InfoEditionComponent';
import { useStructure, useAdminSelectedStructure } from '../../../api/structures/hooks';

const AdminMailsDiffusion = () => {
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
      flexGrow: 1,
      flexDirection: 'column',
      padding: 1,
      gap: 1,
    },
    paperList: {
      height: '10vh',
      width: '100%',
      display: 'flex',
    },
  };

  return loading ? (
    <Spinner />
  ) : (
    <div>
      <h1>Diffusion de mail</h1>
      <Paper sx={style.paper}>
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4>Prénom ADMIN</h4>
              <p>adresse@adresse.fr</p>
            </div>
          </Paper>
          <Paper sx={style.paperList}>
            <h4>Prénom ADMIN</h4>
            <p>adresse@adresse.fr</p>
          </Paper>
        </Paper>
      </Paper>
      <ButtonGroup sx={{ display: 'flex' }}>
        <Button>no</Button>
        <Button>yes</Button>
      </ButtonGroup>
    </div>
  );
};

export default AdminMailsDiffusion;
