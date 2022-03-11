import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import Services from '../../../api/services/services';
import Categories from '../../../api/categories/categories';

import ServiceDetailsList from './ServiceDetailsList';

const useStyles = makeStyles((theme) => ({
  categoryItem: {
    flexGrow: 1,
    marginRight: 'auto',
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
  const classes = useStyles();
  const data = useTracker(() => {
    const servicesHandle = Meteor.subscribe('services.offline');
    const servicesReady = !servicesHandle.ready();
    const services = Services.find().fetch();
    const categoriesHandle = Meteor.subscribe('categories.all');
    const categoriesReady = !categoriesHandle.ready();
    const categories = Categories.find({}, { sort: { name: 1 } }).fetch();
    return {
      ready: servicesReady && categoriesReady,
      services,
      categories,
    };
  });

  const createServicesTree = () => {
    const servicesTree = {};
    data.services.forEach((service) => {
      if (!servicesTree[service.categories[0]]) {
        servicesTree[service.categories[0]] = [service];
      } else {
        servicesTree[service.categories[0]].push(service);
      }
    });
    return Object.keys(servicesTree).map((category) => ({
      category: Categories.findOne({ _id: category }),
      services: servicesTree[category],
    }));
  };

  return (
    <Grid item xs={12} sm={4} md={7} spacing={2}>
      {createServicesTree().map(
        ({ services, category }) =>
          !!category && (
            <Grid
              justifyContent="center"
              alignItems="flex-start"
              className={classes.categoryItem}
              container
              item
              md={12}
              spacing={4}
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
