import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import { useHistory } from 'react-router-dom';
import MaterialTable from '@material-table/core';
import Container from '@mui/material/Container';
import edit from '@mui/icons-material/Edit';
import add from '@mui/icons-material/Add';
import Spinner from '../../components/system/Spinner';
import Groups from '../../../api/groups/groups';
import { removeGroup } from '../../../api/groups/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import { getGroupName } from '../../utils/utilsFuncs';

function AdminGroupsPage({ groups, loading, user }) {
  const history = useHistory();
  const adminURL = Roles.userIsInRole(user._id, 'admin') ? '/admin/groups' : '/admingroups';
  const columns = [
    {
      title: i18n.__('pages.AdminGroupsPage.columnName'),
      field: 'name',
      render: (rowData) => getGroupName(rowData),
    },
    {
      title: i18n.__('pages.AdminGroupsPage.columnInfo'),
      field: 'description',
    },
    {
      title: i18n.__('pages.AdminGroupsPage.columnType'),
      field: 'type',
      initialEditValue: Object.keys(Groups.typeLabels)[0],
      render: (rowData) => i18n.__(Groups.typeLabels[rowData.type]),
    },
    {
      title: i18n.__('pages.AdminGroupsPage.columnMembers'),
      field: '',
      render: (rowData) => (rowData && rowData.members ? rowData.members.length : null),
      customSort: (a, b) => a.members.length - b.members.length,
    },
    {
      title: i18n.__('pages.AdminGroupsPage.columnCandidates'),
      field: '',
      render: (rowData) => (rowData && rowData.candidates ? rowData.candidates.length : null),
      // check for candidates field presence, it can be undefined when previous
      // publication data without candidates information is still in memory
      customSort: (a, b) => (a.candidates && b.candidates ? a.candidates.length - b.candidates.length : 1),
      defaultSort: 'desc',
    },
  ];

  const createNewGoup = () => {
    if (user.groupCount < user.groupQuota) {
      history.push(`${adminURL}/new`);
    } else {
      msg.error(i18n.__('api.groups.toManyGroup'));
    }
  };

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
        <Container style={{ overflowX: 'auto' }}>
          <MaterialTable
            // other props
            title={`${i18n.__('pages.AdminGroupsPage.title')} (${
              groups.length > user.groupCount ? `${groups.length}, ` : ''
            }${user.groupCount}/${user.groupQuota})`}
            columns={columns}
            data={groups.map((row) => ({ ...row, id: row._id }))}
            options={options}
            localization={setMaterialTableLocalization('pages.AdminGroupsPage')}
            actions={[
              {
                icon: edit,
                tooltip: i18n.__('pages.AdminGroupsPage.materialTableLocalization.body_editTooltip'),
                onClick: (event, rowData) => {
                  history.push(`${adminURL}/${rowData._id}`);
                },
              },
              {
                icon: add,
                hidden: user.groupQuota <= 0,
                disabled: user.groupQuota <= user.groupCount,
                tooltip:
                  user.groupQuota <= user.groupCount
                    ? i18n.__('pages.AdminGroupsPage.materialTableLocalization.body_cantCreate')
                    : i18n.__('pages.AdminGroupsPage.materialTableLocalization.body_addTooltip'),
                isFreeAction: true,
                onClick: () => {
                  createNewGoup();
                },
              },
            ]}
            editable={{
              onRowDelete: (oldData) =>
                new Promise((resolve, reject) => {
                  if (oldData.type !== 15) {
                    removeGroup.call(
                      {
                        groupId: oldData._id,
                      },
                      (err, res) => {
                        if (err) {
                          msg.error(err.reason);
                          reject(err);
                        } else {
                          msg.success(i18n.__('api.methods.operationSuccessMsg'));
                          resolve(res);
                        }
                      },
                    );
                  } else {
                    msg.error(i18n.__('api.methods.operationRefused'));
                    reject();
                  }
                }),
            }}
          />
        </Container>
      )}
    </>
  );
}

AdminGroupsPage.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withTracker(() => {
  const groupsHandle = Meteor.subscribe('groups.adminof');
  const loading = !groupsHandle.ready();
  const user = Meteor.users.findOne({ userId: this.userId });
  const groups = Groups.find({}, { sort: { name: 1 } }).fetch();
  return {
    groups,
    loading,
    user,
  };
})(AdminGroupsPage);
