import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import {
  Container, Paper, makeStyles, Typography, Fade, Tab, Tabs, Grid,
} from '@material-ui/core';
import PropTypes from 'prop-types';

import Spinner from '../../components/system/Spinner';
import AppSettings from '../../../api/appsettings/appsettings';
import LegalComponent from '../../components/admin/LegalComponent';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },

  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  container: {
    flexGrow: 1,
    display: 'flex',
  },
  tab: {
    '& > span': {
      alignItems: 'end',
    },
  },
}));

const tabs = [
  {
    key: 'introduction',
    title: i18n.__('pages.AdminSettingsPage.introduction'),
  },
  {
    key: 'legal',
    title: i18n.__('pages.AdminSettingsPage.legal'),
  },
  {
    key: 'personalData',
    title: i18n.__('pages.AdminSettingsPage.personalData'),
  },
  {
    key: 'accessibility',
    title: i18n.__('pages.AdminSettingsPage.accessibility'),
  },
  {
    key: 'gcu',
    title: i18n.__('pages.AdminSettingsPage.gcu'),
  },
];

const AdminSettingsPage = ({ ready, appsettings }) => {
  const [selected, setSelected] = useState(0);
  const classes = useStyles();
  const onChangeTab = (e, newTab) => {
    setSelected(newTab);
  };

  if (!ready && !appsettings) {
    return <Spinner full />;
  }

  return (
    <Fade in>
      <Container>
        <Paper className={classes.root}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant="h3">{i18n.__('pages.AdminSettingsPage.edition')}</Typography>
            </Grid>
            <Grid item md={12} className={classes.container}>
              <Tabs orientation="vertical" value={selected} onChange={onChangeTab}>
                {tabs.map(({ title, key }, index) => (
                  <Tab className={classes.tab} label={title} id={index} key={key} />
                ))}
              </Tabs>
              {tabs.map(({ key }, i) => {
                if (selected !== i) return null;
                return <LegalComponent key={key} tabkey={key} data={appsettings[key]} />;
              })}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

export default withTracker(() => {
  const subSettings = Meteor.subscribe('appsettings.all');
  const appsettings = AppSettings.findOne();
  const ready = subSettings.ready();
  return {
    appsettings,
    ready,
  };
})(AdminSettingsPage);

AdminSettingsPage.defaultProps = {
  appsettings: {},
};

AdminSettingsPage.propTypes = {
  appsettings: PropTypes.objectOf(PropTypes.any),
  ready: PropTypes.bool.isRequired,
};
