import React, { useContext, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';

import { Typography, Fade } from '@material-ui/core';
import ServiceDetails from '../components/services/ServiceDetails';
import Spinner from '../components/system/Spinner';
import { Context } from '../contexts/context';
import Services from '../../api/services/services';

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  chip: {
    margin: theme.spacing(1),
  },
  badge: { position: 'inherit' },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

function ServicesPage({ services, ready }) {
  const classes = useStyles();
  const [{ user, loadingUser }] = useContext(Context);
  const favs = loadingUser ? [] : user.favServices;

  const filterServices = (service) => favs.find((serviceId) => serviceId === service._id);

  console.log('favs', favs);

  return (
    <>
      {!ready ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container className={classes.cardGrid}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={12} md={12}>
                <Typography variant="h4">{i18n.__('pages.PersonalSpace.welcome')}</Typography>
              </Grid>
              {favs.length > 0 ? (
                services
                  .filter((service) => filterServices(service))
                  .map((service) => (
                    <Grid className={classes.gridItem} item key={service._id} xs={12} sm={6} md={4} lg={4}>
                      <ServiceDetails service={service} favAction="unfav" isShort />
                    </Grid>
                  ))
              ) : (
                <Typography>{i18n.__('pages.PersonalSpace.noFavYet')}</Typography>
              )}
            </Grid>
          </Container>
        </Fade>
      )}
    </>
  );
}

ServicesPage.propTypes = {
  services: PropTypes.arrayOf(PropTypes.object).isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const servicesHandle = Meteor.subscribe('services.all');
  const services = Services.find({}, { sort: { title: 1 } }).fetch();
  const ready = servicesHandle.ready();
  return {
    services,
    ready,
  };
})(ServicesPage);
