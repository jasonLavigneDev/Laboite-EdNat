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

const RizomoTitle = () => {
  const classes = useStyles();
  return (
    <div className={classes.logoText}>
      <Typography variant="h4" component="h4">
        Rizomo
      </Typography>
      <Typography variant="subtitle1" component="h5">
        Sac à dos numérique de l’agent public
      </Typography>
    </div>
  );
};

export default RizomoTitle;
