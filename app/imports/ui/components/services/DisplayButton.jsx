import React from 'react';

import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import Button from '@mui/material/Button';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { isUrlExternal } from '../../utils/utilsFuncs';
import { eventTracking } from '../../../api/analyticsEvents/eventsTracking';
import AnalyticsEvents from '../../../api/analyticsEvents/analyticsEvents';

const useStyles = makeStyles()((theme) => ({
  buttonText: {
    textTransform: 'none',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.tertiary.main,
    fontWeight: 'bold',
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.tertiary.main,
    },
  },
}));

function DisplayButton({ service }) {
  const { classes } = useStyles();

  const onLaunchService = (external) => {
    if (external) {
      window.open(service.url, '_blank', 'noreferrer,noopener');
    }
    eventTracking({
      target: AnalyticsEvents.targets.SERVICE,
      content: service.title,
    });
  };

  const isExternalService = isUrlExternal(service.url);
  const openButton = (
    <Button
      size="large"
      className={classes.buttonText}
      variant="contained"
      onClick={() => window.open(service.url, '_blank', 'noreferrer,noopener')}
    >
      {i18n.__('components.ServiceDetails.runServiceButtonLabel')}
    </Button>
  );
  const linkButton = (
    <Link to={service.url.replace(Meteor.absoluteUrl(), '/')} tabIndex={-1} onClick={onLaunchService}>
      <Button size="large" className={classes.buttonText} variant="contained">
        {i18n.__('components.ServiceDetails.runServiceButtonLabel')}
      </Button>
    </Link>
  );

  const serviceStateButton = (text) => (
    <Button size="large" disabled className={classes.buttonText} variant="contained">
      {text}
    </Button>
  );

  if (service.state === 5) return serviceStateButton(i18n.__('pages.SingleServicePage.inactive'));

  if (service.state === 15) return serviceStateButton(i18n.__('pages.SingleServicePage.maintenance'));

  if (isExternalService) return openButton;

  return linkButton;
}

DisplayButton.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default DisplayButton;
