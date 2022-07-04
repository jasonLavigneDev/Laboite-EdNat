import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';

import TreeItem from '@material-ui/lab/TreeItem';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import AddBox from '@material-ui/icons/AddBox';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import EditIcon from '@material-ui/icons/Edit';
import { withStyles, alpha, makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CustomDialog from '../system/CustomDialog';

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
  space: {
    padding: '12px',
  },
}));

const AdminStructureTreeItem = ({
  nodes,
  onClickAddBtn,
  onClickEditBtn,
  onClickDeleteBtn,
  onClickSelectBtn,
  updateParentIdsList,
  selectedId,
}) => {
  const { _id: id, name, children, childrenIds } = nodes;
  const classes = useStyles();
  const hasChildren = childrenIds.length > 0;

  const [choosenStructure, setChoosenStructure] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const openConfirm = () => setIsConfirmOpen(true);
  const closeConfirm = () => setIsConfirmOpen(false);
  const onCloseConfirm = () => {
    if (choosenStructure) onClickSelectBtn(choosenStructure);
    closeConfirm();
  };

  return (
    <>
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
              {onClickAddBtn && (
                <Tooltip title={i18n.__('components.AdminStructureTreeItem.actions.addStructure')}>
                  <span>
                    <IconButton onClick={() => onClickAddBtn(nodes)}>
                      <AddBox />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {onClickEditBtn && (
                <Tooltip title={i18n.__('components.AdminStructureTreeItem.actions.editStructure')}>
                  <span>
                    <IconButton onClick={() => onClickEditBtn(nodes)}>
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}

              {onClickDeleteBtn && (
                <Tooltip
                  title={i18n.__(
                    `components.AdminStructureTreeItem.actions.deleteStructure${
                      hasChildren ? 'ImpossibleHasChildren' : ''
                    }`,
                  )}
                >
                  <span>
                    <IconButton disabled={hasChildren} role="button" onClick={() => onClickDeleteBtn(nodes)}>
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {onClickSelectBtn && (
                <Tooltip title={i18n.__('components.AdminStructureTreeItem.actions.choose')}>
                  <span>
                    <IconButton
                      onClick={() => {
                        setChoosenStructure(nodes);
                        openConfirm();
                      }}
                    >
                      {selectedId === id ? <CheckCircleOutlineIcon color="primary" /> : <CheckIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
              )}
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
              onClickSelectBtn={onClickSelectBtn}
              updateParentIdsList={updateParentIdsList}
              selectedId={selectedId}
            />
          ))
        ) : hasChildren ? (
          <span>&nbsp;</span>
        ) : null}
      </StyledTreeItem>

      <CustomDialog
        nativeProps={{ maxWidth: 'xs' }}
        isOpen={isConfirmOpen}
        title={(choosenStructure && choosenStructure.name) || ''}
        content={i18n.__('components.AdminStructureTreeItem.attachToStructure')}
        onCancel={closeConfirm}
        onValidate={onCloseConfirm}
      />
    </>
  );
};

AdminStructureTreeItem.propTypes = {
  nodes: PropTypes.objectOf(PropTypes.any).isRequired,
  onClickAddBtn: PropTypes.func,
  onClickEditBtn: PropTypes.func,
  onClickDeleteBtn: PropTypes.func,
  onClickSelectBtn: PropTypes.func,
  updateParentIdsList: PropTypes.func.isRequired,
  selectedId: PropTypes.string.isRequired,
};

AdminStructureTreeItem.defaultProps = {
  onClickAddBtn: undefined,
  onClickEditBtn: undefined,
  onClickDeleteBtn: undefined,
  onClickSelectBtn: undefined,
};
export default AdminStructureTreeItem;
