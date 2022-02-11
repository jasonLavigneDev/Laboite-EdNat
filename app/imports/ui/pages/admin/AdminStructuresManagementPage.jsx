import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Card from '@material-ui/core/Card';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';
import Container from '@material-ui/core/Container';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import Spinner from '../../components/system/Spinner';

import { useObjectState } from '../../utils/hooks';
import { getTree } from '../../../api/utils';
import Structures from '../../../api/structures/structures';
import AdminStructureSearchBar from '../../components/admin/AdminStructureSearchBar';
import AdminStructureTreeView from '../../components/admin/AdminStructureTreeView';

const onCreate = ({ name, parentId, updateParentIdsList }) => {
  Meteor.call('structures.createStructure', { name, parentId: parentId || null }, (error, success) => {
    if (error) {
      msg.error(error.reason || error.details[0].message);
    }
    msg.success(i18n.__('api.methods.operationSuccessMsg'));
    if (success) updateParentIdsList({ ids: [parentId] });
  });
};

const onEdit = ({ structureId, name, parentId }) => {
  Meteor.call('structures.updateStructure', { structureId, name, parentId }, (error) => {
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

const useModalStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4, 3),
  },
}));

const AdminStructureManagementPage = () => {
  const [parentIds, setParentIds] = useState([]);

  /** For controlled tree view api */
  const [expandedIds, setExpandedIds] = useState([]);

  const [filteredFlatData, setFilteredFlatData] = useState([]);
  const { flatData, loading } = useTracker(() => {
    const structuresHandle = Meteor.subscribe('structures.top.with.childs', { parentIds });
    const isLoading = !structuresHandle.ready();
    const structures = Structures.find(
      {
        $or: [{ parentId: null }, { parentId: { $in: parentIds } }],
      },
      { sort: { name: 1 } },
    ).fetch();
    setFilteredFlatData(structures);
    return {
      loading: isLoading,
      flatData: structures,
    };
  }, [parentIds]);

  /** Modal utilities  */
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const setEditMode = () => setIsEditMode(true);
  const setCreateMode = () => setIsEditMode(false);

  const modalClasses = useModalStyles();

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
  const [selectedStructure, setSelectedStructure] = useObjectState({ name: '', id: '', children: [], parentId: null });

  const onSubmit = (e) => {
    e.preventDefault();
    const { _id, parentId } = selectedStructure;
    const { value: structureName } = e.target.structureName;

    if (isEditMode) {
      onEdit({ structureId: _id, parentId: parentId || null, name: structureName });
    } else {
      onCreate({
        updateParentIdsList,
        name: structureName,
        parentId: _id === 'root' ? null : _id || null,
      });
    }

    closeModal();
  };

  const onClickAddBtn = (nodes) => {
    openModal();
    setCreateMode();
    setSelectedStructure(nodes);
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
  };

  const [searchText, setSearchText] = useState('');
  const resetSearchText = () => setSearchText('');
  const resetFilter = () => {
    setFilteredFlatData(flatData);
  };
  const requestFilter = (filterValue) => {
    if (searchText.length < 1) return resetFilter();
    const data = flatData.filter((struct) => struct.name.toLowerCase().includes(filterValue.toLowerCase()));
    return setFilteredFlatData(data);
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <Modal
              className={modalClasses.modal}
              open={isModalOpen}
              onClose={closeModal}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={isModalOpen}>
                <div className={modalClasses.paper}>
                  <Card>
                    <CardHeader
                      title={i18n.__(
                        `pages.AdminStructuresManagementPage.treeView.${
                          isEditMode ? 'editStructure' : 'createStructure'
                        }`,
                      )}
                      action={
                        <IconButton title={i18n.__('pages.AdminStructuresManagementPage.close')} onClick={closeModal}>
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
                      <CardActions>
                        <Button onClick={closeModal}>
                          <Typography>{i18n.__('pages.AdminStructuresManagementPage.cancel')}</Typography>
                        </Button>

                        <Button type="submit" variant="contained" color="primary">
                          <Typography>{i18n.__('pages.AdminStructuresManagementPage.submit')}</Typography>
                        </Button>
                      </CardActions>
                    </form>
                  </Card>
                </div>
              </Fade>
            </Modal>
            <Dialog maxWidth="xs" open={isOpenDeleteConfirm}>
              <DialogTitle>{selectedStructure.name}</DialogTitle>
              <DialogContent>
                <Typography>{i18n.__('pages.AdminStructuresManagementPage.treeView.confirm')}</Typography>
              </DialogContent>
              <DialogActions>
                <Button autoFocus onClick={() => setIsOpenDeleteConfirm(false)}>
                  <Typography>{i18n.__('pages.AdminStructuresManagementPage.cancel')}</Typography>
                </Button>
                <Button onClick={onDeleteConfirm} variant="contained" color="primary">
                  <Typography>{i18n.__('pages.AdminStructuresManagementPage.submit')}</Typography>
                </Button>
              </DialogActions>
            </Dialog>
            <Card>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <CardHeader title={i18n.__('pages.AdminStructuresManagementPage.title')} />
                  <Typography color="textSecondary" style={{ paddingLeft: 16 }}>
                    {i18n.__('pages.AdminStructuresManagementPage.helpText')}
                  </Typography>
                </Box>

                {AdminStructureSearchBar({
                  searchValue: searchText,
                  setSearchText,
                  requestFilter,
                  resetSearchText,
                  resetFilter,
                })}
              </Box>
              <CardContent>
                <AdminStructureTreeView
                  treeData={getTree(filteredFlatData)}
                  onClickAddBtn={onClickAddBtn}
                  onClickEditBtn={onClickEditBtn}
                  onClickDeleteBtn={onClickDeleteBtn}
                  setExpandedIds={setExpandedIds}
                  updateParentIdsList={updateParentIdsList}
                  expandedIds={expandedIds}
                />
              </CardContent>
            </Card>
          </Container>
        </Fade>
      )}
    </>
  );
};

export default AdminStructureManagementPage;
