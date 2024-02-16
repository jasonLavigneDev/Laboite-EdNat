import React, { useEffect, useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Card from '@mui/material/Card';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import { makeStyles } from 'tss-react/mui';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import TreeItem from '@mui/lab/TreeItem';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import AddBox from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { alpha } from '@mui/material/styles';
import { withStyles } from 'tss-react/mui';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import CustomDialog from '../../components/system/CustomDialog';

import Spinner from '../../components/system/Spinner';
import { useObjectState } from '../../utils/hooks';
import { getTree } from '../../../api/utils';
import Structures from '../../../api/structures/structures';
import AdminStructureSearchBar from '../../components/admin/AdminStructureSearchBar';
import AdminStructureTreeView from '../../components/admin/AdminStructureTreeView';

import { useAppContext } from '../../contexts/context';
import AdminStructureMailModal from '../../components/admin/AdminStructureMailModal';

const onCreate = ({ name, parentId, updateParentIdsList }) => {
  Meteor.call('structures.createStructure', { name, parentId: parentId || null }, (error, success) => {
    if (error) {
      msg.error(error.reason || error.details[0].message);
    }
    if (success) {
      msg.success(i18n.__('api.methods.operationSuccessMsg'));
      updateParentIdsList({ ids: [parentId] });
    }
  });
};

const onEdit = ({ structureId, name }) => {
  Meteor.call('structures.updateStructure', { structureId, name }, (error) => {
    if (error) {
      msg.error(error.reason || error.details[0].message);
    } else {
      msg.success(i18n.__('api.methods.operationSuccessMsg'));
    }
  });
};

const onDelete = ({ structureId }) => {
  Meteor.call('structures.removeStructure', { structureId }, (error) => {
    if (error) {
      msg.error(error.reason || error.details[0].message);
    } else {
      msg.success(i18n.__('api.methods.operationSuccessMsg'));
    }
  });
};

export const useModalStyles = makeStyles()(() => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

const AdminStructureManagementPage = ({ match: { path } }) => {
  const [{ user, structure: currentUserStructure }] = useAppContext();

  const isAdminStructureMode = path.startsWith('/admin/substructures');

  const [parentIds, setParentIds] = useState([]);

  /** For controlled tree view api */
  const [expandedIds, setExpandedIds] = useState([]);

  const [searchText, setSearchText] = useState('');

  /** Modal utilities  */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openMailModal = () => setIsMailModalOpen(true);
  const closeMailModal = () => setIsMailModalOpen(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const setEditMode = () => setIsEditMode(true);
  const setCreateMode = () => setIsEditMode(false);

  const { classes: modalClasses } = useModalStyles();

  const updateParentIdsList = ({ ids }) => {
    const uniqueList = [...new Set([...parentIds, ...ids])];
    if (_.isEqual(parentIds.sort(), uniqueList.sort())) return;
    if (!isEditMode) setExpandedIds([...expandedIds, ...ids]);
    setParentIds(uniqueList);
  };

  /**
   * SelectedStructure is a context
   * It is the parentStructure when you are in create mode
   * It is the want-to-update one when you are in edit mode
   */

  const initialStructure = { name: '', id: '', _id: '', childrenIds: [], ancestorsIds: [], parentId: null };

  const [selectedStructure, setSelectedStructure] = useObjectState(initialStructure);

  const onSubmit = (e) => {
    e.preventDefault();
    const { _id } = selectedStructure;
    const { value: structureName } = e.target.structureName;

    if (isEditMode) {
      onEdit({ structureId: _id, name: structureName.trim() });
    } else {
      onCreate({
        updateParentIdsList,
        name: structureName.trim(),
        parentId: _id || null,
      });
    }

    setSelectedStructure(initialStructure);
    closeModal();
  };

  const onClickAddBtn = (nodes) => {
    openModal();
    setCreateMode();
    setSelectedStructure({ ...nodes, name: '' });
  };

  const onClickEditBtn = (nodes) => {
    openModal();
    setEditMode();
    setSelectedStructure(nodes);
  };

  const [isOpenDeleteConfirm, setIsOpenDeleteConfirm] = useState(false);

  const onClickDeleteBtn = (nodes) => {
    setSelectedStructure(nodes);
    setIsOpenDeleteConfirm(true);
  };

  const onDeleteConfirm = () => {
    onDelete({
      structureId: selectedStructure._id,
      name: selectedStructure.name,
      parentId: selectedStructure.parentId,
    });
    setIsOpenDeleteConfirm(false);
    setSelectedStructure(initialStructure);
  };

  const onClickMailBtn = (nodes) => {
    setSelectedStructure(nodes);
    openMailModal();
  };

  const [structures, setStructures] = useState([]);
  const [searchTree, setSearchTree] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [treeMode, setTreeMode] = useState(false);

  useEffect(() => {
    Meteor.call('structures.getTopLevelStructures', (err, res) => {
      if (res) {
        setStructures(res);
      }
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const resetSearch = () => {
    setSearchMode(false);
    setTreeMode(false);
    setSearchTree([]);
  };

  const triggerSearch = () => {
    resetSearch();
    setLoading(true);
    Meteor.call('structures.searchStructure', { searchText }, (err, res) => {
      if (res) {
        setSearchMode(true);
        setTreeMode(false);
        setSearchTree(res);
        setLoading(false);
      }
    });
  };

  const searchStructure = (structureId) => {
    resetSearch();
    setLoading(true);
    Meteor.call('structures.searchStructureById', { structureId }, (err, res) => {
      if (res) {
        setSearchMode(true);
        setTreeMode(false);
        setSearchTree(res);
        setLoading(false);
      }
    });
  };

  const getChildsOfStructure = (struc) => {
    resetSearch();
    setLoading(true);
    Meteor.call('structures.getTreeOfStructure', { structureId: struc._id }, (err, res) => {
      if (res) {
        setTreeMode(true);
        setSearchMode(false);
        setSearchTree(res);
        setLoading(false);
      }
    });
  };

  const hasChildren = (struc) => {
    return struc.childrenIds && struc.childrenIds.length > 0;
  };

  return (
    <Fade in timeout={{ enter: 200 }}>
      <Container style={{ overflowX: 'auto' }}>
        <Modal className={modalClasses.modal} open={isModalOpen} onClose={closeModal} closeAfterTransition>
          <Fade in={isModalOpen}>
            <Card>
              <CardHeader
                title={i18n.__(
                  `components.AdminStructureTreeItem.actions.${isEditMode ? 'editStructure' : 'addStructure'}`,
                )}
                action={
                  <IconButton
                    title={i18n.__('pages.AdminStructuresManagementPage.modal.close')}
                    onClick={closeModal}
                    size="large"
                  >
                    <ClearIcon />
                  </IconButton>
                }
              />
              <form onSubmit={onSubmit}>
                <CardContent>
                  <TextField
                    label={i18n.__('pages.AdminStructuresManagementPage.columnName')}
                    value={selectedStructure.name}
                    name="structureName"
                    fullWidth
                    onChange={(e) => {
                      setSelectedStructure({ name: e.target.value });
                    }}
                    autoFocus
                  />
                </CardContent>
                <CardActions className={modalClasses.actions}>
                  <Button onClick={closeModal}>
                    <Typography>{i18n.__('pages.AdminStructuresManagementPage.modal.cancel')}</Typography>
                  </Button>

                  <Button type="submit" variant="contained" color="primary">
                    <Typography>{i18n.__('pages.AdminStructuresManagementPage.modal.submit')}</Typography>
                  </Button>
                </CardActions>
              </form>
            </Card>
          </Fade>
        </Modal>
        {isMailModalOpen && (
          <AdminStructureMailModal
            open={isMailModalOpen}
            onClose={closeMailModal}
            setIsModalMail={setIsMailModalOpen}
            choosenStructureMail={selectedStructure}
          />
        )}
        <CustomDialog
          nativeProps={{ maxWidth: 'xs' }}
          isOpen={isOpenDeleteConfirm}
          title={selectedStructure.name}
          content={i18n.__('components.AdminStructureTreeItem.actions.deleteStructureConfirm')}
          onCancel={() => setIsOpenDeleteConfirm(false)}
          onValidate={onDeleteConfirm}
        />
        <Card>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <CardHeader
                title={i18n.__(
                  `pages.AdminStructuresManagementPage${isAdminStructureMode ? '.adminStructureMode' : ''}.title`,
                )}
              />
              <Typography color="textSecondary" style={{ paddingLeft: 16 }}>
                {i18n.__('pages.AdminStructuresManagementPage.helpText')}
              </Typography>
            </Box>
          </Box>
          <CardContent>
            {currentUserStructure && (
              <Box>
                <Typography>
                  {`${i18n.__('components.AdminStructureTreeView.isPartOf')}: `}
                  <span>{currentUserStructure.name}</span>
                </Typography>
              </Box>
            )}
            <Box display="flex" alignItems="center">
              <Box>
                <Typography
                  variant="h6"
                  onClick={() => onClickAddBtn(isAdminStructureMode ? currentUserStructure : {})}
                  style={{ cursor: 'pointer' }}
                >
                  {i18n.__('components.AdminStructureTreeItem.actions.addStructure')}
                </Typography>
              </Box>
              <Box>
                <IconButton
                  id="create-structure-btn"
                  onClick={() => onClickAddBtn(isAdminStructureMode ? currentUserStructure : {})}
                  title={i18n.__('components.AdminStructureTreeItem.actions.addStructure')}
                  size="large"
                >
                  <AddBox />
                </IconButton>
              </Box>
            </Box>
            {loading && <Spinner />}
          </CardContent>
          <TextField label="Recherche" value={searchText} onChange={(e) => setSearchText(e.target.value)}>
            Chercher une structure
          </TextField>
          <Button onClick={(e) => triggerSearch(e)}>Chercher</Button>
          <Button onClick={(e) => resetSearch(e)}>Reset</Button>

          {!searchMode && !treeMode ? (
            <div>
              {structures
                ? structures.map((struc) => (
                    <div onClick={(e) => getChildsOfStructure(struc)}>
                      <p>{struc.name}</p>
                    </div>
                  ))
                : null}
            </div>
          ) : null}

          {searchMode ? (
            <div>
              {searchTree
                ? searchTree.map((struc) => (
                    <div>
                      <div style={{ display: 'flex' }}>
                        <p>- {struc.name}</p>
                        {onClickMailBtn && (
                          <Tooltip title={i18n.__('components.AdminStructureTreeItem.actions.sendEmailToAdmins')}>
                            <span>
                              <IconButton onClick={() => onClickMailBtn(struc)} size="large">
                                <ContactMailIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {onClickAddBtn && (
                          <Tooltip title={i18n.__('components.AdminStructureTreeItem.actions.addStructure')}>
                            <span>
                              <IconButton onClick={() => onClickAddBtn(struc)} size="large">
                                <AddBox />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {onClickEditBtn && (
                          <Tooltip title={i18n.__('components.AdminStructureTreeItem.actions.editStructure')}>
                            <span>
                              <IconButton onClick={() => onClickEditBtn(struc)} size="large">
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}

                        {onClickDeleteBtn && (
                          <Tooltip
                            title={i18n.__(
                              `components.AdminStructureTreeItem.actions.deleteStructure${
                                hasChildren(struc) ? 'ImpossibleHasChildren' : ''
                              }`,
                            )}
                          >
                            <span>
                              <IconButton
                                disabled={hasChildren(struc)}
                                role="button"
                                onClick={() => onClickDeleteBtn(struc)}
                                size="large"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        <br />
                        {struc.structurePath && struc.structurePath.length > 0
                          ? struc.structurePath.map((pathStruc) => (
                              <div style={{ display: 'flex' }}>
                                <p onClick={(e) => searchStructure(pathStruc.structureId)}>
                                  <i>{pathStruc.structureName}</i>
                                </p>
                              </div>
                            ))
                          : null}
                      </div>
                    </div>
                  ))
                : null}
            </div>
          ) : null}

          {treeMode ? (
            <div>
              {searchTree ? searchTree.map((struc) => <p>{struc.structure.name}</p>) : <p>Pas de structures enfants</p>}
            </div>
          ) : null}
        </Card>
      </Container>
    </Fade>
  );
};

AdminStructureManagementPage.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default AdminStructureManagementPage;
