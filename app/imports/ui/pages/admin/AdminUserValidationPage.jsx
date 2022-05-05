import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Spinner from '../../components/system/Spinner';
import '../../../api/users/users';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import { getStructure } from '../../../api/structures/hooks';

function AdminUserValidationPage({ usersrequest, loading }) {
  const columns = [
    {
      title: i18n.__('pages.AdminUserValidationPage.columnUsername'),
      field: 'username',
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnLastName'),
      field: 'lastName',
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnFirstName'),
      field: 'firstName',
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnEmails'),
      field: 'emails',
      render: (rowData) =>
        rowData.emails.map((m) => (
          <a key={m.address} href={`mailto:${m.address}`} style={{ display: 'block' }}>
            {m.address}
          </a>
        )),
    },
    {
      title: i18n.__('pages.AdminUserValidationPage.columnStructure'),
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
      title: i18n.__('pages.AdminUserValidationPage.columnCreatedAt'),
      field: 'createdAt',
      type: 'datetime',
    },
  ];

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 6,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container>
            <MaterialTable
              // other props
              title={`${i18n.__('pages.AdminUserValidationPage.title')} (${usersrequest.length})`}
              columns={columns}
              data={usersrequest.map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.AdminUserValidationPage')}
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
          </Container>
        </Fade>
      )}
    </>
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
  const usersrequest = Meteor.users.find({ isRequest: true }).fetch();
  return {
    usersrequest,
    loading,
  };
})(AdminUserValidationPage);
