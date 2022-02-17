import React from 'react';
import i18n from 'meteor/universe:i18n';

import TreeItem from '@material-ui/lab/TreeItem';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import AddBox from '@material-ui/icons/AddBox';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import { withStyles, alpha, makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

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
  const { _id: id, name, children, childrenIds } = nodes;
  const classes = useStyles();
  const hasChildren = childrenIds.length > 0;
  return (
    <StyledTreeItem
      key={id}
      nodeId={id}
      onLabelClick={() => hasChildren && updateParentIdsList({ ids: [id] })}
      onIconClick={() => hasChildren && updateParentIdsList({ ids: [id] })}
      label={
        <Box display="flex">
          <Box flexGrow={1} className={classes.name}>
            <div>
              <Typography>{name}</Typography>
            </div>
          </Box>
          <Box>
            <Tooltip title={i18n.__('pages.AdminStructuresManagementPage.treeView.createStructure')}>
              <span>
                <IconButton onClick={() => onClickAddBtn(nodes)}>
                  <AddBox />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={i18n.__('pages.AdminStructuresManagementPage.treeView.editStructure')}>
              <span>
                <IconButton onClick={() => onClickEditBtn(nodes)}>
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={i18n.__(
                `pages.AdminStructuresManagementPage.treeView.${
                  hasChildren ? 'canNotDeleteBecauseChildren' : 'deleteStructure'
                }`,
              )}
            >
              <span>
                <IconButton disabled={hasChildren} role="button" onClick={() => onClickDeleteBtn(nodes)}>
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      }
    >
      {Array.isArray(children) ? (
        children.map((node) => (
          <AdminStructureTreeItem
            key={node._id}
            nodes={node}
            onClickAddBtn={onClickAddBtn}
            onClickEditBtn={onClickEditBtn}
            onClickDeleteBtn={onClickDeleteBtn}
            updateParentIdsList={updateParentIdsList}
          />
        ))
      ) : hasChildren ? (
        <span>&nbsp;</span>
      ) : null}
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
