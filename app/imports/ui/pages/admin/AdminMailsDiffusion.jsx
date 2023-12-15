import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Checkbox from '@mui/material/Checkbox';
import { CustomToolbarArticle } from '../../components/system/CustomQuill';
import { quillOptions } from '../../components/admin/InfoEditionComponent';
import { useAppContext } from '../../contexts/appContext';

const AdminMailsDiffusion = () => {
  const [content, setContent] = useState();
  const [users, setUsers] = useState([]);
  const [{ user }] = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (loading) {
        Meteor.call('users.getAdminsFromStructure', { structure: user.structure }, (error, result) => {
          if (result) {
            if (result.length > 0) {
              setUsers(result);
              setLoading(false);
            }
          }
        });
      }
    }
  }, []);

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

  return (
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
          {users && !loading
            ? users.map((admin) => (
                <Paper sx={style.paperList}>
                  <Checkbox />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4>
                      <img
                        height="50px"
                        width="50px"
                        style={{ borderRadius: '20px' }}
                        src={admin.avatar}
                        alt="mabite"
                      />
                      {admin.firstName} {admin.lastName}
                      <br />
                      {admin.emails[0].address}
                    </h4>
                  </div>
                </Paper>
              ))
            : null}
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
