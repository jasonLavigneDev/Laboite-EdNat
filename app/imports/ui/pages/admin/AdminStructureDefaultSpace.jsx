import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import Container from '@material-ui/core/Container';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { makeStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { ReactSortable } from 'react-sortablejs';
import Card from '@material-ui/core/Card';
import Spinner from '../../components/system/Spinner';
import DefaultSpaces from '../../../api/defaultspaces/defaultspaces';
import { useStructure } from '../../../api/structures/hooks';
import Services from '../../../api/services/services';
import Structures from '../../../api/structures/structures';
import CustomSelect from '../../components/admin/CustomSelect';
import PersonalZoneUpdater from '../../components/users/PersonalZoneUpdater';
import { updateStructureSpace } from '../../../api/defaultspaces/methods';

const useStyles = makeStyles((theme) => ({
  saveIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: theme.palette.text.secondary,
  },
  saveText: {
    marginLeft: 10,
  },
  listItem: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'lightgray',
    },
  },
}));

const AdminStructureSpace = () => {
  const userStructure = useStructure();
  const classes = useStyles();

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
              <Grid item xs={3}>
                <Grid item xs={12}>
                  <ListItem alignItems="center" className={classes.saveIndicator}>
                    {isSaving ? (
                      <CircularProgress size={30} color="secondary" />
                    ) : (
                      <CheckCircleIcon style={{ fontSize: 30 }} />
                    )}
                    <ListItemText
                      className={classes.saveText}
                      primary={isSaving ? 'Sauvegarde en cours' : 'Espace sauvegardé'}
                    />
                  </ListItem>
                </Grid>
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
                    <Grid item xs={12} key={`link_${service._id}`}>
                      <Card className={classes.listItem}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar alt={service.title} src={service.logo} />
                          </ListItemAvatar>
                          <ListItemText primary={service.title} secondary={service.usage} />
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
                    handleEditionData={handleEditionData}
                    edition
                  />
                )}
              </Grid>
            </Grid>
          </Container>
        </Fade>
      )}
    </>
  );
};

export default AdminStructureSpace;
