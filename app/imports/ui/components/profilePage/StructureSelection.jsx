import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTracker } from 'meteor/react-meteor-data';
import Backdrop from '@material-ui/core/Backdrop';
import Modal from '@material-ui/core/Modal';
import { _ } from 'meteor/underscore';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import i18n from 'meteor/universe:i18n';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Spinner from '../system/Spinner';
import Structures from '../../../api/structures/structures';
import AdminStructureSearchBar from '../admin/AdminStructureSearchBar';
import AdminStructureTreeView from '../admin/AdminStructureTreeView';
import { getTree } from '../../../api/utils';

const StructureSelection = ({ onUpdateField, isOpen, close, user, classes, startAncestorsIds }) => {
  const [selectedStructure, setSelectedStructure] = useState(user.structure || '');
  const [parentIds, setParentIds] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [structureSearchText, setStructureSearchText] = useState('');
  const [filteredStructureFlatData, setFilteredStructureFlatData] = useState([]);

  const { structuresFlatData, isStructuresFlatDataLoading } = useTracker(() => {
    const userStructure = user.structure || null;
    const parentIdsList = [...parentIds];
    if (userStructure && user.structure.length > 0) {
      parentIdsList.unshift(userStructure);
    }

    const structuresDataHandle = Meteor.subscribe('structures.top.with.childs', {
      parentIds: parentIdsList,
      searchText: structureSearchText,
      isAppAdminMode: true,
    });
    const isStructuresDataHandleLoading = !structuresDataHandle.ready();
    const data = Structures.findFromPublication('structures.top.with.childs').fetch();

    setFilteredStructureFlatData(data);

    if (!isStructuresDataHandleLoading) {
      setExpandedIds(
        data.reduce((accumulator, structure) => {
          if (structure.parentId) accumulator.push(structure.parentId);
          return accumulator;
        }, []),
      );
    }
    return {
      structuresFlatData: data,
      isStructuresFlatDataLoading: isStructuresDataHandleLoading,
    };
  }, [parentIds, structureSearchText.length > 2]);

  const updateParentIdsList = ({ ids }) => {
    const uniqueList = [...new Set([...parentIds, ...ids])];
    if (_.isEqual(parentIds.sort(), uniqueList.sort())) return;
    setExpandedIds([...expandedIds, ...ids]);
    setParentIds(uniqueList);
  };
  React.useEffect(() => {
    const hasStructure = startAncestorsIds.length > 0;
    if (hasStructure) updateParentIdsList({ ids: [...parentIds, ...startAncestorsIds] });
  }, []);
  const resetStructureSearchFilter = () => {
    setFilteredStructureFlatData(structuresFlatData);
    setExpandedIds([]);
  };

  const onClickSelectBtn = (nodes) => {
    console.log(nodes);
    onUpdateField({
      target: {
        value: nodes._id,
        name: 'structureSelect',
      },
    });
    setSelectedStructure(nodes._id);
  };
  return (
    <Modal
      className={classes.modal}
      open={isOpen}
      onClose={close}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={isOpen}>
        <Card style={{ height: '80vh', width: '80vw' }}>
          <Box display="flex" justifyContent="end">
            <Box>
              <CardHeader
                title={i18n.__(`pages.ProfilePage.structureChoice`)}
                action={
                  <IconButton title={i18n.__('pages.AdminStructuresManagementPage.close')} onClick={close}>
                    <ClearIcon />
                  </IconButton>
                }
              />
              <Typography color="textSecondary" style={{ paddingLeft: 16 }}>
                {i18n.__('pages.AdminStructuresManagementPage.helpText')}
              </Typography>
            </Box>
          </Box>
          <CardContent style={{ overflowY: 'auto', height: '100%' }}>
            <Box>
              <AdminStructureSearchBar
                searchValue={structureSearchText}
                setSearchText={setStructureSearchText}
                resetSearchText={() => setStructureSearchText('')}
                resetFilter={resetStructureSearchFilter}
              />
            </Box>
            {isStructuresFlatDataLoading && <Spinner full />}
            <Box>
              <AdminStructureTreeView
                treeData={getTree(filteredStructureFlatData)}
                onClickAddBtn={() => {}}
                onClickEditBtn={() => {}}
                onClickDeleteBtn={() => {}}
                onClickSelectBtn={onClickSelectBtn}
                setExpandedIds={setExpandedIds}
                updateParentIdsList={updateParentIdsList}
                expandedIds={expandedIds}
                onlySelect
                selectedId={selectedStructure}
              />
            </Box>
          </CardContent>
          <CardActions>
            <Button onClick={close}>
              <Typography>Cancel</Typography>
            </Button>
          </CardActions>
        </Card>
      </Fade>
    </Modal>
  );
};

StructureSelection.propTypes = {
  onUpdateField: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired,
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  startAncestorsIds: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default StructureSelection;
