import React, { useEffect } from 'react';
import sanitizeHtml from 'sanitize-html';
import { makeStyles } from 'tss-react/mui';
import { withTracker } from 'meteor/react-meteor-data';
import { useHistory } from 'react-router-dom';

import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import AppSettings from '../../../api/appsettings/appsettings';
import TopBar from '../../components/menus/TopBar';
import Footer, { LEGAL_ROUTES } from '../../components/menus/Footer';
import { useAppContext } from '../../contexts/context';
import Spinner from '../../components/system/Spinner';
import { sanitizeParameters } from '../../../api/utils';

const useStyles = makeStyles()(() => ({
  container: {
    paddingTop: 80,
    paddingBottom: 60,
    minHeight: 'calc(100vh - 64px)',
  },
}));

const LegalPage = ({ data, dataKey, ready }) => {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles();
  const history = useHistory();

  useEffect(() => {
    if (data && data.external === true && data.link) {
      window.open(data.link, '_blank', 'noreferrer,noopener');
    }
  }, [data]);

  return (
    <>
      <TopBar publicMenu root="/" />
      <Fade in>
        <Container className={classes.container}>
          {!ready && <Spinner full />}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button startIcon={<ArrowBackIcon />} color="primary" onClick={history.goBack}>
                {i18n.__('pages.SignIn.back')}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant={isMobile ? 'h5' : 'h3'}>{i18n.__(`pages.LegalPage.${dataKey}`)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                className={classes.text}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.content, sanitizeParameters) }}
              />
            </Grid>
          </Grid>
        </Container>
      </Fade>
      <Footer />
    </>
  );
};
export default withTracker(
  ({
    match: {
      params: { legalKey },
    },
  }) => {
    const indexOfValue = Object.values(LEGAL_ROUTES).indexOf(legalKey);
    const dataKey = Object.keys(LEGAL_ROUTES)[indexOfValue];

    const subSettings = Meteor.subscribe(`appsettings.${dataKey}`);
    const appsettings = AppSettings.findOne() || {};
    const data = appsettings[dataKey] || {};
    const ready = subSettings.ready();

    return {
      data,
      dataKey,
      ready,
    };
  },
)(LegalPage);

LegalPage.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  dataKey: PropTypes.string.isRequired,
  ready: PropTypes.bool.isRequired,
};
