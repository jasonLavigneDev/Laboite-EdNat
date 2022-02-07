import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';

import { useTracker } from 'meteor/react-meteor-data';

import Fade from '@material-ui/core/Fade';
import Backdrop from '@material-ui/core/Backdrop';
import Container from '@material-ui/core/Container';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import Spinner from '../../components/system/Spinner';

import { useObjectState } from '../../utils/hooks';
import { getTree } from '../../../api/utils';
import Structures from '../../../api/structures/structures';

const onCreate = ({ name, parentId }) => {
  Meteor.call('structures.createStructure', { name, parentId: parentId || null }, (error) => {
    if (error) {
      msg.error(error.reason || error.details[0].message);
    } else {
      msg.success(i18n.__('api.methods.operationSuccessMsg'));
    }
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
  const { treeData, loading } = useTracker(() => {
    const structuresHandle = Meteor.subscribe('structures.all');
    const isLoading = !structuresHandle.ready();
    const structures = Structures.find({}, { sort: { name: 1 } }).fetch();
    const data = getTree(structures);

    return {
      treeData: data,
      loading: isLoading,
    };
  });

  /** Modal utilities  */
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const setEditMode = () => setIsEditMode(true);
  const setCreateMode = () => setIsEditMode(false);

  const modalClasses = useModalStyles();

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
      onCreate({ name: structureName, parentId: _id === 'root' ? null : _id || null });
    }
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

  const onClickDeleteBtn = (nodes) => {
    if (
      /** Confirm is temporary */
      // eslint-disable-next-line no-restricted-globals
      confirm(i18n.__('pages.AdminStructuresManagementPage.treeView.confirm'))
    ) {
      onDelete({ structureId: nodes._id, name: nodes.name, parentId: nodes.parentId });
    }
  };

  const renderTree = (nodes) => {
    return (
      <TreeItem
        key={nodes._id}
        nodeId={nodes._id}
        label={
          <Box display="flex" p={1}>
            <Box flexGrow={1}>
              <p>{nodes.name}</p>
            </Box>
            <Box>
              <IconButton
                onClick={() => onClickAddBtn(nodes)}
                title={i18n.__('pages.AdminStructuresManagementPage.treeView.createStructure')}
              >
                <AddIcon />
              </IconButton>

              <IconButton
                onClick={() => onClickEditBtn(nodes)}
                title={i18n.__('pages.AdminStructuresManagementPage.treeView.editStructure')}
              >
                <EditIcon />
              </IconButton>

              <IconButton
                role="button"
                onClick={() => onClickDeleteBtn(nodes)}
                title={i18n.__('pages.AdminStructuresManagementPage.treeView.deleteStructure')}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        }
      >
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
      </TreeItem>
    );
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
              }}
            >
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
                    <form onSubmit={onSubmit}>
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
                      <Button type="submit" fullWidth color="primary">
                        Valider
                      </Button>
                    </form>
                  </div>
                </Fade>
              </Modal>
            </div>
            <TreeView
              aria-label={i18n.__('pages.AdminStructuresManagementPage.list')}
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{
                height: 110,
                flexGrow: 1,
                overflowY: 'auto',
              }}
            >
              {treeData.map(renderTree)}
            </TreeView>
          </Container>
        </Fade>
      )}
    </>
  );
};

export default AdminStructureManagementPage;
