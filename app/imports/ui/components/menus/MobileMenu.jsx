import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import MenuBar from './MenuBar';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.tertiary.main,
    bottom: 0,
    top: 'auto',
  },
}));

const MobileMenu = () => {
  const classes = useStyles();
  return (
    <AppBar position="fixed" className={classes.root}>
      <MenuBar mobile />
    </AppBar>
  );
};

export default MobileMenu;
