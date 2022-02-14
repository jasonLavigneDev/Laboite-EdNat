import React from 'react';
import i18n from 'meteor/universe:i18n';

import TreeItem from '@material-ui/lab/TreeItem';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { withStyles, alpha, makeStyles } from '@material-ui/core/styles';

const StyledTreeItem = withStyles((theme) => ({
  iconContainer: {
    '& .close': {
      opacity: 0.3,
    },
  },
  group: {
    marginLeft: 10,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}))((props) => <TreeItem {...props} />);

const useStyles = makeStyles(() => ({
  name: {
    alignItems: 'center',
    display: 'flex',
  },
}));

const AdminStructureTreeItem = ({ nodes, onClickAddBtn, onClickEditBtn, onClickDeleteBtn, updateParentIdsList }) => {
  const { _id: id, name, children } = nodes;
  const classes = useStyles();
  return (
    <StyledTreeItem
      key={id}
      nodeId={id}
      label={
        <Box display="flex">
          <Box flexGrow={1} className={classes.name} onClick={() => updateParentIdsList({ ids: [id] })}>
            <div>{name}</div>
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
      {Array.isArray(children)
        ? children.map((node) => (
            <AdminStructureTreeItem
              key={node._id}
              nodes={node}
              onClickAddBtn={onClickAddBtn}
              onClickEditBtn={onClickEditBtn}
              onClickDeleteBtn={onClickDeleteBtn}
              updateParentIdsList={updateParentIdsList}
            />
          ))
        : null}
    </StyledTreeItem>
  );
};

AdminStructureTreeItem.propTypes = {
  nodes: PropTypes.objectOf(PropTypes.any).isRequired,
  onClickAddBtn: PropTypes.func.isRequired,
  onClickEditBtn: PropTypes.func.isRequired,
  onClickDeleteBtn: PropTypes.func.isRequired,
  updateParentIdsList: PropTypes.func.isRequired,
};
export default AdminStructureTreeItem;
