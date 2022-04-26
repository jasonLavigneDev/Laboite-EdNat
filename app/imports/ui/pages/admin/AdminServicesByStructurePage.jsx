import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Spinner from '../../components/system/Spinner';
import Services from '../../../api/services/services';
import StructureSelect from '../../components/structures/StructureSelect';
import { useStructure, useAdminSelectedStructure } from '../../../api/structures/hooks';
import AdminServicesTable from '../../components/admin/AdminServicesTable';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(3),
  },
  marginTop: {
    marginTop: theme.spacing(3),
  },
}));

const AdminServicesByStructurePage = () => {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles();
  const userStructure = useStructure();

  const [selectedStructureId, setSelectedStructureId] = useState(
    userStructure && userStructure._id ? userStructure._id : '',
  );
  const {
    loading: structuresLoading,
    selectedStructure,
    structures,
  } = useAdminSelectedStructure({ selectedStructureId, setSelectedStructureId });

  const { loading: servicesLoading, services } = useTracker(() => {
    const subName = 'services.structure.ids';
    const structureIds = [selectedStructureId];
    const _servicesHandle = Meteor.subscribe(subName, { structureIds });
    const _services = Services.findFromPublication(subName, {}, { sort: { title: 1 } }).fetch();
    return { loading: !_servicesHandle.ready(), services: _services };
  }, [selectedStructureId, selectedStructureId != null]);

  return (
    <Fade in>
      <Container className={classes.root}>
        {structuresLoading ? (
          <Spinner />
        ) : (
          <Grid container spacing={12}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>
                {i18n.__('pages.AdminServicesByStructurePage.title')}{' '}
                {selectedStructure && selectedStructure._id && selectedStructure.name}
              </Typography>
            </Grid>
            <Grid item md={12} className={classes.marginTop}>
              <StructureSelect
                structures={structures}
                selectedStructureId={selectedStructureId}
                setSelectedStructureId={setSelectedStructureId}
              />
            </Grid>
            <Grid item md={12} className={classes.marginTop}>
              {servicesLoading ? (
                <Spinner />
              ) : (
                <AdminServicesTable
                  services={services}
                  loading={servicesLoading}
                  selectedStructure={selectedStructure}
                />
              )}
            </Grid>
          </Grid>
        )}
      </Container>
    </Fade>
  );
};

export default AdminServicesByStructurePage;
