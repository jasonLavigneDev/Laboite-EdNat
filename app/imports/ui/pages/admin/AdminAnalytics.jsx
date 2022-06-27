import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

import { useAppContext } from '../../contexts/context';
import Structures from '../../../api/structures/structures';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(5),
  },
  container: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    '& span': {
      height: 10,
      width: 10,
      borderRadius: '50%',
      display: 'block',
      marginRight: 10,
    },
  },
  active: {
    backgroundColor: 'green',
  },
  idle: {
    backgroundColor: 'orange',
  },
}));

const AdminAnalytics = () => {
  const classes = useStyles();
  const [{ isMobile }] = useAppContext();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Fade in>
      <Container style={{ overflowX: 'auto' }}>
        <Paper className={classes.root}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.AdminAnalytics.title')}</Typography>
            </Grid>
            <Grid item md={12}>
              <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                <Tab label={i18n.__('pages.AdminAnalytics.usersTabs')} />
                <Tab label={i18n.__('pages.AdminAnalytics.actionsTabs')} />
                <Tab label={i18n.__('pages.AdminAnalytics.viewsTabs')} />
              </Tabs>
            </Grid>
            {value === 0 && <UserPanel />}
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

const UserPanel = () => {
  const classes = useStyles();
  const {
    logged,
    notLogged,
    idle,
    structures = [],
  } = useTracker(() => {
    Meteor.subscribe('analytics.connections.counts');
    const structuresWithUsers = Structures.find({}, { sort: { name: 1 } }).fetch();
    return {
      logged: Counts.get('analytics.connections.counts.logged'),
      notLogged: Counts.get('analytics.connections.counts.notLogged'),
      idle: Counts.get('analytics.connections.counts.idle'),
      structures: structuresWithUsers.map(({ _id, name }) => ({
        name,
        _id,
        value: Counts.get(`analytics.connections.counts.structures.${_id}`),
      })),
    };
  });

  const rowsUsers = [
    {
      name: i18n.__('pages.AdminAnalytics.rows.usersNotLogged'),
      value: notLogged,
    },
    {
      name: i18n.__('pages.AdminAnalytics.rows.usersLogged'),
      value: logged,
    },
    {
      name: (
        <div className={classes.container}>
          <span className={classes.active} />
          {i18n.__('pages.AdminAnalytics.rows.usersActive')}
        </div>
      ),
      value: logged - idle,
    },
    {
      name: (
        <div className={classes.container}>
          <span className={classes.idle} />
          {i18n.__('pages.AdminAnalytics.rows.usersIdle')}
        </div>
      ),
      value: idle,
    },
  ];
  return (
    <Grid item container md={12}>
      <Grid item md={12}>
        <Typography variant="h6">{i18n.__('pages.AdminAnalytics.usersTitle')}</Typography>
      </Grid>
      <Grid item md={12}>
        <TableContainer>
          <Table aria-label="users table">
            <TableBody>
              {rowsUsers.map((row) => (
                <TableRow key={Math.random()}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item md={12}>
        <Typography variant="h6">{i18n.__('pages.AdminAnalytics.usersByStructure')}</Typography>
      </Grid>
      <Grid item md={12}>
        <TableContainer>
          <Table aria-label="users by structure table">
            <TableBody>
              {structures.map((row) => (
                <TableRow key={row._id}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default AdminAnalytics;
