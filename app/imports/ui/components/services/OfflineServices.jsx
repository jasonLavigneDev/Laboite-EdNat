import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import Services from '../../../api/services/services';
import Categories from '../../../api/categories/categories';

import ServiceDetailsList from './ServiceDetailsList';
import { useAppContext } from '../../contexts/context';

const useStyles = (isMobile) =>
  makeStyles((theme) => ({
    categoryItem: {
      flexGrow: 1,
      width: isMobile ? '100%' : null,
      margin: isMobile ? 'auto' : null,
      background: theme.palette.primary.light,
      marginTop: '50px',
      paddingTop: '15px',
      position: 'relative',
      '& > .MuiChip-root': {
        position: 'absolute',
        top: '-15px',
      },
    },
    categoryItemTitle: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    serviceItem: {},
    cardGrid: {
      marginBottom: '0px',
    },
  }));

function OfflineServices() {
  const [{ isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const data = useTracker(() => {
    const servicesHandle = Meteor.subscribe('services.offline');
    const servicesReady = !servicesHandle.ready();
    const categoriesHandle = Meteor.subscribe('categories.all');
    const categoriesReady = !categoriesHandle.ready();
    return {
      ready: servicesReady && categoriesReady,
      categories: Categories.find({}, { sort: { name: 1 } })
        .fetch()
        .map((category) => {
          return {
            category,
            services: Services.find({ 'categories.0': category._id }, { sort: { name: 1 } }).fetch(),
          };
        }),
    };
  });

  return (
    <Grid item xs={12} sm={4} md={7}>
      {data.categories.map(
        ({ services, category }) =>
          !!category &&
          !!services.length && (
            <Grid
              justifyContent="center"
              alignItems="stretch"
              className={classes.categoryItem}
              container
              xs={12}
              md={12}
              spacing={2}
            >
              <Chip color="primary" label={category.name} />
              {services.map((service) => (
                <Grid className={classes.serviceItem} item xs={12} md={6} lg={4} key={service._id}>
                  <ServiceDetailsList service={service} />
                </Grid>
              ))}
            </Grid>
          ),
      )}
    </Grid>
  );
}

export default OfflineServices;
