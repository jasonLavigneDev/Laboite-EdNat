import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import ClearIcon from '@mui/icons-material/Clear';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { Roles } from 'meteor/alanning:roles';
import add from '@mui/icons-material/Add';
import setMaterialTableLocalization from '../initMaterialTableLocalization';
import Finder from './Finder';
import Groups from '../../../api/groups/groups';
import { useAppContext } from '../../contexts/context';
import AdminSendNotification from '../users/AdminSendNotification';
import SendGroupNotification from '../groups/SendGroupNotification';

const useStyles = makeStyles()(() => ({
  adduser: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '10px',
  },
}));

const GroupsUsersList = (props) => {
  const { ready, group, users, groupId, userRole } = props;
  const isAutomaticGroup = group.type === 15;

  const removeMethods = {
    candidate: 'users.unsetCandidateOf',
    member: 'users.unsetMemberOf',
    animator: 'users.unsetAnimatorOf',
    admin: 'users.unsetAdminOf',
  };
  const addMethods = {
    candidate: 'users.setCandidateOf',
    member: 'users.setMemberOf',
    animator: 'users.setAnimatorOf',
    admin: 'users.setAdminOf',
  };

  const preventRerender = useCallback((rowData) => rowData.emails.map((email) => email.address).join(', '), []);

  const columns = [
    { title: i18n.__('components.GroupUsersList.columnUsername'), field: 'username', defaultSort: 'asc' },
    { title: i18n.__('components.GroupUsersList.columnFirstName'), field: 'firstName' },
    { title: i18n.__('components.GroupUsersList.columnLastName'), field: 'lastName' },
    {
      title: i18n.__('components.GroupUsersList.columnEmail'),
      field: 'emails',
      render: preventRerender,
    },
  ];

  const options = {
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 4,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  const [{ userId }] = useAppContext();
  const isAdmin = Roles.userIsInRole(userId, 'admin', groupId);

  const unknownUser = {
    username: `<${i18n.__('api.groups.userNotFound')}>`,
    firstName: '---',
    lastName: '---',
    emails: [{ address: '---', verified: false }],
  };

  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [user, setUser] = useState(null);
  const [groupAdd, setGroupAdd] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchGroup, setShowSearchGroup] = useState(false);
  const [finderId, setFinderId] = useState(new Date().getTime());
  const [openNotif, setOpenNotif] = useState(false);
  const [openGroupNotif, setOpenGroupNotif] = useState(false);
  const [userDataToSendNotif, setUserDataToSendNotif] = useState({});
  const { classes } = useStyles();

  const addUser = () => {
    Meteor.call(addMethods[userRole], { groupId, userId: user._id }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('components.GroupUsersList.userAdded'));
      }
    });
    setFinderId(new Date().getTime());
  };

  function userDeletable(userData) {
    if (userRole === 'admin' || userRole === 'animator') {
      // can only remove self if not admin
      return isAdmin || userData._id === userId;
    }
    return true;
  }

  const addGroup = () => {
    Meteor.call('groups.addGroupMembersToGroup', { groupId, otherGroupId: groupAdd._id }, (err, nb) => {
      if (err) {
        msg.error(err.reason);
      } else if (nb === 0) {
        msg.error(i18n.__('components.GroupUsersList.groupAddedButNoMember'));
      } else {
        msg.success(`${nb} ${i18n.__('components.GroupUsersList.groupAdded')}`);
      }
    });
    setFinderId(new Date().getTime());
  };

  const sendNotification = (fullUser) => {
    setUserDataToSendNotif(fullUser);
    setOpenNotif(true);
  };

  useEffect(() => {
    if (ready === true && group?.name) {
      const usersField = `${userRole}s`;
      const groupUsers = {};
      users.forEach((entry) => {
        groupUsers[entry._id] = entry;
      });
      setData(group[usersField].map((uId) => groupUsers[uId] || { ...unknownUser, _id: uId }));
      setTitle('');
    } else {
      setTitle(i18n.__('components.GroupUsersList.loadingTitle'));
    }
  }, [ready, users, group]);

  const actions = [
    {
      icon: add,
      tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_addTooltip'),
      isFreeAction: true,
      onClick: () => {
        setShowSearch(!showSearch);
        setShowSearchGroup(false);
      },
    },
  ];

  actions.push({
    icon: GroupAddIcon,
    tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_addGroupTooltip'),
    isFreeAction: true,
    onClick: () => {
      setShowSearchGroup(!showSearchGroup);
      setShowSearch(false);
    },
  });

  actions.push({
    icon: AddAlertIcon,
    tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_sendGroupNotifTooltip'),
    isFreeAction: true,
    onClick: () => {
      setOpenGroupNotif(true);
    },
  });

  actions.push({
    icon: AddAlertIcon,
    tooltip: i18n.__('components.GroupUsersList.materialTableLocalization.body_sendMemberNotifTooltip'),
    isFreeAction: false,
    onClick: (_, rowData) => {
      sendNotification(rowData);
    },
  });

  if (userRole === 'candidate') {
    actions.push({
      icon: PersonAddIcon,
      tooltip: i18n.__('components.GroupUsersList.validate_tooltip'),
      onClick: (_, rowData) => {
        Meteor.call('users.setMemberOf', { userId: rowData._id, groupId }, (err) => {
          if (err) {
            msg.error(err.reason);
          } else {
            msg.success(i18n.__('components.GroupUsersList.memberAdded'));
          }
        });
      },
    });
  }

  return (
    <>
      <Collapse in={showSearch} collapsedSize={0}>
        <div className={classes.adduser}>
          <Finder
            onSelected={setUser}
            key={finderId}
            hidden={!showSearch}
            exclude={{ groupId, role: userRole }}
            opened={showSearch}
            i18nCode="UserFinder"
            method="users.findUsers"
          />
          <Button variant="contained" disabled={!user} color="primary" onClick={addUser}>
            {i18n.__('components.GroupUsersList.addUserButton')}
          </Button>
          <IconButton onClick={() => setShowSearch(!showSearch)} size="large">
            <ClearIcon />
          </IconButton>
        </div>
      </Collapse>
      <Collapse in={showSearchGroup} collapsedSize={0}>
        <div className={classes.adduser}>
          <Finder
            onSelected={setGroupAdd}
            key={finderId}
            hidden={!showSearchGroup}
            exclude={{ groupId, role: userRole }}
            opened={showSearchGroup}
            i18nCode="GroupFinder"
            method="groups.findGroups"
          />
          <Button variant="contained" disabled={!groupAdd} color="primary" onClick={addGroup}>
            {i18n.__('components.GroupUsersList.addGroupButton')}
          </Button>
          <IconButton onClick={() => setShowSearchGroup(!showSearchGroup)} size="large">
            <ClearIcon />
          </IconButton>
        </div>
      </Collapse>
      <MaterialTable
        // other props
        title={title}
        columns={columns}
        data={data.map((row) => ({ ...row, id: row._id }))}
        options={options}
        localization={setMaterialTableLocalization('components.GroupUsersList')}
        actions={!isAutomaticGroup ? actions : []}
        editable={
          !isAutomaticGroup
            ? {
                isDeletable: (rowData) => userDeletable(rowData),
                onRowDelete: (oldData) =>
                  new Promise((resolve, reject) => {
                    Meteor.call(
                      removeMethods[userRole],
                      {
                        userId: oldData._id,
                        groupId,
                      },
                      (err, res) => {
                        if (err) {
                          msg.error(err.reason);
                          reject(err);
                        } else {
                          msg.success(i18n.__('components.GroupUsersList.userRemoved'));
                          resolve(res);
                        }
                      },
                    );
                  }),
              }
            : null
        }
      />
      {openNotif && (
        <AdminSendNotification data={userDataToSendNotif} open={openNotif} onClose={() => setOpenNotif(false)} />
      )}
      {openGroupNotif && (
        <SendGroupNotification groupId={groupId} open={openGroupNotif} onClose={() => setOpenGroupNotif(false)} />
      )}
    </>
  );
};

GroupsUsersList.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
  groupId: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
};

export default withTracker(({ groupId, userRole }) => {
  const subUsers = Meteor.subscribe('groups.users', { groupId, role: userRole });
  const group = Groups.findOne(groupId) || {};
  const users = Meteor.users.find({}).fetch() || [];
  const ready = subUsers.ready();
  return {
    ready,
    group,
    groupId,
    userRole,
    users,
  };
})(GroupsUsersList);
