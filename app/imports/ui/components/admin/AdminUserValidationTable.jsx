import React from 'react';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';

import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import MaterialTable from '@material-table/core';
import setMaterialTableLocalization from '../initMaterialTableLocalization';
import Spinner from '../system/Spinner';
import { getStructure } from '../../../api/structures/hooks';

const columnsDefault = [
  {
    title: i18n.__('components.AdminUserValidationTable.columnUsername'),
    field: 'username',
  },
  {
    title: i18n.__('components.AdminUserValidationTable.columnLastName'),
    field: 'lastName',
  },
  {
    title: i18n.__('components.AdminUserValidationTable.columnFirstName'),
    field: 'firstName',
  },
  {
    title: i18n.__('components.AdminUserValidationTable.columnEmails'),
    field: 'emails',
    render: (rowData) =>
      rowData.emails.map((m) => (
        <a key={m.address} href={`mailto:${m.address}`} style={{ display: 'block' }}>
          {m.address}
        </a>
      )),
  },
  {
    title: i18n.__('components.AdminUserValidationTable.columnStructure'),
    field: 'structure',
    render: (rowData) => {
      const struc = getStructure(rowData.structure);
      if (struc) {
        return struc.name;
      }
      return i18n.__('pages.AdminUsersPage.undefined');
    },
  },
  {
    title: i18n.__('components.AdminUserValidationTable.columnCreatedAt'),
    field: 'createdAt',
    type: 'datetime',
  },
];
const optionsDefault = {
  pageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  paginationType: 'stepped',
  addRowPosition: 'first',
  emptyRowsWhenPaging: false,
};

const columnsFieldsDefault = columnsDefault.map((col) => col.field);
const AdminUserValidationTable = ({
  title,
  loading,
  users = [],
  actions = [],
  editable = {},
  columnsFields = columnsFieldsDefault,
  options = optionsDefault,
  areActionsPositionAtStart = false,
}) => {
  const cols = columnsDefault.filter((col) => columnsFields.includes(col.field));
  const opts = {
    ...options,
    actionsColumnIndex: areActionsPositionAtStart ? 0 : cols.length + 1,
  };

  if (loading) return <Spinner />;

  return (
    <Fade in>
      <Container>
        <MaterialTable
          title={title}
          columns={cols}
          options={opts}
          data={users.map((user) => ({ ...user, id: user._id }))}
          localization={setMaterialTableLocalization('components.AdminUserValidationTable')}
          actions={actions}
          editable={editable}
        />
      </Container>
    </Fade>
  );
};

AdminUserValidationTable.propTypes = {
  columnsFields: PropTypes.arrayOf(PropTypes.any),
  options: PropTypes.objectOf(PropTypes.any),
  areActionsPositionAtStart: PropTypes.bool,
  loading: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.object),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      /** An icon element reference  */
      icon: PropTypes.any.isRequired,
      /** A string to be shown on mouse hover */
      tooltip: PropTypes.string.isRequired,
      /** A callback function which take (event, rowData) as a param signature */
      onClick: PropTypes.func.isRequired,
    }),
  ),
  /** Refer to `<MaterialTable />` editable prop  */
  editable: PropTypes.objectOf(PropTypes.any),
};

AdminUserValidationTable.defaultProps = {
  columnsFields: columnsFieldsDefault,
  options: optionsDefault,
  areActionsPositionAtStart: false,
  users: [],
  actions: [],
  editable: {},
};

export default AdminUserValidationTable;
