import React from 'react';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';

import { useTracker } from 'meteor/react-meteor-data';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { makeStyles } from 'tss-react/mui';
import Grid from '@mui/material/Grid';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

import { useAppContext } from '../../contexts/context';
import Structures from '../../../api/structures/structures';

const useStyles = makeStyles()((theme) => ({
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

const AdminUsersConnections = () => {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles();
  const {
    logged,
    notLogged,
    idle,
    structures = [],
    newAccounts,
  } = useTracker(() => {
    Meteor.subscribe('users.connections.counts');
    const structuresWithUsers = Structures.find({}, { sort: { name: 1 } }).fetch();
    return {
      logged: Counts.get('users.connections.counts.logged'),
      notLogged: Counts.get('users.connections.counts.notLogged'),
      idle: Counts.get('users.connections.counts.idle'),
      newAccounts: Counts.get('users.new.counts'),
      structures: structuresWithUsers.map(({ _id, name }) => ({
        name,
        _id,
        value: Counts.get(`users.connections.counts.structures.${_id}`),
      })),
    };
  });
  const rowsUsers = [
    {
      name: i18n.__('pages.AdminUsersConnections.rows.usersNotLogged'),
      value: notLogged,
    },
    {
      name: i18n.__('pages.AdminUsersConnections.rows.usersLogged'),
      value: logged,
    },
    {
      name: (
        <div className={classes.container}>
          <span className={classes.active} />
          {i18n.__('pages.AdminUsersConnections.rows.usersActive')}
        </div>
      ),
      value: logged - idle,
    },
    {
      name: (
        <div className={classes.container}>
          <span className={classes.idle} />
          {i18n.__('pages.AdminUsersConnections.rows.usersIdle')}
        </div>
      ),
      value: idle,
    },
    {
      name: i18n.__('pages.AdminUsersConnections.rows.newAccounts'),
      value: newAccounts,
    },
  ];
  return (
    <Fade in>
      <Container style={{ overflowX: 'auto' }}>
        <Paper className={classes.root}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.AdminUsersConnections.title')}</Typography>
            </Grid>
            <Grid item container md={12}>
              <Grid item md={12}>
                <Typography variant="h6">{i18n.__('pages.AdminUsersConnections.usersTitle')}</Typography>
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
                <Typography variant="h6">{i18n.__('pages.AdminUsersConnections.usersByStructure')}</Typography>
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
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};
export default AdminUsersConnections;
