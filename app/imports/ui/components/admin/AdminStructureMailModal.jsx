import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { toast } from 'react-toastify';

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
    padding: '1vh 1vw',
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
  spanOverflow: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  subTitleh3: {
    paddingLeft: '2.5vw',
    margin: 0,
  },
};

const AdminStructureMailModal = ({ open, onClose, setIsModalMail, choosenStructureMail }) => {
  const [content, setContent] = useState('');
  const [{ user }] = useAppContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subStructure, setSubStructure] = useState(true);
  const [structures, setStructures] = useState([]);
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
          { structureId: choosenStructureMail._id, subStructure },
          (error, result) => {
            if (result) {
              setUsers(result.users);
              setStructures(result.structures);
              // Fill selected Users tab because checkbox are default checked
              setSelectedUsers(result.users);
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

  const SendMailToUsers = () => {
    if (selectedUsers && selectedUsers.length > 0) {
      const mailList = selectedUsers.map((admin) => admin.emails[0].address);
      Meteor.call(
        'smtp.sendMailToDiffusionList',
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emails[0].address,
          text: content,
          mailList,
        },
        (res, err) => {
          if (err) {
            toast.error(i18n.__('pages.AdminStructureMailModal.errorSendingMail'));
          }
        },
      );
      setIsModalMail(false);
    } else {
      toast.error(i18n.__('pages.AdminStructureMailModal.noAdminSelected'));
    }
  };

  const handleCheckboxChange = (admin) => {
    const isAlreadySelected = selectedUsers.some((adm) => adm._id === admin._id);
    if (isAlreadySelected) {
      setSelectedUsers(selectedUsers.filter((adm) => adm._id !== admin._id));
    } else {
      setSelectedUsers([...selectedUsers, admin]);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Fade in={open}>
        <Paper sx={style.paper}>
          <div style={style.divContainer}>
            <Paper sx={{ ...style.paper, ...style.paperMessage }}>
              <h1>{findStructureOfUser(choosenStructureMail._id)}</h1>
              <h3 style={style.subTitleh3}>{i18n.__('pages.AdminStructureMailModal.subtitle')}</h3>
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
                    label={i18n.__('pages.AdminStructureMailModal.SwitchAdminVisibility')}
                  />
                </FormControl>
                {!loading ? (
                  users && users.length > 0 ? (
                    users.map((admin) => (
                      <Paper sx={style.paperList}>
                        <Checkbox defaultChecked onChange={() => handleCheckboxChange(admin)} />
                        <div style={style.divText}>
                          <span style={style.spanOverflow}>
                            {admin.firstName} {admin.lastName}
                          </span>
                          <span style={style.spanOverflow}>{findStructureOfUser(admin.structure)}</span>
                        </div>
                      </Paper>
                    ))
                  ) : (
                    <p> {i18n.__('pages.AdminStructureMailModal.noAdmin')} </p>
                  )
                ) : (
                  <Spinner />
                )}
              </div>
            </Paper>
          </div>
          <div style={style.divButton}>
            <Button variant="contained" onClick={() => setIsModalMail(false)}>
              {i18n.__('pages.AdminStructuresManagementPage.modal.close')}
            </Button>
            <Button variant="contained" onClick={() => SendMailToUsers()} disabled={selectedUsers.length === 0}>
              {i18n.__('pages.AdminStructuresManagementPage.modal.submitMail')}
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
