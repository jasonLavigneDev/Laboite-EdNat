import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Spinner from '../../components/system/Spinner';
import StructureSelect from '../../components/structures/StructureSelect';
import {
  createBusinessReGrouping,
  updateBusinessReGrouping,
  removeBusinessReGrouping,
} from '../../../api/businessReGrouping/methods';
import { useStructure, useAdminSelectedStructure } from '../../../api/structures/hooks';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import BusinessReGrouping from '../../../api/businessReGrouping/businessReGrouping';
import { handleResult } from '../../../api/utils';
import Structures from '../../../api/structures/structures';

const useStyles = makeStyles()((theme) => ({
  marginTop: {
    marginTop: theme.spacing(3),
  },
}));

const onRowDelete = (oldData) =>
  new Promise((resolve, reject) => {
    removeBusinessReGrouping.call(
      { businessReGroupingId: oldData._id, structure: oldData.structure },
      handleResult(resolve, reject),
    );
  });

const AdminBusinessReGroupingPage = ({ businessReGrouping, loading }) => {
  const userStructure = useStructure();
  const { classes } = useStyles();
  const [selectedStructureId, setSelectedStructureId] = useState(
    userStructure && userStructure._id ? userStructure._id : '',
  );
  const { structures } = useAdminSelectedStructure({ selectedStructureId, setSelectedStructureId });
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

  const businessRegroupingByStructure = (selectedStructure) => {
    const currSelectedStructure = Structures.findOne(selectedStructure);
    return businessReGrouping.filter(
      (b) =>
        b.structure === selectedStructure ||
        (currSelectedStructure.ancestorsIds !== undefined && currSelectedStructure.ancestorsIds.includes(b.structure)),
    );
  };

  const onRowUpdate = (newData, oldData) =>
    new Promise((resolve, reject) => {
      updateBusinessReGrouping.call(
        {
          businessReGroupingId: oldData._id,
          data: {
            name: newData.name,
            structure: selectedStructureId,
          },
        },
        handleResult(resolve, reject),
      );
    });

  const onRowAdd = ({ name }) =>
    new Promise((resolve, reject) => {
      createBusinessReGrouping.call({ name, structure: selectedStructureId }, handleResult(resolve, reject));
    });

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <Grid container spacing={12}>
              <Grid item md={12} className={classes.marginTop}>
                <StructureSelect
                  structures={structures}
                  selectedStructureId={selectedStructureId}
                  setSelectedStructureId={setSelectedStructureId}
                />
              </Grid>
              <Grid item md={12} className={classes.marginTop}>
                <MaterialTable
                  // other props
                  title={`${i18n.__('pages.AdminBusinessReGroupingPage.title')} (${businessReGrouping.length})`}
                  columns={columns}
                  data={businessRegroupingByStructure(selectedStructureId).map((row) => ({ ...row, id: row._id }))}
                  options={options}
                  localization={setMaterialTableLocalization('pages.AdminBusinessReGroupingPage')}
                  editable={{
                    onRowAdd,
                    onRowDelete,
                    onRowUpdate,
                  }}
                />
              </Grid>
            </Grid>
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
