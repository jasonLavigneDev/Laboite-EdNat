import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import Spinner from '../../components/system/Spinner';
import {
  createBusinessReGrouping,
  updateBusinessReGrouping,
  removeBusinessReGrouping,
} from '../../../api/businessReGrouping/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import BusinessReGrouping from '../../../api/businessReGrouping/businessReGrouping';
import { handleResult } from '../../../api/utils';

const onRowAdd = ({ name }) =>
  new Promise((resolve, reject) => {
    createBusinessReGrouping.call({ name }, handleResult(resolve, reject));
  });
const onRowUpdate = (newData, oldData) =>
  new Promise((resolve, reject) => {
    updateBusinessReGrouping.call(
      {
        businessReGroupingId: oldData._id,
        data: {
          name: newData.name,
        },
      },
      handleResult(resolve, reject),
    );
  });

const onRowDelete = (oldData) =>
  new Promise((resolve, reject) => {
    removeBusinessReGrouping.call({ businessReGroupingId: oldData._id }, handleResult(resolve, reject));
  });

const AdminBusinessReGroupingPage = ({ businessReGrouping, loading }) => {
  const columns = [
    {
      name: i18n.__('pages.AdminBusinessReGroupingPage.columnName'),
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
              // other props
              title={`${i18n.__('pages.AdminBusinessReGroupingPage.title')} (${businessReGrouping.length})`}
              columns={columns}
              data={businessReGrouping.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminBusinessReGroupingPage')}
              editable={{
                onRowAdd,
                onRowDelete,
                onRowUpdate,
              }}
            />
          </Container>
        </Fade>
      )}
    </>
  );
};

AdminBusinessReGroupingPage.propTypes = {
  businessReGrouping: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const businessReGroupingHandle = Meteor.subscribe('businessReGrouping.all');
  const loading = !businessReGroupingHandle.ready();
  const businessReGrouping = BusinessReGrouping.find({}, { sort: { name: 1 } }).fetch();
  return {
    businessReGrouping,
    loading,
  };
})(AdminBusinessReGroupingPage);
