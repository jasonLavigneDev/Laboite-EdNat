import React from 'react';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import { useHistory } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { useMatomo } from '@datapunt/matomo-tracker-react';

import Tooltip from '@mui/material/Tooltip';
import BlockIcon from '@mui/icons-material/Block';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FavButton from './FavButton';
import { isUrlExternal } from '../../utils/utilsFuncs';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles()((theme) => ({
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
  badge: {
    backgroundColor: theme.palette.background.paper,
  },
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    cursor: 'pointer',
  },
  typoTruncate: {
    width: '100%',
    textAlign: 'center',
  },
  disabled: {
    filter: 'grayscale(1)',
    WebKitFilter: 'grayscale(1)',
  },
}));

export default function ServiceDetails({ service, favAction, noIconMode = false }) {
  const { classes } = useStyles();
  const history = useHistory();
  const isDisabled = service.state === 5;

  const [{ isMobile }] = useAppContext();
  const { trackEvent } = useMatomo();
  const favorite = favAction === 'fav';

  const isExternal = isUrlExternal(service.url);
  const launchService = () => {
    trackEvent({
      category: 'signin-page',
      action: 'open-service',
      name: `Ouverture de ${service.title}`, // optional
    });
    if (isExternal) {
      window.open(service.url, '_blank', 'noreferrer,noopener');
    } else {
      history.push(service.url.replace(Meteor.absoluteUrl(), '/'));
    }
  };

  const handleLaunchService = () => {
    if (isDisabled) msg.error(i18n.__('pages.SingleServicePage.inactive'));
    else launchService();
  };

  return (
    <>
      {isMobile && !noIconMode ? (
        <Box display="flex" alignItems="center" flexDirection="column" width="100%">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            badgeContent={
              isDisabled && (
                <Tooltip title={i18n.__('pages.SingleServicePage.inactive')}>
                  <BlockIcon color="error" />
                </Tooltip>
              )
            }
          >
            <Tooltip title={service.title} aria-label={service.title}>
              <Avatar
                className={`${classes.avatar} ${isDisabled ? classes.disabled : ''}`}
                alt={service.title}
                src={service.logo}
                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                onClick={handleLaunchService}
              />
            </Tooltip>
          </Badge>
          <Typography noWrap className={classes.typoTruncate}>
            {service.title}
          </Typography>
        </Box>
      ) : (
        <Card className={classes.card}>
          <CardActionArea onClick={launchService} disabled={isDisabled}>
            <CardHeader
              classes={{ action: classes.action }}
              avatar={
                <CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />
              }
              title={service.title}
              titleTypographyProps={{
                variant: 'h6',
                color: isDisabled ? 'textSecondary' : 'primary',
              }}
              subheader={service.usage}
              subheaderTypographyProps={{ variant: 'body2', color: isDisabled ? 'textSecondary' : 'primary' }}
              action={!!favAction && <FavButton classes={[classes.fab]} service={service} favorite={favorite} />}
            />
          </CardActionArea>
        </Card>
      )}
    </>
  );
}

ServiceDetails.defaultProps = {
  favAction: null,
  noIconMode: false,
};

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  favAction: PropTypes.string,
  noIconMode: PropTypes.bool,
};
