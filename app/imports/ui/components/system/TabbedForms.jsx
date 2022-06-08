import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
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
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const TabbedForms = ({ globalTitle = null, tabs }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const classes = useStyles();
  const [{ isMobile }] = useAppContext();

  const onChangeTab = (e, newTab) => {
    setSelectedTab(newTab);
  };

  return (
    <Paper className={classes.root}>
      <Grid container spacing={4}>
        {globalTitle && (
          <Grid item md={12}>
            <Typography variant={isMobile ? 'h6' : 'h4'}>{globalTitle}</Typography>
          </Grid>
        )}
        <Grid item md={12} className={classes.container}>
          <Tabs orientation="vertical" value={selectedTab} onChange={onChangeTab} className={classes.tabs}>
            {tabs.map(({ title, key }, index) => (
              <Tab className={classes.tab} label={title} id={index} key={key} />
            ))}
          </Tabs>
          {tabs.map(({ key, Element, ElementProps = {} }, i) => {
            if (selectedTab !== i) return null;
            return <Element key={key} tabkey={key} data={tabs[key]} {...ElementProps} />;
          })}
        </Grid>
      </Grid>
    </Paper>
  );
};

TabbedForms.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      /** key should be unique agmonst the tabs array */
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      /**
       * - Element should be a react composant reference
       *
       * - Capital letter is mandatory
       */
      Element: PropTypes.func.isRequired,
      ElementProps: PropTypes.objectOf(PropTypes.any),
    }),
  ).isRequired,
  globalTitle: PropTypes.string,
};

TabbedForms.defaultProps = {
  globalTitle: null,
};

export default TabbedForms;
