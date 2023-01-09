import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import MaterialTable from '@material-table/core';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardActions from '@mui/material/CardActions';
import Card from '@mui/material/Card';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material//Button';
import TextField from '@mui/material//TextField';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Modal from '@mui/material//Modal';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import { getStructure } from '../../../api/structures/hooks';
import AsamExtensions from '../../../api/asamextensions/asamextensions';
import StructureSelectAutoComplete from '../../components/structures/StructureSelectAutoComplete';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import { useModalStyles } from './AdminStructuresManagementPage';

const useStyles = makeStyles()(() => ({
  mailExtensionFields: {
    display: 'none',
  },
}));
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

const ExtensionMail = ({ updateCurrentextension, emailExtensionDataInfos }) => {
  const [extension, setExtension] = useState(emailExtensionDataInfos.extension);
  const [entityShortName, setEntityShortName] = useState(emailExtensionDataInfos.entityShortName);
  const [entityLongName, setEntityLongName] = useState(emailExtensionDataInfos.entityLongName);
  const [famillyShortName, setFamillyShortName] = useState(emailExtensionDataInfos.famillyShortName);
  const [famillyLongName, setFamillyLongName] = useState(emailExtensionDataInfos.famillyLongName);
  const { classes } = useStyles();
  const onUpdateField = (event) => {
    switch (event.target.name) {
      case 'extension':
        setExtension(event.target.value);
        updateCurrentextension({
          extensionId: emailExtensionDataInfos._id || null,
          structureId: emailExtensionDataInfos.structureId || null,
          extension: event.target.value,
          entityShortName,
          entityLongName,
          famillyShortName,
          famillyLongName,
        });
        break;
      case 'entityShortName':
        setEntityShortName(event.target.value);
        updateCurrentextension({
          extensionId: emailExtensionDataInfos._id || null,
          structureId: emailExtensionDataInfos.structureId || null,
          extension,
          entityShortName: event.target.value,
          entityLongName,
          famillyShortName,
          famillyLongName,
        });
        break;
      case 'entityLongName':
        setEntityLongName(event.target.value);
        updateCurrentextension({
          extensionId: emailExtensionDataInfos._id || null,
          structureId: emailExtensionDataInfos.structureId || null,
          extension,
          entityShortName,
          entityLongName: event.target.value,
          famillyShortName,
          famillyLongName,
        });
        break;
      case 'famillyShortName':
        setFamillyShortName(event.target.value);
        updateCurrentextension({
          extensionId: emailExtensionDataInfos._id || null,
          structureId: emailExtensionDataInfos.structureId || null,
          extension,
          entityShortName,
          entityLongName,
          famillyShortName: event.target.value,
          famillyLongName,
        });
        break;
      case 'famillyLongName':
        setFamillyLongName(event.target.value);
        updateCurrentextension({
          extensionId: emailExtensionDataInfos._id || null,
          structureId: emailExtensionDataInfos.structureId || null,
          extension,
          entityShortName,
          entityLongName,
          famillyShortName,
          famillyLongName: event.target.value,
        });
        break;
      default:
        break;
    }
  };
  return (
    <Card>
      <CardContent>
        <TextField
          onChange={onUpdateField}
          fullWidth
          name="extension"
          value={extension}
          label={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.mailExtension')}
          placeholder={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.mailExtension')}
          required
        />
      </CardContent>
      <CardContent className={classes.mailExtensionFields}>
        <TextField
          onChange={onUpdateField}
          fullWidth
          name="entityShortName"
          value={entityShortName}
          label={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.entityShortName')}
          placeholder={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.entityShortName')}
        />
      </CardContent>
      <CardContent className={classes.mailExtensionFields}>
        <TextField
          onChange={onUpdateField}
          fullWidth
          name="entityLongName"
          value={entityLongName}
          label={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.entityLongName')}
          placeholder={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.entityLongName')}
        />
      </CardContent>
      <CardContent className={classes.mailExtensionFields}>
        <TextField
          onChange={onUpdateField}
          fullWidth
          name="famillyShortName"
          value={famillyShortName}
          label={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.famillyShortName')}
          placeholder={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.famillyShortName')}
        />
      </CardContent>
      <CardContent className={classes.mailExtensionFields}>
        <TextField
          onChange={onUpdateField}
          fullWidth
          name="famillyLongName"
          value={famillyLongName}
          label={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.famillyLongName')}
          placeholder={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.famillyLongName')}
        />
      </CardContent>
    </Card>
  );
};

ExtensionMail.propTypes = {
  updateCurrentextension: PropTypes.func.isRequired,
  emailExtensionDataInfos: PropTypes.object.isRequired,
};

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
    extension: '',
    structureId: null,
    entityShortName: '',
    entityLongName: '',
    famillyShortName: '',
    famillyLongName: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [isAddMailExtensionAction, setIsAddMailExtensionAction] = useState(false);
  const [isDeleteMailExtensionAction, setIsDeleteMailExtensionAction] = useState(false);
  const openModal = ({
    extensionId,
    extension,
    structureId,
    entityShortName,
    entityLongName,
    famillyShortName,
    famillyLongName,
    isDeleteAction = false,
  }) => {
    setIsDeleteMailExtensionAction(isDeleteAction);
    if (extensionId !== undefined) {
      setCurrentAsam({
        _id: extensionId,
        extension,
        structureId,
        entityShortName,
        entityLongName,
        famillyShortName,
        famillyLongName,
      });
      setIsAddMailExtensionAction(false);
    } else {
      setIsAddMailExtensionAction(true);
    }
    setModalOpen(true);
  };

  const resetAsamState = () =>
    setCurrentAsam({
      _id: null,
      extension: '',
      structureId: null,
      entityShortName: '',
      entityLongName: '',
      famillyShortName: '',
      famillyLongName: '',
    });
  const updateCurrentAsam = ({
    extensionId,
    structureId,
    extension,
    entityShortName,
    entityLongName,
    famillyShortName,
    famillyLongName,
  }) => {
    setCurrentAsam({
      _id: extensionId || null,
      extension,
      structureId: structureId || null,
      entityShortName,
      entityLongName,
      famillyShortName,
      famillyLongName,
    });
  };
  const closeModal = () => {
    setModalOpen(false);
    setIsAddMailExtensionAction(false);
    setIsDeleteMailExtensionAction(false);
    resetAsamState();
  };

  const [structureSearchText, setStructureSearchText] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    if (isAddMailExtensionAction) {
      Meteor.call(
        'asam.addNewAsam',
        {
          extension: currentAsam.extension,
          entiteNomCourt: currentAsam.entityShortName,
          entiteNomLong: currentAsam.entityLongName,
          familleNomCourt: currentAsam.famillyShortName,
          familleNomLong: currentAsam.famillyLongName,
          structureId: currentAsam.structureId,
        },
        (err) => {
          if (err) msg.error(err.reason || err.message);
          else {
            msg.success(i18n.__('api.methods.operationSuccessMsg'));
          }
          closeModal();
        },
      );

      closeModal();
    } else if (!isDeleteMailExtensionAction) {
      Meteor.call(
        'asam.assignStructureToAsam',
        {
          structureId: currentAsam.structureId === null ? '' : currentAsam.structureId,
          extensionId: currentAsam._id,
          extension: currentAsam.extension,
          entiteNomCourt: currentAsam.entityShortName,
          entiteNomLong: currentAsam.entityLongName,
          familleNomCourt: currentAsam.famillyShortName,
          familleNomLong: currentAsam.famillyLongName,
        },
        (err) => {
          if (err) msg.error(err.reason || err.message);
          else {
            msg.success(i18n.__('api.methods.operationSuccessMsg'));
          }
          closeModal();
        },
      );
    } else {
      Meteor.call('asam.deleteAsam', { extensionId: currentAsam._id }, (err) => {
        if (err) msg.error(err.reason || err.message);
        else msg.success(i18n.__('api.methods.operationSuccessMsg'));
        closeModal();
      });
    }
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
                title={
                  !isAddMailExtensionAction && !isDeleteMailExtensionAction
                    ? `${i18n.__('pages.AdminAsamExtensionsManagementPage.modal.title')} "${currentAsam.extension}"`
                    : !isDeleteMailExtensionAction
                    ? `${i18n.__('pages.AdminAsamExtensionsManagementPage.modal.addEmailExtension')}"`
                    : `${i18n.__('pages.AdminAsamExtensionsManagementPage.modal.deleteExtensionEmailTitle')} "${
                        currentAsam.extension
                      }"`
                }
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
                <CardContent style={{ display: !isDeleteMailExtensionAction ? 'block' : 'none' }}>
                  <StructureSelectAutoComplete
                    style={{ width: '100%' }}
                    flatData={structures}
                    loading={!structuresLoaded}
                    noOptionsText={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.noOptions')}
                    onChange={(event, newValue) => {
                      setCurrentAsam((asam) => ({ ...asam, structureId: newValue?._id }));
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
                        label={
                          currentAsam.structureId
                            ? getStructure(currentAsam.structureId)?.name
                            : i18n.__('pages.AdminAsamExtensionsManagementPage.modal.noOptions')
                        }
                        placeholder={i18n.__('pages.AdminAsamExtensionsManagementPage.modal.noOptions')}
                      />
                    )}
                  />
                </CardContent>
                <CardContent style={{ display: !isDeleteMailExtensionAction ? 'block' : 'none' }}>
                  <ExtensionMail updateCurrentextension={updateCurrentAsam} emailExtensionDataInfos={currentAsam} />
                </CardContent>
                <DialogContent style={{ display: !isDeleteMailExtensionAction ? 'none' : 'block' }}>
                  <DialogContentText id="alert-dialog-description">
                    {`${i18n.__('pages.AdminAsamExtensionsManagementPage.modal.confirmMsg')} "${
                      currentAsam.extension
                    }" ?`}
                  </DialogContentText>
                </DialogContent>
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
                icon: AddIcon,
                tooltip: i18n.__('pages.AdminAsamExtensionsManagementPage.actions.addMailExtension'),
                isFreeAction: true,
                onClick: (event, rowData) => {
                  openModal({
                    extensionId: rowData._id,
                    extension: rowData.extension,
                    structureId: rowData.structureId || null,
                  });
                },
              },
              {
                icon: EditIcon,
                tooltip: i18n.__('pages.AdminAsamExtensionsManagementPage.actions.assignStructure'),
                onClick: (event, rowData) => {
                  // console.log({ rowData });
                  openModal({
                    extensionId: rowData._id,
                    extension: rowData.extension || '',
                    structureId: rowData.structureId || null,
                    entityShortName: rowData.entiteNomCourt || '',
                    entityLongName: rowData.entiteNomLong || '',
                    famillyShortName: rowData.familleNomCourt || '',
                    famillyLongName: rowData.familleNomLong || '',
                  });
                },
              },
              {
                icon: ClearIcon,
                tooltip: i18n.__('pages.AdminAsamExtensionsManagementPage.actions.unassignStructure'),
                onClick: (event, rowData) => unassign(rowData),
              },
              {
                icon: DeleteIcon,
                tooltip: i18n.__('pages.AdminAsamExtensionsManagementPage.actions.deleteMailExtension'),
                onClick: (event, rowData) => {
                  openModal({
                    extensionId: rowData._id,
                    extension: rowData.extension || '',
                    structureId: rowData.structureId || null,
                    entityShortName: rowData.entiteNomCourt || '',
                    entityLongName: rowData.entiteNomLong || '',
                    famillyShortName: rowData.familleNomCourt || '',
                    famillyLongName: rowData.familleNomLong || '',
                    isDeleteAction: true,
                  });
                },
              },
            ]}
          />
        </Container>
      </div>
    </Fade>
  );
};

export default AdminAsamExtensionsManagementPage;
