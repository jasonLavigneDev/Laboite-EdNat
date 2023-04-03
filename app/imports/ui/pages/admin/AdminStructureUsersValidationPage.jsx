import React from 'react';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import DoneIcon from '@mui/icons-material/Done';

import Structures, { propTypes as structurePropTypes } from '../../../api/structures/structures';
import { useAwaitingUsers } from '../../../api/users/hooks';
import AdminUserValidationTable from '../../components/admin/AdminUserValidationTable';

const AdminStructureUsersValidationPage = ({ structure, loadingStruct }) => {
  const { data: users, loading } = useAwaitingUsers({ structureId: structure?._id || null });
  const accept = (user) => {
    const data = { targetUserId: user._id };
    Meteor.call('users.acceptAwaitingStructure', { ...data }, (err) => {
      if (err) {
        msg.error(err.reason || err.message);
      } else msg.success(i18n.__('api.methods.operationSuccessMsg'));
    });
  };

  const columnsFields = ['username', 'lastName', 'firstName', 'emails'];

  return (
    <AdminUserValidationTable
      title={i18n.__('pages.AdminStructureUsersValidationPage.title', { structureName: structure?.name || '' })}
      users={users}
      loading={loading || loadingStruct}
      columnsFields={columnsFields}
      actions={[
        {
          icon: DoneIcon,
          tooltip: i18n.__('pages.AdminStructureUsersValidationPage.actions.validate'),
          onClick: (event, rowData) => {
            accept(rowData);
          },
        },
      ]}
    />
  );
};

AdminStructureUsersValidationPage.propTypes = {
  structure: structurePropTypes.isRequired,
  loadingStruct: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const user = Meteor.user();
  if (user.structure) {
    const subscription = Meteor.subscribe('structures.one');
    const loadingStruct = !subscription.ready();
    const structure = loadingStruct ? null : Structures.findOne(user.structure);
    return { loadingStruct, structure };
  }
  return { loadingStruct: true, structure: {} };
})(AdminStructureUsersValidationPage);
