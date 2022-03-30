import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import MaterialTable from '@material-table/core';
import Container from '@material-ui/core/Container';
import CheckIcon from '@material-ui/icons/Check';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import { useHistory } from 'react-router-dom';
import keyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Spinner from '../system/Spinner';
import Services from '../../../api/services/services';
import setMaterialTableLocalization from '../initMaterialTableLocalization';

const { offlinePage } = Meteor.settings.public;

const AdminServicesTable = ({ services, loading, selectedStructure }) => {
  const structureMode = selectedStructure && selectedStructure._id;
  const urlStruct = structureMode ? 'structure' : '';
  const history = useHistory();
  const columns = [
    {
      title: i18n.__('pages.AdminServicesPage.columnLogo'),
      field: 'logo',
      render: (rowData) => {
        const { logo, title } = rowData;
        return <img style={{ height: 36, borderRadius: '10%' }} src={logo} alt={`Logo - ${title}`} />;
      },
    },
    { title: i18n.__('pages.AdminServicesPage.columnTitle'), field: 'title', defaultSort: 'asc' },
    { title: i18n.__('pages.AdminServicesPage.columnUsage'), field: 'usage' },
    {
      title: i18n.__('pages.AdminServicesPage.columnUrl'),
      field: 'url',
      render: (rowData) => {
        const { url } = rowData;
        return (
          <a href={url} target="_blank" rel="noreferrer noopener">
            {url}
          </a>
        );
      },
    },
    {
      title: i18n.__('pages.AdminServicesPage.columnState'),
      field: 'state',
      initialEditValue: Object.keys(Services.stateLabels)[0],
      render: (rowData) => {
        const { state } = rowData;
        return i18n.__(Services.stateLabels[state]);
      },
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

  if (offlinePage) {
    columns.push({
      title: i18n.__('pages.AdminServicesPage.columnOffline'),
      field: 'offline',
      render: (rowData) => {
        const { offline } = rowData;
        if (offline) {
          return <CheckIcon />;
        }
        return <CloseIcon />;
      },
    });
    options.actionsColumnIndex = 6;
  }

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container>
            {!loading && (
              <MaterialTable
                // other props
                title={`${i18n.__('pages.AdminServicesPage.title')} ${
                  structureMode && selectedStructure.name ? `(${selectedStructure.name})` : ''
                } (${services.length})`}
                columns={columns}
                data={services.map((row) => ({ ...row, id: row._id }))}
                options={options}
                localization={setMaterialTableLocalization('pages.AdminServicesPage')}
                actions={[
                  {
                    icon: keyboardArrowRight,
                    tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_goTooltip'),
                    onClick: (event, rowData) => {
                      if (rowData.state !== 10) {
                        history.push(`/${structureMode ? urlStruct : 'services'}/${rowData.slug}`);
                      } else {
                        msg.warning(`Service ${i18n.__(Services.stateLabels[rowData.state])}`);
                      }
                    },
                  },
                  {
                    icon: 'edit',
                    tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_editTooltip'),
                    onClick: (event, rowData) => {
                      history.push(`/admin/${urlStruct}services/${rowData._id}`);
                    },
                  },
                  {
                    icon: 'add',
                    tooltip: i18n.__('pages.AdminServicesPage.materialTableLocalization.body_addTooltip'),
                    isFreeAction: true,
                    onClick: () =>
                      history.push(`/admin/${urlStruct}services/new/${structureMode ? selectedStructure._id : ''}`),
                  },
                ]}
                editable={{
                  onRowDelete: (oldData) =>
                    new Promise((resolve, reject) => {
                      Meteor.call(
                        'services.removeService',
                        {
                          serviceId: oldData._id,
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
            )}
          </Container>
        </Fade>
      )}
    </>
  );
};
AdminServicesTable.propTypes = {
  services: PropTypes.arrayOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
  /** Provide empty {} if no structure mode */
  selectedStructure: PropTypes.objectOf(PropTypes.any).isRequired,
};
export default AdminServicesTable;
