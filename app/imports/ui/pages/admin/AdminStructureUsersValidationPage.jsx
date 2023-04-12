import React from 'react';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import DoneIcon from '@mui/icons-material/Done';

import Structures, { propTypes as structurePropTypes } from '../../../api/structures/structures';
import AdminUserValidationTable from '../../components/admin/AdminUserValidationTable';

const AdminStructureUsersValidationPage = ({ structure, loading, users }) => {
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
  const user = Meteor.user();
  if (user.structure) {
    const subscription = Meteor.subscribe('structures.one');
    const structure = Structures.findOne(user.structure);
    const subUsers = Meteor.subscribe('users.awaitingForStructure', { structureId: user.structure });
    const users = Meteor.users.find({ awaitingStructure: user.structure }).fetch();
    const loading = !subscription.ready() && !subUsers.ready();
    return { loading, structure, users };
  }
  return { loading: true, structure: {} };
})(AdminStructureUsersValidationPage);
