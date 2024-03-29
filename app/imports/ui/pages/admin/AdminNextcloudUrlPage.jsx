import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import Container from '@mui/material/Container';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import add from '@mui/icons-material/Add';
import Fade from '@mui/material/Fade';
import Switch from '@mui/material/Switch';
import { makeStyles } from 'tss-react/mui';
import Spinner from '../../components/system/Spinner';
import Nextcloud from '../../../api/nextcloud/nextcloud';
import { removeNextcloudURL } from '../../../api/nextcloud/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import AdminNextCloudUrlEdit from '../../components/admin/AdminNextcloudUrlEdit';

const useStyles = makeStyles()((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(3),
  },
}));

// Inline styles for switch button;
// To concatenate multiple styles, use ...classe.attribute in style tag attribute
const switchStyle = {
  global: {
    borderRadius: 20,
    alignSelf: 'center',
    padding: 10,
    height: 10,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-evenly',
  },
  mainContainer: { display: 'flex', alignItems: 'center' },
  green: { backgroundColor: 'lightgreen' },
  red: { backgroundColor: 'red' },
};
function AdminNextcloudUrlPage({ loading, nextclouds }) {
  const { classes } = useStyles();
  const ncloudData = {};
  const columns = [
    {
      title: i18n.__('pages.AdminNextcloudUrlPage.columnActive'),
      field: 'active',
      width: 'fit-content',
      render: (rowData) =>
        rowData && rowData.active ? (
          <div style={switchStyle.container}>
            <div style={{ ...switchStyle.global, ...switchStyle.green }} />
            {i18n.__('pages.AdminNextcloudUrlPage.materialTableLocalization.activated')}
          </div>
        ) : (
          <div style={switchStyle.container}>
            <div style={{ ...switchStyle.global, ...switchStyle.red }} />
            {i18n.__('pages.AdminNextcloudUrlPage.materialTableLocalization.deactivated')}
          </div>
        ),
    },
    {
      title: i18n.__('pages.AdminNextcloudUrlPage.columnUrl'),
      field: 'url',
    },
    {
      title: i18n.__('pages.AdminNextcloudUrlPage.columnCount'),
      field: 'count',
      render: (rowData) => rowData.count,
    },
  ];

  const UpdateAllUsersURL = () => {
    Meteor.call('users.setNCloudAll', {}, function callbackUpdate(error, cpt) {
      if (error) {
        msg.error(error.message);
      } else if (cpt === 0) {
        msg.error(`${i18n.__('pages.AdminNextcloudUrlPage.methodEmpty')}`);
      } else {
        msg.success(`${i18n.__('pages.AdminNextcloudUrlPage.methodSuccess')} ${cpt}`);
      }
    });
  };

  const changeURL = (data) => {
    Meteor.call(
      'nextcloud.updateURL',
      {
        url: data.url,
        active: data.active,
      },
      function callbackQuota(error) {
        if (error) {
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
  };

  const [editUrl, setEditUrl] = useState(false);

  const OpenURLEditor = () => {
    setEditUrl(true);
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
    <Fade in className={classes.root}>
      <div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Container style={{ overflowX: 'auto' }}>
              <MaterialTable
                // other props
                title={i18n.__('pages.AdminNextcloudUrlPage.title')}
                columns={columns}
                data={nextclouds.map((row) => ({ ...row, id: row._id }))}
                options={options}
                localization={setMaterialTableLocalization('pages.AdminNextcloudUrlPage')}
                actions={[
                  (rowData) => ({
                    // icon: () => (rowData.active ? <VisibilityIcon /> : <VisibilityOffIcon />),
                    icon: () => (
                      <div style={switchStyle.mainContainer}>
                        <VisibilityOffIcon />
                        <Switch checked={rowData.active} />
                        <VisibilityIcon />
                      </div>
                    ),
                    tooltip: i18n.__('pages.AdminNextcloudUrlPage.materialTableLocalization.body_activeTooltip'),
                    onClick: () => {
                      changeURL({ ...rowData, active: !rowData.active });
                    },
                  }),
                  {
                    icon: add,
                    tooltip: i18n.__('pages.AdminNextcloudUrlPage.materialTableLocalization.body_addTooltip'),
                    isFreeAction: true,
                    onClick: () => {
                      OpenURLEditor();
                    },
                  },
                  {
                    icon: GroupAddIcon,
                    tooltip: i18n.__('pages.AdminNextcloudUrlPage.updateAll'),
                    isFreeAction: true,
                    onClick: () => {
                      UpdateAllUsersURL();
                    },
                  },
                ]}
                editable={{
                  onRowDelete: (oldData) =>
                    new Promise((resolve, reject) => {
                      removeNextcloudURL.call(
                        {
                          url: oldData.url,
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
                    }),
                }}
              />
            </Container>
            {editUrl ? (
              <AdminNextCloudUrlEdit data={ncloudData} open={editUrl} onClose={() => setEditUrl(false)} />
            ) : null}
          </>
        )}
      </div>
    </Fade>
  );
}

AdminNextcloudUrlPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  nextclouds: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withTracker(() => {
  const categoriesHandle = Meteor.subscribe('nextcloud.all');
  const loading = !categoriesHandle.ready();
  const nextclouds = Nextcloud.find({}, { sort: { name: 1 } }).fetch();
  return {
    loading,
    nextclouds,
  };
})(AdminNextcloudUrlPage);
