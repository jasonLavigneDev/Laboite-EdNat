import i18n from 'meteor/universe:i18n';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { useAdminSelectedStructureCall } from '../../../api/structures/hooks';

const renderStructureTreeList = (structures) => {
  return structures.map((structure) => (
    <TreeItem key={structure._id} nodeId={structure._id} label={structure.name}>
      {structure.subStructures?.length > 0 && renderStructureTreeList(structure.subStructures)}
    </TreeItem>
  ));
};

const sortArrayByName = (array) => {
  if (!array) return [];

  return array.sort((a, b) => {
    if (a.subStructures?.length) {
      // eslint-disable-next-line no-param-reassign
      a.subStructures = sortArrayByName(a.subStructures);
    }

    return a.name.localeCompare(b.name);
  });
};

export const TreeViewStructureSelector = ({ onStructureSelect, selectedStructureId }) => {
  const { pathname } = useLocation();
  const isStructureAdminMode = pathname === '/admin/structureanalytics';
  const { structures } = useAdminSelectedStructureCall({
    allStructures: !isStructureAdminMode,
  });

  const sortedStructures = useMemo(() => {
    return sortArrayByName(structures);
  }, [structures]);

  return (
    <div>
      <Typography variant="h6">{i18n.__('components.StructureSelect.label')}</Typography>
      <TreeView
        aria-label="structure tree selector"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeSelect={onStructureSelect}
        selected={selectedStructureId}
      >
        {!isStructureAdminMode ? (
          <TreeItem nodeId="all" label="Tout">
            {renderStructureTreeList(sortedStructures || [])}
          </TreeItem>
        ) : (
          renderStructureTreeList(sortedStructures || [])
        )}
      </TreeView>
    </div>
  );
};

TreeViewStructureSelector.propTypes = {
  onStructureSelect: PropTypes.func.isRequired,
  selectedStructureId: PropTypes.string.isRequired,
};
