import React from 'react';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import DoneIcon from '@mui/icons-material/Done';

import { propTypes as structurePropTypes } from '../../../api/structures/structures';
import { useAppContext } from '../../contexts/context';
import { useAwaitingUsers } from '../../../api/users/hooks';
import AdminUserValidationTable from '../../components/admin/AdminUserValidationTable';

const AdminStructureUsersValidationPage = ({ users, structure, loading }) => {
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
      title={i18n.__('pages.AdminStructureUsersValidationPage.title', { structureName: structure.name })}
      users={users}
      loading={loading}
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
  users: PropTypes.arrayOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const [{ user, structure }] = useAppContext();
  const { data, loading } = useAwaitingUsers({ structureId: structure._id || user.structure });
  return { users: data, loading, structure };
})(AdminStructureUsersValidationPage);
