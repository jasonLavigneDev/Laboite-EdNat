import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import i18n from 'meteor/universe:i18n';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';
import CardHeader from '@material-ui/core/CardHeader';
import Structures from '../../../api/structures/structures';
import AdminStructureSearchBar from '../admin/AdminStructureSearchBar';
import AdminStructureTreeView from '../admin/AdminStructureTreeView';
import { getTree } from '../../../api/utils';
import { useStructure } from '../../../api/structures/hooks';
import { useAppContext } from '../../contexts/context';
import Spinner from '../system/Spinner';

const StructureSelectionTree = () => {
  const history = useHistory();
  const goToProfile = () => history.push('/profile');
  const saveStructure = (_id) => {
    Meteor.call('users.setStructure', { structure: _id }, (error) => {
      if (error) {
        msg.error(error.reason);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
        if (history.location.pathname !== '/profile') {
          goToProfile();
        }
      }
    });
  };

  const userStructure = useStructure();
  const [{ isMobile }] = useAppContext();
  const [selectedStructure, setSelectedStructure] = useState(userStructure ? userStructure._id : '');
  const [parentIds, setParentIds] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [structureSearchText, setStructureSearchText] = useState('');
  const [filteredStructureFlatData, setFilteredStructureFlatData] = useState([]);

  const { structuresFlatData, isStructuresFlatDataLoading } = useTracker(() => {
    const parentIdsList = [...parentIds];
    if (userStructure) {
      parentIdsList.unshift(userStructure._id);
    }

    const subName = 'structures.top.with.childs';

    const structuresDataHandle = Meteor.subscribe(subName, {
      parentIds: parentIdsList,
      searchText: structureSearchText,
      getTopLevelStructures: true,
    });

    const isStructuresDataHandleLoading = !structuresDataHandle.ready();

    const data = Structures.findFromPublication(subName).fetch();

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

  useEffect(() => {
    const hasStructure = userStructure && userStructure._id;
    if (hasStructure) updateParentIdsList({ ids: [...parentIds, ...userStructure.ancestorsIds] });
  }, [userStructure && userStructure._id]);

  const resetStructureSearchFilter = () => {
    setFilteredStructureFlatData(structuresFlatData);
    setExpandedIds([]);
  };

  const onClickSelectBtn = (nodes) => {
    saveStructure(nodes._id);
    setSelectedStructure(nodes._id);
  };

  return (
    <Fade in>
      <Box mx="auto" display="flex" justifyContent="center">
        <Card mx="auto" style={{ width: `${isMobile ? '100' : '80'}vw` }}>
          <Box display="flex">
            <Box>
              <CardHeader title={i18n.__(`components.StructureSelect.label`)} />
              <Typography color="textSecondary" style={{ paddingLeft: 16 }}>
                {i18n.__('pages.AdminStructuresManagementPage.helpText')}
              </Typography>
            </Box>
          </Box>
          <CardContent style={{ height: '100%' }}>
            <Box>
              <AdminStructureSearchBar
                searchValue={structureSearchText}
                setSearchText={setStructureSearchText}
                resetSearchText={() => setStructureSearchText('')}
                resetFilter={resetStructureSearchFilter}
              />
            </Box>
            <Box style={{ overflowY: 'auto', height: '100%' }}>
              {isStructuresFlatDataLoading ? (
                <Spinner />
              ) : (
                <AdminStructureTreeView
                  treeData={getTree(filteredStructureFlatData)}
                  onClickSelectBtn={onClickSelectBtn}
                  setExpandedIds={setExpandedIds}
                  updateParentIdsList={updateParentIdsList}
                  expandedIds={expandedIds}
                  onlySelect
                  selectedId={selectedStructure || ''}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default StructureSelectionTree;
