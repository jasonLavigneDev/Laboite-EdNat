import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html';
import i18n from 'meteor/universe:i18n';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Services from '../../../api/services/services';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import Categories from '../../../api/categories/categories';
import DisplayButton from '../../components/services/DisplayButton';
import { sanitizeParameters } from '../../../api/utils';

const useStyles = makeStyles()((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(3),
  },
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    marginBottom: theme.spacing(3),
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    '& p': {
      marginTop: 0,
      marginBottom: 0,
    },
  },
  screenshot: {
    width: '100%',
  },
  category: {
    marginLeft: theme.spacing(1),
  },
  fab: {},
}));

const SingleServicePage = ({ service = {}, ready, categories = [] }) => {
  const history = useHistory();
  const { classes } = useStyles();
  const [{ user = {}, isMobile }] = useAppContext();
  const [loading, setLoading] = useState(false);
  const favorite = user.favServices && user.favServices.find((f) => f === service._id);

  const handleFavorite = () => {
    if (favorite) {
      setLoading(true);
      Meteor.call('services.unfavService', { serviceId: service._id }, (err) => {
        setLoading(false);
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.unfavSuccessMsg'));
        }
      });
    } else {
      setLoading(true);
      Meteor.call('services.favService', { serviceId: service._id }, (err) => {
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

  const favButton = (
    <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
      <Button variant="outlined" color="primary" disabled={loading} className={classes.fab} onClick={handleFavorite}>
        {favorite ? <RemoveIcon fontSize="large" /> : <AddIcon fontSize="large" />}
      </Button>
    </Tooltip>
  );

  return (
    <Fade in>
      <Container className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} className={classes.flex}>
            <Button onClick={goBack} color="primary" startIcon={<ArrowBack />}>
              {i18n.__('pages.SingleServicePage.backToList')}
            </Button>
            {isMobile && favButton}
          </Grid>
          <Grid item xs={12} sm={12} md={6} className={classes.cardGrid}>
            <div className={classes.titleContainer}>
              <img className={classes.logo} alt={`logo for ${service.title}`} src={service.logo} />
              <div className={classes.title}>
                <Typography variant="h5">{service.title}</Typography>
                <Typography variant="h6">{service.usage}</Typography>
                <Typography>
                  {i18n.__('pages.SingleServicePage.propulsedBy')} {service.team}
                </Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={12} md={6} className={classes.favoriteButton}>
            {!isMobile && favButton}
            <DisplayButton service={service} />
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
                color="secondary"
                // style={{ backgroundColor: categ.color }}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
            <Typography className={classes.smallTitle} variant="h5">
              Description
            </Typography>
            <div
              className={classes.content}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(service.content, sanitizeParameters) }}
            />
          </Grid>
          {Boolean(service.screenshots?.length) && (
            <>
              <Grid item xs={12} sm={12} md={12}>
                <Typography className={classes.smallTitle} variant="h5">
                  {i18n.__('pages.SingleServicePage.screenshots')} ({service.screenshots.length})
                </Typography>
              </Grid>
              {service.screenshots &&
                service.screenshots.map((screen, i) => (
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
      params: { slug, structure = '' },
    },
  }) => {
    const subService = Meteor.subscribe('services.one', { slug, structure });
    const service = Services.findOne({ slug, state: { $ne: 10 } }) || {};
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
