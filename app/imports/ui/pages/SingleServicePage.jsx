import React, { useContext, useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { useHistory } from 'react-router-dom';
import {
  Container, makeStyles, Button, Typography, Grid, Chip, Tooltip, Fade,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Services from '../../api/services/services';
import Spinner from '../components/Spinner';
import { Context } from '../contexts/context';
import Categories from '../../api/categories/categories';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },

  backButton: {
    marginTop: -30,
  },
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    marginBottom: theme.spacing(3),
  },
  favoriteButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    marginBottom: theme.spacing(3),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    height: 100,
    width: 100,
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
  },
  title: {
    marginLeft: theme.spacing(3),
  },
  smallTitle: {
    marginBottom: theme.spacing(1),
  },
  content: {
    textAlign: 'justify',
    marginBottom: theme.spacing(3),
  },
  screenshot: {
    width: '100%',
  },
  category: {
    marginLeft: theme.spacing(1),
  },
  fab: {
    '&:hover': {
      color: 'red',
    },
  },
}));

const SingleServicePage = ({ service = [], ready, categories = [] }) => {
  const history = useHistory();
  const classes = useStyles();
  const [{ user = {} }] = useContext(Context);
  const [loading, setLoading] = useState(false);
  const favorite = user.favServices && user.favServices.find((f) => f === service._id);

  const handleFavorite = () => {
    if (favorite) {
      setLoading(true);
      Meteor.call('users.unfavService', { serviceId: service._id }, (err) => {
        setLoading(false);
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.unfavSuccessMsg'));
        }
      });
    } else {
      setLoading(true);
      Meteor.call('users.favService', { serviceId: service._id }, (err) => {
        setLoading(false);
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.favSuccessMsg'));
        }
      });
    }
  };

  const goBack = () => {
    history.goBack();
  };

  if (!ready || !service._id) {
    return <Spinner full />;
  }

  const favButtonLabel = favorite
    ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
    : i18n.__('components.ServiceDetails.favButtonLabelFav');

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={2}>
          <Grid item md={12}>
            <Button onClick={goBack} className={classes.backButton} color="primary" startIcon={<ArrowBack />}>
              {i18n.__('pages.SingleServicePage.backToList')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={6} className={classes.cardGrid}>
            <div className={classes.titleContainer}>
              <img className={classes.logo} alt={`logo for ${service.title}`} src={service.logo} />
              <div className={classes.title}>
                <Typography variant="h5">{service.title}</Typography>
                <Typography variant="h6">{service.usage}</Typography>
                <Typography>
                  {i18n.__('pages.SingleServicePage.propulsedBy')}
                  {' '}
                  {service.team}
                </Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={6} className={classes.favoriteButton}>
            <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
              <Button
                variant="text"
                color="primary"
                disabled={loading}
                className={classes.fab}
                onClick={handleFavorite}
              >
                {favorite ? <FavoriteIcon fontSize="large" /> : <FavoriteBorderIcon fontSize="large" />}
              </Button>
            </Tooltip>
            <Button variant="outlined" color="primary" onClick={() => window.open(service.url, '_blank')}>
              {i18n.__('pages.SingleServicePage.open')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
            <Typography className={classes.smallTitle} variant="h5">
              {i18n.__('pages.SingleServicePage.categories')}
            </Typography>
            {categories.map((categ) => (
              <Chip
                className={classes.category}
                key={categ._id}
                label={categ.name}
                color="primary"
                style={{ backgroundColor: categ.color }}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
            <Typography className={classes.smallTitle} variant="h5">
              Description
            </Typography>
            <div className={classes.content} dangerouslySetInnerHTML={{ __html: service.content }} />
          </Grid>
          {Boolean(service.screenshots.length) && (
            <>
              <Grid item xs={12} sm={12} md={12}>
                <Typography className={classes.smallTitle} variant="h5">
                  {i18n.__('pages.SingleServicePage.screenshots')}
                  {' '}
                  (
                  {service.screenshots.length}
                  )
                </Typography>
              </Grid>
              {service.screenshots
                && service.screenshots.map((screen, i) => (
                  <Grid key={Math.random()} item xs={12} sm={6} md={6}>
                    <img className={classes.screenshot} src={screen} alt={`screenshot ${i} for ${service.title}`} />
                  </Grid>
                ))}
            </>
          )}
        </Grid>
      </Container>
    </Fade>
  );
};

export default withTracker(
  ({
    match: {
      params: { slug },
    },
  }) => {
    const subService = Meteor.subscribe('services.one', { slug });
    const service = Services.findOne({ slug }) || {};
    const categories = Categories.find({ _id: { $in: service.categories || [] } }).fetch();
    const ready = subService.ready();
    return {
      service,
      ready,
      categories,
    };
  },
)(SingleServicePage);

SingleServicePage.defaultProps = {
  service: {},
  categories: [],
};

SingleServicePage.propTypes = {
  service: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
  categories: PropTypes.arrayOf(PropTypes.any),
};
