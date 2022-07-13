import React from 'react';
import i18n from 'meteor/universe:i18n';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import AppSettings from '../../../api/appsettings/appsettings';

const useStyle = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
    marginTop: 30,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    outline: 'none',
    marginRight: 25,
    fontFamily: 'WorkSansBold',
  },
}));

const SiteInMaintenance = ({ appsettings, ready }) => {
  const classes = useStyle();
  return (
    <>
      {ready ? (
        <>
          <Typography className={classes.title} variant="h5" color="inherit">
            {i18n.__('components.SiteInMaintenance.maintenanceInProgress')}
          </Typography>

          <Typography className={classes.paragraph} paragraph color="inherit">
            {i18n.__(appsettings.textMaintenance)}
          </Typography>
        </>
      ) : null}
    </>
  );
};

export default withTracker(() => {
  const subSettings = Meteor.subscribe('appsettings.all');
  const appsettings = AppSettings.findOne();
  const ready = subSettings.ready();
  return {
    appsettings,
    ready,
  };
})(SiteInMaintenance);

SiteInMaintenance.defaultProps = {
  appsettings: {},
};

SiteInMaintenance.propTypes = {
  appsettings: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
