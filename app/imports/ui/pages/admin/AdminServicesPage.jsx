import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import i18n from 'meteor/universe:i18n';
import { withTracker, useTracker } from 'meteor/react-meteor-data';
import MaterialTable from '@material-table/core';
import InputLabel from '@material-ui/core/InputLabel';
import Container from '@material-ui/core/Container';
import CheckIcon from '@material-ui/icons/Check';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import { useHistory } from 'react-router-dom';
import keyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Card from '@material-ui/core/Card';
import Spinner from '../../components/system/Spinner';
import CustomSelect from '../../components/admin/CustomSelect';
import Services from '../../../api/services/services';
import { removeService } from '../../../api/services/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import { getStructure } from '../../../api/structures/utils';
import { useAppContext } from '../../contexts/context';
import Structures from '../../../api/structures/structures';

const { offlinePage } = Meteor.settings.public;

const useStyles = makeStyles(() => ({
  maxWidth: {
    maxWidth: '88vw',
  },
}));
function AdminServicesPage({ path }) {
  const [{ user }] = useAppContext();

  const classes = useStyles();
  const history = useHistory();

  const [selectedStructureId, setSelectedStructureId] = useState(user.structure);

  const { services, loading, structureMode, structures, selectedStructure } = useTracker(() => {
    const _structureMode = path === '/admin/structureservices';
    const subName = _structureMode ? 'services.structure.ids' : 'services.all';

    const _selectedStructure = getStructure(selectedStructureId);
    const structuresHandle = Meteor.subscribe('structures.with.all.childs', { structureId: user.structure });
    const structuresLoading = structuresHandle.ready();

    const _structures = Structures.findFromPublication('structures.with.all.childs').fetch();

    const servicesHandle = Meteor.subscribe(subName, _structureMode && { structureIds: [selectedStructureId] });
    const _loading = !servicesHandle.ready() && !structuresLoading;

    const _services = _structureMode
      ? Services.findFromPublication(subName, {}, { sort: { title: 1 } }).fetch()
      : Services.find({}, { sort: { title: 1 } }).fetch();

    const result = {
      selectedStructure: _selectedStructure,
      services: _services,
      loading: _loading,
      structureMode: _structureMode,
      structures: _structures,
    };

    return result;
  }, [selectedStructureId]);

  // used to help generate url in structure mode
  const urlStruct = structureMode ? 'structure' : '';
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
          <Container style={{ overflowX: 'auto' }}>
            <Card>
              <Grid item className={classes.maxWidth}>
                <FormControl variant="filled" className={classes.formControl} fullWidth>
                  <InputLabel
                    htmlFor="structure"
                    id="structure-label"
                    ref={() => selectedStructure && selectedStructure.name}
                  >
                    {i18n.__('pages.AdminServicesPage.selectStructure')}
                  </InputLabel>
                  <CustomSelect
                    labelWidth={100}
                    value={selectedStructureId}
                    error={false}
                    onChange={(e) => {
                      if (e.target.value.trim().length < 1) return;
                      setSelectedStructureId(e.target.value);
                    }}
                    options={structures.map((opt) => ({ value: opt._id, label: opt.name }))}
                  />
                </FormControl>
              </Grid>
            </Card>
            {!loading && (
              <MaterialTable
                // other props
                title={`${i18n.__('pages.AdminServicesPage.title')} ${
                  structureMode && selectedStructure && selectedStructure.name ? `(${selectedStructure.name})` : ''
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
                    onClick: () => history.push(`/admin/${urlStruct}services/new/${selectedStructure._id}`),
                  },
                ]}
                editable={{
                  onRowDelete: (oldData) =>
                    new Promise((resolve, reject) => {
                      removeService.call(
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
}

AdminServicesPage.propTypes = {
  path: PropTypes.string.isRequired,
};

export default withTracker(({ match: { path } }) => {
  return { path };
})(AdminServicesPage);
