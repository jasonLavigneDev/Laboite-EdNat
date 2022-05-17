import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
// import OpenWithIcon from '@material-ui/icons/OpenWith';

import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import CardHeader from '@material-ui/core/CardHeader';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import FavButton from './FavButton';

import { isUrlExternal } from '../../utils/utilsFuncs';
import { getServiceInternalUrl } from '../../../api/services/utils';

const useStyles = makeStyles((theme) => ({
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
  const classes = useStyles();
  const favorite = favAction === 'fav';
  const isAddressBook = service._id === 'addressbook';
  const isEvents = service._id === 'events';
  const isPoll = service._id === 'polls';
  const isBookmark = service._id === 'bookmarks';

  const isExternal = isUrlExternal(service.url);
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
    <Link to={service.url.replace(Meteor.absoluteUrl(), '/')} tabIndex={-1}>
      <Button size="large" className={classes.buttonText} variant="contained">
        {i18n.__('components.ServiceDetails.runServiceButtonLabel')}
      </Button>
    </Link>
  );
  const inactiveButton = (
    <Button size="large" disabled className={classes.buttonText} variant="contained">
      {i18n.__('pages.SingleServicePage.inactive')}
    </Button>
  );

  return (
    <Card className={classes.card}>
      {/* <CardHeader
        className={handleClasseName}
        action={(
          <IconButton color="primary">
            <OpenWithIcon />
          </IconButton>
        )}
      /> */}
      <Tooltip
        title={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
        aria-label={i18n.__('components.ServiceDetails.singleServiceButtonLabel')}
      >
        <Link to={getServiceInternalUrl({ service })} className={classes.noUnderline}>
          <CardHeader
            className={classes.cardHeader}
            avatar={
              isAddressBook ? (
                service.logo
              ) : isEvents ? (
                service.logo
              ) : isPoll ? (
                service.logo
              ) : isBookmark ? (
                service.logo
              ) : (
                <CardMedia className={classes.cardMedia} component="img" alt={service.title} image={service.logo} />
              )
            }
            title={service.title}
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
      {!isAddressBook && !isEvents && !isPoll && !isBookmark && (
        <CardContent className={isShort ? classes.cardContentMobile : classes.cardContent}>
          {!isShort && <Typography variant="body1">{service.description}</Typography>}
          {/* <Paper variant="elevation"  className={classes.paperChip}>
          {service.categories.map((cat) => {
            const currentCategory = categories.find((categ) => categ._id === cat);
            return (
              <Chip
                size="small"
                className={classes.chip}
                key={currentCategory._id}
                label={currentCategory.name}
                variant="outlined"
                color={catList.includes(currentCategory._id) ? 'primary' : 'default'}
                onClick={() => updateCategories(currentCategory._id)}
              />
            );
          })}
        </Paper> */}
          <div className={isShort ? classes.cardActionShort : classes.cardActions}>
            {service.state === 5 ? inactiveButton : isExternal ? openButton : linkButton}

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
