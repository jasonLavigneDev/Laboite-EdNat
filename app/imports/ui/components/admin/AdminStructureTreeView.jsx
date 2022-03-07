import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AdminStructureTreeItem from './AdminStructureTreeItem';

const AdminStructureTreeView = ({
  treeData,
  onClickAddBtn,
  onClickEditBtn,
  onClickDeleteBtn,
  onClickSelectBtn,
  updateParentIdsList,
  setExpandedIds,
  expandedIds,
  onlySelect,
  selectedId,
}) => {
  return (
    <TreeView
      aria-label={i18n.__('pages.AdminStructuresManagementPage.list')}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{
        height: 110,
        flexGrow: 1,
        overflowY: 'auto',
      }}
      expanded={expandedIds}
      onNodeToggle={(event, nodesIds) => {
        setExpandedIds(nodesIds);
      }}
      selected={selectedId}
    >
      {treeData.map((nodes) => (
        <AdminStructureTreeItem
          key={nodes._id}
          nodes={nodes}
          onClickAddBtn={onClickAddBtn}
          onClickEditBtn={onClickEditBtn}
          onClickDeleteBtn={onClickDeleteBtn}
          onClickSelectBtn={onClickSelectBtn}
          updateParentIdsList={updateParentIdsList}
          onlySelect={onlySelect}
          selectedId={selectedId}
        />
      ))}
    </TreeView>
  );
};

const nodesShape = {
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};
nodesShape.children = PropTypes.arrayOf(PropTypes.shape(nodesShape));

AdminStructureTreeView.propTypes = {
  treeData: PropTypes.arrayOf(PropTypes.shape(nodesShape)).isRequired,
  onClickAddBtn: PropTypes.func.isRequired,
  onClickEditBtn: PropTypes.func.isRequired,
  onClickDeleteBtn: PropTypes.func.isRequired,
  updateParentIdsList: PropTypes.func.isRequired,
  expandedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  setExpandedIds: PropTypes.func.isRequired,
  onClickSelectBtn: PropTypes.func.isRequired,
  onlySelect: PropTypes.bool.isRequired,
  selectedId: PropTypes.string.isRequired,
};

export default AdminStructureTreeView;
