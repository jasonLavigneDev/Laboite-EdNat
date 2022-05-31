import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import '../../../api/users/users';
import AdminUserValidationTable from '../../components/admin/AdminUserValidationTable';

function AdminUserValidationPage({ usersrequest, loading }) {
  return (
    <AdminUserValidationTable
      title={`${i18n.__('pages.AdminUserValidationPage.title')} (${usersrequest.length})`}
      users={usersrequest}
      loading={loading}
      actions={[
        {
          icon: PersonAddIcon,
          tooltip: i18n.__('pages.AdminUserValidationPage.actions_tooltip'),
          onClick: (event, rowData) => {
            Meteor.call('users.setActive', { userId: rowData._id }, (err) => {
              if (err) {
                msg.error(err.reason);
              }
            });
          },
        },
      ]}
      editable={{
        onRowDelete: (oldData) =>
          new Promise((resolve, reject) => {
            Meteor.call('users.removeUser', { userId: oldData._id }, (error, res) => {
              if (error) {
                msg.error(error.reason);
                reject(error);
              } else {
                msg.success(i18n.__('pages.AdminUsersPage.successDeleteUser'));
                resolve(res);
              }
            });
          }),
      }}
    />
  );
}

AdminUserValidationPage.propTypes = {
  usersrequest: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const usersrequestHandle = Meteor.subscribe('users.request');
  const structuresHandle = Meteor.subscribe('structures.all');
  const loading = !usersrequestHandle.ready() || !structuresHandle.ready();
  const usersrequest = Meteor.users.find({ isActive: { $ne: true } }).fetch();
  return {
    usersrequest,
    loading,
  };
})(AdminUserValidationPage);
