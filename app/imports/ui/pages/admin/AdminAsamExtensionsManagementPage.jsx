import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import MaterialTable from '@material-table/core';
import EditIcon from '@mui/icons-material/Edit';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardActions from '@mui/material/CardActions';
import Card from '@mui/material/Card';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import { getStructure } from '../../../api/structures/hooks';
import AsamExtensions from '../../../api/asamextensions/asamextensions';
import StructureSelectAutoComplete from '../../components/structures/StructureSelectAutoComplete';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import { useModalStyles } from './AdminStructuresManagementPage';

const options = {
  pageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  paginationType: 'stepped',
  actionsColumnIndex: 6,
  addRowPosition: 'first',
  emptyRowsWhenPaging: false,
};

const columns = [
  { field: 'extension', title: i18n.__('api.asamextensions.labels.extension') },
  {
    field: 'structureId',
    title: i18n.__('api.structures.labels.name'),
    render: (rowData) => {
      return (
        <span>
          {rowData.structureId
            ? getStructure(rowData.structureId)?.name
            : i18n.__('pages.AdminAsamExtensionsManagementPage.noStructure')}
        </span>
      );
    },
  },
];

const AdminAsamExtensionsManagementPage = () => {
  const { classes: modalClasses } = useModalStyles();
  const data = useTracker(() => {
    Meteor.subscribe('asamextensions.all', { getOnlyNotAffected: false });
    const query = {};

    const searchResult = AsamExtensions.find(query, {
      fields: AsamExtensions.publicFields,
      sort: { extension: 1 },
      limit: 10000,
    }).fetch();
    return searchResult;
  });

  const [structuresLoaded, setStructuresLoaded] = useState(false);
  const [structures, setStructures] = useState([]);
  useEffect(() => {
    Meteor.subscribe('structures.all');
    Meteor.call('structures.getStructures', (err, res) => {
      if (err) msg.error(err.reason || err.message);
      else {
        setStructures(res);
        setStructuresLoaded(true);
      }
    });
  }, []);

  const [currentAsam, setCurrentAsam] = useState({
    _id: null,
    extension: null,
    structureId: null,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const openModal = ({ extensionId, extension, structureId }) => {
    setCurrentAsam({
      _id: extensionId,
      extension,
      structureId,
    });
    setModalOpen(true);
  };

  const resetAsamState = () => setCurrentAsam({ _id: null, extension: null, structureId: null });
  const closeModal = () => {
    setModalOpen(false);
    resetAsamState();
  };

  const [structureSearchText, setStructureSearchText] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (currentAsam.structureId == null) closeModal();
    else
      Meteor.call(
        'asam.assignStructureToAsam',
        {
          structureId: currentAsam.structureId,
          extensionId: currentAsam._id,
        },
        (err) => {
          if (err) msg.error(err.reason || err.message);
          else {
            msg.success(i18n.__('api.methods.operationSuccessMsg'));
          }
          closeModal();
        },
      );
  };

  const unassign = (rowData) => {
    Meteor.call('asam.unassignStructureToAsam', { extensionId: rowData._id }, (err) => {
      if (err) msg.error(err.reason || err.message);
      else msg.success(i18n.__('api.methods.operationSuccessMsg'));
    });
  };
  return (
    <Fade in>
      <div>
        <Modal
          open={modalOpen}
          onClose={closeModal}
          className={modalClasses.modal}
          closeAfterTransition
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={modalOpen}>
            <Card>
              <CardHeader
                title={`${i18n.__('pages.AdminAsamExtensionsManagementPage.modal.title')} "${currentAsam.extension}"`}
                action={
                  <IconButton
                    title={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.close')}
                    onClick={closeModal}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              />
              <form onSubmit={onSubmit}>
                <CardContent>
                  <StructureSelectAutoComplete
                    style={{ width: '100%' }}
                    flatData={structures}
                    loading={!structuresLoaded}
                    noOptionsText={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.noOptions')}
                    onChange={(event, newValue) => {
                      setCurrentAsam((asam) => ({ ...asam, structureId: newValue._id }));
                    }}
                    searchText={structureSearchText}
                    onInputChange={(event, newInputValue) => {
                      setStructureSearchText(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        onChange={({ target: { value } }) => setStructureSearchText(value)}
                        variant="outlined"
                        label={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.noOptions')}
                        placeholder={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.noOptions')}
                      />
                    )}
                  />
                </CardContent>
                <CardActions className={modalClasses.actions}>
                  <Button onClick={closeModal}>
                    <Typography>{i18n.__('pages.AdminAsamExtensionsManagementPage.modal.cancel')}</Typography>
                  </Button>

                  <Button type="submit" variant="contained" color="primary">
                    <Typography>{i18n.__('pages.AdminAsamExtensionsManagementPage.modal.submit')}</Typography>
                  </Button>
                </CardActions>
              </form>
            </Card>
          </Fade>
        </Modal>
        <Container>
          <MaterialTable
            title={i18n.__('pages.AdminAsamExtensionsManagementPage.title')}
            columns={columns}
            data={data.map((row) => ({ ...row, id: row._id }))}
            options={options}
            localization={setMaterialTableLocalization('pages.AdminAsamExtensionsManagementPage')}
            actions={[
              {
                icon: EditIcon,
                tooltip: i18n.__('pages.AdminAsamExtensionsManagementPage.actions.assignStructure'),
                onClick: (event, rowData) => {
                  openModal({
                    extensionId: rowData._id,
                    extension: rowData.extension,
                    structureId: rowData.structureId || null,
                  });
                },
              },
              {
                icon: ClearIcon,
                tooltip: i18n.__('pages.AdminAsamExtensionsManagementPage.actions.unassignStructure'),
                onClick: (event, rowData) => unassign(rowData),
              },
            ]}
          />
        </Container>
      </div>
    </Fade>
  );
};

export default AdminAsamExtensionsManagementPage;
