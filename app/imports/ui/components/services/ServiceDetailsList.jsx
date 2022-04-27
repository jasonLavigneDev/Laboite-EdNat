import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
// import OpenWithIcon from '@material-ui/icons/OpenWith';

import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import i18n from 'meteor/universe:i18n';
import { isUrlExternal } from '../../utils/utilsFuncs';

const useStyles = makeStyles((theme) => ({
  action: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'auto',
    height: '100%',
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 5,
    '& .MuiCardHeader-root': {
      padding: 8,
    },
  },
  cardMedia: {
    maxWidth: '50px',
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
  },
  fab: {
    '&:hover': {
      color: 'red',
    },
  },
}));
export default function ServiceDetails({ service, favAction }) {
  const classes = useStyles();
  const history = useHistory();
  const favorite = favAction === 'fav';

  const handleFavorite = (e) => {
    e.stopPropagation(); // To prevent the CardActionArea onClick to launch
    Meteor.call(`services.${!favorite ? 'un' : ''}favService`, { serviceId: service._id }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__(`components.ServiceDetails.${!favorite ? 'un' : ''}favSuccessMsg`));
      }
    });
  };

  const favButtonLabel = !favorite
    ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
    : i18n.__('components.ServiceDetails.favButtonLabelFav');

  const isExternal = isUrlExternal(service.url);
  const launchService = () => {
    if (isExternal) {
      window.open(service.url, '_blank', 'noreferrer,noopener');
    } else {
      history.push(service.url.replace(Meteor.absoluteUrl(), '/'));
    }
  };

  return (
    <Card className={classes.card}>
      <CardActionArea onClick={launchService} disabled={service.state === 5}>
        <CardHeader
          classes={{ action: classes.action }}
          avatar={<CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />}
          title={service.title}
          titleTypographyProps={{
            variant: 'h6',
            color: service.state === 5 ? 'textSecondary' : 'primary',
          }}
          subheader={service.usage}
          subheaderTypographyProps={{ variant: 'body2', color: service.state === 5 ? 'textSecondary' : 'primary' }}
          action={
            !!favAction && (
              <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
                <Button
                  // startIcon={favorite ? <BookmarkBorderIcon /> : <BookmarkIcon />}
                  variant="outlined"
                  color="primary"
                  size="large"
                  className={classes.fab}
                  onClick={handleFavorite}
                >
                  {favorite ? <AddIcon /> : <RemoveIcon />}
                  {/* {i18n.__(`components.ServiceDetails.${favorite ? '' : 'un'}pin`)} */}
                </Button>
              </Tooltip>
            )
          }
        />
      </CardActionArea>
    </Card>
  );
}

ServiceDetails.defaultProps = {
  favAction: null,
};

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  favAction: PropTypes.string,
};
