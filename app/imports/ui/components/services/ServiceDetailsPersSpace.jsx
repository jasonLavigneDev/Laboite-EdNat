import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from 'tss-react/mui';
import { useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import RemoveIcon from '@mui/icons-material/Remove';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Zoom from '@mui/material/Zoom';
import PublishIcon from '@mui/icons-material/Publish';

import i18n from 'meteor/universe:i18n';

import { isUrlExternal } from '../../utils/utilsFuncs';

const useStyles = makeStyles()((theme) => ({
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeaderContent: { display: 'grid' },
  cardActions: {
    paddingTop: 0,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  serviceName: {
    color: theme.palette.primary.main,
  },
  serviceNameDiasbled: {
    color: theme.palette.text.disabled,
  },
  actionarea: {
    textDecoration: 'none',
    outline: 'none',
    '&:hover': {
      backgroundColor: theme.palette.backgroundFocus.main,
    },
    flexGrow: 100,
  },
  span: {
    display: 'flex',
    flex: '1 0 auto',
  },
  fab: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.tertiary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
    },
  },
}));

function ServiceDetailsPersSpace({ service, customDrag, isMobile, isSorted, needUpdate, edition }) {
  const { classes } = useStyles();
  const history = useHistory();
  const favButtonLabel = i18n.__('components.ServiceDetails.favButtonLabelNoFav');
  const backToDefaultButtonLabel = i18n.__('components.ServiceDetails.backToDefault');

  const handleFavorite = () => {
    Meteor.call('services.unfavService', { serviceId: service._id }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('components.ServiceDetails.unfavSuccessMsg'));
      }
    });
  };

  const handleClick = () => {
    if (isUrlExternal(service.url)) {
      window.open(service.url, '_blank', 'noreferrer,noopener');
    } else {
      history.push(service.url.replace(Meteor.absoluteUrl(), '/'));
    }
  };

  const handleBackToDefault = () => {
    Meteor.call('personalspaces.backToDefaultElement', { elementId: service._id, type: 'service' }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        needUpdate();
      }
    });
  };

  return (
    <Card className={classes.card}>
      <Tooltip
        TransitionComponent={Zoom}
        enterDelay={600}
        title={
          <>
            <Typography>{service.title}</Typography>
            {i18n.__('pages.PersonalPage.typeApplication')}
          </>
        }
        aria-label={service.title}
      >
        {/* this span is to allow display of tooltip when CardActionArea is disabled 
        (occur when a service is disabled) */}
        <span className={classes.span}>
          <CardActionArea
            className={classes.actionarea}
            disabled={service.state === 5 || service.state === 15 || customDrag}
            onClick={handleClick}
          >
            <CardHeader
              classes={{ content: classes.cardHeaderContent }}
              avatar={<Avatar aria-label="recipe" className={classes.avatar} alt={service.title} src={service.logo} />}
              title={
                <Typography
                  className={
                    service.state === 5 || service.state === 15 ? classes.serviceNameDiasbled : classes.serviceName
                  }
                  gutterBottom
                  noWrap={!isMobile}
                  variant="h6"
                  component="h2"
                >
                  {service.title}
                </Typography>
              }
              subheader={
                service.state === 5 ? (
                  <Typography variant="body2" color="textSecondary" component="p">
                    {i18n.__('pages.SingleServicePage.inactive')}
                  </Typography>
                ) : service.state === 15 ? (
                  <Typography variant="body2" color="textSecondary" component="p">
                    {i18n.__('pages.SingleServicePage.maintenance')}
                  </Typography>
                ) : (
                  ''
                )
              }
            />
          </CardActionArea>
        </span>
      </Tooltip>
      {customDrag && !edition ? (
        <CardActions className={classes.cardActions}>
          {isSorted ? (
            <Tooltip title={backToDefaultButtonLabel} aria-label={backToDefaultButtonLabel}>
              <Button variant="outlined" size="small" className={classes.fab} onClick={handleBackToDefault}>
                <PublishIcon />
              </Button>
            </Tooltip>
          ) : null}
          <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
            <Button variant="outlined" size="small" className={classes.fab} onClick={handleFavorite}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </CardActions>
      ) : null}
    </Card>
  );
}

ServiceDetailsPersSpace.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  customDrag: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isSorted: PropTypes.bool.isRequired,
  needUpdate: PropTypes.func.isRequired,
  edition: PropTypes.bool,
};

ServiceDetailsPersSpace.defaultProps = {
  edition: false,
};

export default ServiceDetailsPersSpace;
