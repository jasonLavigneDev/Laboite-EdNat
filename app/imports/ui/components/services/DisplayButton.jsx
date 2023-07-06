import React from 'react';

import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import Button from '@mui/material/Button';
import i18n from 'meteor/universe:i18n';
import { useHistory } from 'react-router-dom';
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

const disabledStates = [5, 15];
const getButtonTextId = (serviceState) => {
  if (serviceState === 5) return 'pages.SingleServicePage.inactive';
  if (serviceState === 15) return 'pages.SingleServicePage.maintenance';

  return 'components.ServiceDetails.runServiceButtonLabel';
};

function DisplayButton({ service }) {
  const { classes } = useStyles();
  const history = useHistory();
  const isExternalService = isUrlExternal(service.url);

  const onLaunchService = React.useCallback(() => {
    eventTracking({
      target: AnalyticsEvents.targets.SERVICE,
      content: service.title,
    });

    if (isExternalService) {
      window.open(service.url, '_blank', 'noreferrer,noopener');
    } else {
      history.push(service.url.replace(Meteor.absoluteUrl(), '/'));
    }
  }, [history, isExternalService, service?.url, service?.title]);

  return (
    <Button
      size="large"
      className={classes.buttonText}
      variant="contained"
      onClick={onLaunchService}
      disabled={disabledStates.includes(service.state)}
    >
      {i18n.__(getButtonTextId(service.state))}
    </Button>
  );
}

DisplayButton.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default DisplayButton;
