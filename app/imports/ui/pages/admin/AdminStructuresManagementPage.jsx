import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import { createStructure, updateStructure, removeStructure } from '../../../api/structures/methods';
import { handleResult } from '../../../api/utils';
import Spinner from '../../components/system/Spinner';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import Structures from '../../../api/structures/structures';

const onRowAdd = ({ name }) =>
  new Promise((resolve, reject) => {
    createStructure.call({ name }, handleResult(resolve, reject));
  });

const onRowUpdate = (newData, oldData) =>
  new Promise((resolve, reject) => {
    updateStructure.call(
      {
        structureId: oldData._id,
        data: {
          name: newData.name,
        },
      },
      handleResult(resolve, reject),
    );
  });

const onRowDelete = (oldData) =>
  new Promise((resolve, reject) => {
    removeStructure.call({ structureId: oldData._id }, handleResult(resolve, reject));
  });

const AdminStructureManagementPage = ({ structures, loading }) => {
  const columns = [
    {
      name: i18n.__('pages.AdminStructuresManagementPage.columnName'),
      field: 'name',
      defaultSort: 'asc',
    },
  ];

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 4,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <MaterialTable
              title={`${i18n.__('pages.AdminStructuresManagementPage.title')} (${structures.length})`}
              columns={columns}
              data={structures.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminStructuresManagementPage')}
              editable={{ onRowAdd, onRowUpdate, onRowDelete }}
            />
          </Container>
        </Fade>
      )}
    </>
  );
};

AdminStructureManagementPage.propTypes = {
  structures: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const structuresHandle = Meteor.subscribe('structures.all');
  const loading = !structuresHandle.ready();
  const structures = Structures.find({}, { sort: { name: 1 } }).fetch();
  return {
    structures,
    loading,
  };
})(AdminStructureManagementPage);
