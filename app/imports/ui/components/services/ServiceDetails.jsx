import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import FavButton from './FavButton';

import { getServiceInternalUrl } from '../../../api/services/utils';
import DisplayButton from './DisplayButton';

const useStyles = makeStyles()((theme) => ({
  cardActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cardActionShort: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'end',
    width: '100%',
  },
  cardHeader: {
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 24,
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    maxWidth: '50px',
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
    backgroundColor: theme.palette.primary.light,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 24,
  },
  cardContentMobile: {
    flexGrow: 1,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 0,
    display: 'flex',
    marginTop: 10,
  },
  paperChip: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: 'transparent',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  noUnderline: {
    textDecoration: 'none',
    outline: 'none',
    '&:focus, &:hover': {
      backgroundColor: theme.palette.backgroundFocus.main,
    },
    display: 'flex',
    flexGrow: 100,
  },
  fab: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.tertiary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
    },
  },
}));

function ServiceDetails({ service, favAction, isShort }) {
  const { classes } = useStyles();
  const favorite = favAction === 'fav';
  const isAddressBook = service._id === 'addressbook';
  const isEvents = service._id === 'events';
  const isPoll = service._id === 'polls';
  const isBookmark = service._id === 'bookmarks';
  const isArticles = service._id === 'articles';
  const isForms = service._id === 'forms';

  return (
    <Card className={classes.card}>
      <Tooltip
        title={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
        aria-label={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
      >
        <Link to={getServiceInternalUrl({ service })} className={classes.noUnderline}>
          <CardHeader
            className={classes.cardHeader}
            avatar={
              isAddressBook || isEvents || isPoll || isBookmark ? (
                service.logo
              ) : isArticles ? (
                service.logo
              ) : isForms ? (
                service.logo
              ) : (
                <CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />
              )
            }
            title={`${service.title}${service.isBeta ? i18n.__('components.ServiceDetails.betaVersion') : ''}`}
            titleTypographyProps={{
              variant: 'h6',
              color: 'primary',
              className: classes.title,
            }}
            subheader={service.usage}
            subheaderTypographyProps={{ variant: 'body2', color: 'primary' }}
          />
        </Link>
      </Tooltip>
      {!isAddressBook && !isEvents && !isPoll && !isBookmark && !isArticles && !isForms && (
        <CardContent className={isShort ? classes.cardContentMobile : classes.cardContent}>
          {!isShort && (
            <Typography sx={{ height: '4vw' }} variant="body1">
              {service.description}
            </Typography>
          )}
          <div className={isShort ? classes.cardActionShort : classes.cardActions}>
            <DisplayButton service={service} />
            {!!favAction && <FavButton classesArray={[classes.fab]} service={service} favorite={favorite} />}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

ServiceDetails.defaultProps = {
  favAction: null,
};

ServiceDetails.propTypes = {
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  favAction: PropTypes.string,
  isShort: PropTypes.bool.isRequired,
};

export default ServiceDetails;
