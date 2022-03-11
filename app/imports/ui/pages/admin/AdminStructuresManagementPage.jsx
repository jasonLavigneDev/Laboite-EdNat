import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { _ } from 'meteor/underscore';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Card from '@material-ui/core/Card';
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
import AddBox from '@material-ui/icons/AddBox';
import Spinner from '../../components/system/Spinner';

import { useObjectState } from '../../utils/hooks';
import { getTree } from '../../../api/utils';
import Structures from '../../../api/structures/structures';
import AdminStructureSearchBar from '../../components/admin/AdminStructureSearchBar';
import AdminStructureTreeView from '../../components/admin/AdminStructureTreeView';
import CustomDialog from '../../components/system/CustomDialog';

import { useAppContext } from '../../contexts/context';

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

const useModalStyles = makeStyles(() => ({
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
  const [{ user }] = useAppContext();

  const isAppAdminMode = !path.startsWith('/admin/substructures');

  const [parentIds, setParentIds] = useState([]);

  /** For controlled tree view api */
  const [expandedIds, setExpandedIds] = useState([]);

  const [searchText, setSearchText] = useState('');
  const resetSearchText = () => setSearchText('');

  const [filteredFlatData, setFilteredFlatData] = useState([]);
  const { flatData, loading } = useTracker(() => {
    const structuresHandle = Meteor.subscribe('structures.top.with.childs', {
      parentIds: [user.structure, ...parentIds],
      searchText,
      isAppAdminMode,
    });
    const isLoading = !structuresHandle.ready();
    const structures = Structures.findFromPublication('structures.top.with.childs').fetch();

    /* Update the dom */
    setFilteredFlatData(structures);

    /* Expand ids if we have children to show */
    if (!isLoading)
      setExpandedIds(
        structures.reduce((accumulator, structure) => {
          if (structure.parentId) accumulator.push(structure.parentId);
          return accumulator;
        }, []),
      );

    return {
      loading: isLoading,
      flatData: structures,
    };
  }, [parentIds, searchText.length > 2 && searchText]);

  const resetFilter = () => {
    setFilteredFlatData(flatData);
    setExpandedIds([]);
  };

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
    const { _id } = selectedStructure;
    const { value: structureName } = e.target.structureName;

    if (isEditMode) {
      onEdit({ structureId: _id, name: structureName });
    } else {
      onCreate({
        updateParentIdsList,
        name: structureName,
        parentId: _id || null,
      });
    }

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
  };

  return (
    <>
      <Fade in timeout={{ enter: 200 }}>
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
              <Card>
                <CardHeader
                  title={i18n.__(
                    `pages.AdminStructuresManagementPage.treeView.${isEditMode ? 'editStructure' : 'createStructure'}`,
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
                  <CardActions className={modalClasses.actions}>
                    <Button onClick={closeModal}>
                      <Typography>{i18n.__('pages.AdminStructuresManagementPage.cancel')}</Typography>
                    </Button>

                    <Button type="submit" variant="contained" color="primary">
                      <Typography>{i18n.__('pages.AdminStructuresManagementPage.submit')}</Typography>
                    </Button>
                  </CardActions>
                </form>
              </Card>
            </Fade>
          </Modal>
          <CustomDialog
            nativeProps={{ maxWidth: 'xs' }}
            isOpen={isOpenDeleteConfirm}
            title={selectedStructure.name}
            content={i18n.__('pages.AdminStructuresManagementPage.treeView.confirm')}
            onCancel={() => setIsOpenDeleteConfirm(false)}
            onValidate={onDeleteConfirm}
          />
          <Card>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <CardHeader
                  title={i18n.__(
                    `pages.AdminStructuresManagementPage${!isAppAdminMode ? '.onlyStructureAdmin' : ''}.title`,
                  )}
                />
                <Typography color="textSecondary" style={{ paddingLeft: 16 }}>
                  {i18n.__('pages.AdminStructuresManagementPage.helpText')}
                </Typography>
              </Box>

              <AdminStructureSearchBar
                searchValue={searchText}
                setSearchText={setSearchText}
                resetSearchText={resetSearchText}
                resetFilter={resetFilter}
              />
            </Box>
            <CardContent>
              {isAppAdminMode && (
                <Box display="flex" alignItems="center">
                  <Box>
                    <Typography variant="h6" onClick={() => onClickAddBtn({})} style={{ cursor: 'pointer' }}>
                      {i18n.__('pages.AdminStructuresManagementPage.treeView.createStructure')}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      id="create-structure-btn"
                      onClick={() => onClickAddBtn({})}
                      title={i18n.__('pages.AdminStructuresManagementPage.treeView.createStructure')}
                    >
                      <AddBox />
                    </IconButton>
                  </Box>
                </Box>
              )}
              {loading && <Spinner full />}
              <AdminStructureTreeView
                treeData={getTree(filteredFlatData, isAppAdminMode ? null : user.structure)}
                onClickAddBtn={onClickAddBtn}
                onClickEditBtn={onClickEditBtn}
                onClickDeleteBtn={onClickDeleteBtn}
                setExpandedIds={setExpandedIds}
                updateParentIdsList={updateParentIdsList}
                expandedIds={expandedIds}
                isAppAdminMode={isAppAdminMode}
                selectedId=""
                onlySelect={false}
                onClickSelectBtn={() => {}}
              />
            </CardContent>
          </Card>
        </Container>
      </Fade>
    </>
  );
};

AdminStructureManagementPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};
export default AdminStructureManagementPage;
