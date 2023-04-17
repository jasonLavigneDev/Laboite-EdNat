import React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import Typography from '@mui/material/Typography';

const useStyles = makeStyles()((theme) => ({
  skipLink: {
    position: 'absolute',
    top: 0,
    left: '45%',

    height: 48,
    padding: 8,

    background: theme.palette.primary.main,
    color: theme.palette.tertiary.main,
    borderRadius: theme.shape.borderRadius,

    '&:focus': {
      zIndex: 10000,
    },
  },
}));

const SkipLink = () => {
  const { classes } = useStyles();
  const history = useHistory();

  return (
    <a className={classes.skipLink} href="#main" onClick={() => history.replace('#main')}>
      <Typography variant="h6">{i18n.__(`components.SkipLink.skipToContent`)}</Typography>
    </a>
  );
};

export default SkipLink;
