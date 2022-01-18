import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  logoText: {
    color: theme.palette.text.primary,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 20,
  },
}));
const { appName, appDescription } = Meteor.settings.public;

const RizomoTitle = () => {
  const classes = useStyles();
  return (
    <div className={classes.logoText}>
      <Typography variant="h4" component="h4">
        {appName}
      </Typography>
      <Typography variant="subtitle1" component="h5">
        {appDescription}
      </Typography>
    </div>
  );
};

export default RizomoTitle;
