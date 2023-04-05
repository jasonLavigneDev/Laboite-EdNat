import React from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Spinner from '../../components/system/Spinner';
import { createHelp, updateHelp, removeHelp } from '../../../api/helps/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import Helps from '../../../api/helps/helps';
import { handleResult } from '../../../api/utils';

const AdminHelpPage = () => {
  const { helps, loading, categories } = useTracker(() => {
    const helpsHandle = Meteor.subscribe('helps.all');
    const helpsData = Helps.find({}, { sort: { name: 1 } }).fetch();
    const categorieData = new Set([]);
    helpsData.forEach(({ category }) => categorieData.add(category));
    return {
      helps: helpsData,
      categories: [...categorieData],
      loading: !helpsHandle.ready(),
    };
  });
  const columns = [
    {
      title: i18n.__('pages.AdminHelpPage.columnTitle'),
      field: 'title',
    },
    { title: i18n.__('pages.AdminHelpPage.columnDescription'), field: 'description' },
    {
      title: i18n.__('pages.AdminHelpPage.columnCategory'),
      field: 'category',
      editComponent: ({ onChange, value }) => (
        <Autocomplete
          size="small"
          onChange={(event, newValue) => {
            onChange(newValue);
          }}
          onInputChange={(event, newInputValue) => {
            onChange(newInputValue);
          }}
          value={value}
          freeSolo
          renderInput={(params) => (
            <TextField {...params} label={i18n.__('pages.AdminHelpPage.columnCategory')} variant="outlined" />
          )}
          options={[...categories]}
        />
      ),
    },
    {
      title: i18n.__('pages.AdminHelpPage.columnType'),
      field: 'type',
      initialEditValue: 5,
      lookup: {
        0: i18n.__('api.helps.types.external'),
        5: i18n.__('api.helps.types.iframed'),
      },
    },
    {
      title: i18n.__('pages.AdminHelpPage.columnContent'),
      field: 'content',
    },
  ];
  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 5,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  const onRowAdd = async (newData) =>
    new Promise((resolve, reject) => {
      createHelp.call(
        {
          ...newData,
          type: Number(newData.type),
        },
        handleResult(resolve, reject),
      );
    });

  const onRowUpdate = ({ _id, id, ...newData }) =>
    new Promise((resolve, reject) => {
      const data = { ...newData, type: Number(newData.type) };
      delete data.tableData;
      updateHelp.call(
        {
          helpId: _id,
          data,
        },
        handleResult(resolve, reject),
      );
    });

  const onRowDelete = ({ _id }) =>
    new Promise((resolve, reject) => {
      removeHelp.call({ helpId: _id }, handleResult(resolve, reject));
    });

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <MaterialTable
              title={`${i18n.__('pages.AdminHelpPage.title')} (${helps.length})`}
              columns={columns}
              data={helps.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminHelpPage')}
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

export default AdminHelpPage;
