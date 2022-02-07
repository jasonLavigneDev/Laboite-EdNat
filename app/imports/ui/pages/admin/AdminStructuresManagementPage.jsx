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
      treeData: { _id: 'root', name: 'Gestion des structures', children: data },
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
      confirm(
        `Supprimer cette structure aura pour effet de supprimer tout ses enfants,
               êtes-vous sûr de vouloir continuer ?`,
      )
    )
      onDelete({ structureId: nodes._id, name: nodes.name, parentId: nodes.parentId });
  };

  const renderTree = (nodes) => {
    return (
      <div className="treeViewCustom" key={nodes._id}>
        <TreeItem key={nodes._id} nodeId={nodes._id} label={nodes.name} style={{ width: '90%' }}>
          <IconButton onClick={() => onClickAddBtn(nodes)} title="Créer une nouvelle structure">
            <AddIcon />
          </IconButton>
          {nodes._id !== 'root' && (
            <IconButton onClick={() => onClickEditBtn(nodes)} title={`Editer la structure ${nodes.name}`}>
              <EditIcon />
            </IconButton>
          )}
          {nodes._id !== 'root' && (
            <IconButton
              role="button"
              onClick={() => onClickDeleteBtn(nodes)}
              title={`Supprimer la structure ${nodes.name}`}
            >
              <DeleteIcon />
            </IconButton>
          )}
          {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
      </div>
    );
  };

  const modal = () => (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
      }}
    >
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
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
                label="Nom de la structure"
                value={selectedStructure.name}
                name="structureName"
                fullWidth
                onChange={(e) => {
                  setSelectedStructure({ name: e.target.value });
                }}
                autoFocus
              />
              <Button type="submit" fullWidth color="primary">
                {isEditMode ? 'Editer la structure' : 'Créer la nouvelle structure'}
              </Button>
            </form>
          </div>
        </Fade>
      </Modal>
    </div>
  );

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
<<<<<<< HEAD
            {modal()}
            <TreeView
              aria-label="rich object !"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpanded={['root']}
              defaultExpandIcon={<ChevronRightIcon />}
              sx={{
                height: 110,
                flexGrow: 1,
                overflowY: 'auto',
              }}
            >
              {renderTree(treeData)}
            </TreeView>
=======
            <MaterialTable
              title={`${i18n.__('pages.AdminStructuresManagementPage.title')} (${structures.length})`}
              columns={columns}
              data={structures.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminStructuresManagementPage')}
              editable={{ onRowAdd, onRowUpdate, onRowDelete }}
            />
>>>>>>> d67ab4d... fix(ui): add structures count in admin strucutres page
          </Container>
        </Fade>
      )}
    </>
  );
};

export default AdminStructureManagementPage;
