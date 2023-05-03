import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import Container from '@mui/material/Container';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { makeStyles } from 'tss-react/mui';
import Fade from '@mui/material/Fade';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Divider from '@mui/material/Divider';
import { ReactSortable } from 'react-sortablejs';
import Card from '@mui/material/Card';
import Spinner from '../../components/system/Spinner';
import DefaultSpaces from '../../../api/defaultspaces/defaultspaces';
import { useStructure } from '../../../api/structures/hooks';
import Services from '../../../api/services/services';
import Structures from '../../../api/structures/structures';
import CustomSelect from '../../components/admin/CustomSelect';
import PersonalZoneUpdater from '../../components/users/PersonalZoneUpdater';
import { updateStructureSpace } from '../../../api/defaultspaces/methods';
import CustomDialog from '../../components/system/CustomDialog';
import { useBoolean } from '../../utils/hooks';

const useStyles = makeStyles()((theme) => ({
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.secondary,
  },
  saveText: {
    marginLeft: 10,
  },
  divider: {
    marginTop: 10,
    marginBottom: 10,
  },
  listItem: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'lightgray',
    },
  },
  listItemInactive: {
    filter: 'grayscale(1)',
    opacity: '40%',
  },
  inactiveText: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    fontSize: 12,
  },
}));

const AdminStructureSpace = () => {
  const userStructure = useStructure();
  const { classes } = useStyles();
  const [confirmApply, toggleConfirm] = useBoolean(false);

  const [selectedStructureId, setSelectedStructureId] = useState();
  const [isSaving, setIsSaving] = useState(false);

  const updateSelect = (e) => {
    if (e.target.value.trim().length < 1) return;
    setSelectedStructureId(e.target.value);
  };

  const { services, loading, structures, structurespace, servicesList } = useTracker(() => {
    const structuresHandle = Meteor.subscribe('structures.with.all.childs', {
      structureId: userStructure._id,
    });
    const servicesHandle = Meteor.subscribe('services.structure.ids', {
      structureIds: [selectedStructureId || userStructure._id],
    });
    const structureHandle = Meteor.subscribe('defaultspaces.one', {
      structureId: selectedStructureId || userStructure._id,
    });
    const allGlobalServicesHandle = Meteor.subscribe('services.all');
    const space = DefaultSpaces.findOne({ structureId: selectedStructureId || userStructure._id });

    let servicesAdded = [];
    const servicesTotal = Services.find({}, { sort: { title: 1 } }).fetch();
    if (space) {
      space.sorted.forEach(({ elements = [] }) => {
        if (elements) {
          servicesAdded = [
            ...servicesAdded,
            ...servicesTotal.concat(
              elements.filter((item) => item.type === 'service').map((service) => service.element_id),
            ),
          ];
        }
      });
    }

    return {
      structurespace: space,
      loading:
        !servicesHandle.ready() ||
        !structuresHandle.ready() ||
        !structureHandle.ready() ||
        !allGlobalServicesHandle.ready(),
      services: servicesTotal,
      structures: Structures.findFromPublication('structures.with.all.childs').fetch(),
      servicesList: Services.find({ _id: { $nin: servicesAdded || [] } }, { sort: { title: 1 } }).fetch(),
    };
  }, [selectedStructureId]);

  useEffect(() => {
    if (!loading && !structurespace && (selectedStructureId || userStructure._id)) {
      updateStructureSpace.call({
        data: {
          sorted: [],
          structureId: selectedStructureId || userStructure._id,
        },
      });
    }
  }, [selectedStructureId, loading]);

  const handleEditionData = (data) => {
    setIsSaving(true);
    Meteor.call('defaultspaces.updateStructureSpace', { data }, (err) => {
      setIsSaving(false);
      if (err) {
        msg.error(err.reason);
      }
    });
  };

  const applyDefaultSpace = () => {
    toggleConfirm();
    Meteor.call(
      'defaultspaces.applyDefaultSpaceToAllUsers',
      { structureId: selectedStructureId || userStructure._id },
      (error) => {
        if (error) {
          msg.error(error.reason);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <FormControl variant="filled" fullWidth>
              <InputLabel id="structure-label">{i18n.__('pages.AdminDefaultSpacesPage.chooseStructure')} </InputLabel>
              <CustomSelect
                labelWidth={100}
                value={selectedStructureId || userStructure._id}
                error={false}
                onChange={updateSelect}
                options={structures.map((opt) => ({ value: opt._id, label: opt.name }))}
              />
            </FormControl>
            <br />
            <br />
            <Grid container>
              {/* <Grid item xs={12} md={3} className={classes.flexCenter}>
                <Button disabled={isSaving} fullWidth onClick={toggleConfirm} variant="contained" color="primary">
                  {i18n.__('pages.AdminDefaultSpacesPage.applyToEveryone')}
                </Button>
              </Grid> */}
              <Grid item xs={12} md={9} className={classes.flexCenter}>
                <ListItem alignItems="center" className={classes.flexCenter}>
                  {isSaving ? (
                    <CircularProgress size={30} color="secondary" />
                  ) : (
                    <CheckCircleIcon style={{ fontSize: 30 }} />
                  )}
                  <ListItemText
                    className={classes.saveText}
                    primary={i18n.__(`pages.AdminDefaultSpacesPage.isSav${isSaving ? 'ing' : 'ed'}`)}
                  />
                </ListItem>
              </Grid>
              <Grid item xs={12} md={12} className={classes.divider}>
                <Divider />
              </Grid>
              <Grid item xs={3}>
                <ReactSortable
                  className=""
                  list={servicesList.map(({ _id, title, url }) => ({
                    type: 'service',
                    element_id: _id,
                    title,
                    url,
                  }))}
                  setList={() => null}
                  animation={150}
                  forceFallback
                  group={{ name: 'zone', put: true }}
                  sort={false}
                >
                  {servicesList.map((service) => (
                    <Grid
                      item
                      xs={12}
                      key={`link_${service._id}`}
                      className={service.state !== 0 && classes.listItemInactive}
                    >
                      <Card className={classes.listItem}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar alt={service.title} src={service.logo} />
                          </ListItemAvatar>
                          <ListItemText primary={service.title} secondary={service.usage} />
                          {service.state !== 0 && (
                            <div className={classes.inactiveText}>{i18n.__(Services.stateLabels[service.state])}</div>
                          )}
                        </ListItem>
                      </Card>
                    </Grid>
                  ))}
                </ReactSortable>
              </Grid>
              <Grid item xs={9}>
                {structurespace && services && (
                  <PersonalZoneUpdater
                    isLoading={loading}
                    personalspace={structurespace}
                    allServices={services}
                    allGroups={[]}
                    allLinks={[]}
                    appSettingsValues={[]}
                    handleEditionData={handleEditionData}
                    edition
                  />
                )}
              </Grid>
            </Grid>
            <CustomDialog
              nativeProps={{ maxWidth: 'xs' }}
              isOpen={confirmApply}
              title={i18n.__('pages.AdminDefaultSpacesPage.applyToEveryone')}
              content={i18n.__('pages.AdminDefaultSpacesPage.applyText')}
              onCancel={toggleConfirm}
              onValidate={applyDefaultSpace}
            />
          </Container>
        </Fade>
      )}
    </>
  );
};

export default AdminStructureSpace;
