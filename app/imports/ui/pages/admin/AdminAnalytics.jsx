import React, { useState, useEffect } from 'react';
import i18n from 'meteor/universe:i18n';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import MaterialTable from '@material-table/core';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import { makeStyles } from 'tss-react/mui';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useLocation } from 'react-router-dom';

import { useAppContext } from '../../contexts/context';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import lightTheme from '../../themes/light';
import StructureSelect from '../../components/structures/StructureSelect';
import { useAdminSelectedStructureCall, useStructureCall } from '../../../api/structures/hooks';
import { useMethod } from '../../utils/hooks/hooks.meteor';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { primary, secondary } = lightTheme.palette;

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

const AdminAnalytics = () => {
  const { classes } = useStyles();
  const [{ isMobile }] = useAppContext();
  const [value, setValue] = useState(0);
  const location = useLocation();
  const { structure: userStructure } = useStructureCall();
  const isStructureAdminMode = location.pathname === '/admin/structureanalytics';

  const [selectedStructureId, setSelectedStructureId] = useState((isStructureAdminMode && userStructure?._id) || '');

  const { structures } = useAdminSelectedStructureCall({
    selectedStructureId,
    allStructures: !isStructureAdminMode,
  });

  useEffect(() => {
    if (isStructureAdminMode) {
      setSelectedStructureId(userStructure?._id);
    }
  }, [userStructure]);

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
              <FormControl variant="filled" fullWidth>
                <StructureSelect
                  structures={structures || []}
                  selectedStructureId={selectedStructureId}
                  setSelectedStructureId={setSelectedStructureId}
                  emptyPossible={!isStructureAdminMode}
                />
              </FormControl>
            </Grid>
            <Grid item md={12}>
              <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                <Tab label={i18n.__('pages.AdminAnalytics.usersTabs')} />
                <Tab label={i18n.__('pages.AdminAnalytics.actionsTabs')} />
              </Tabs>
            </Grid>
            {value === 0 && <UserPanel selectedStructureId={selectedStructureId} />}
            {value === 1 && <ActionClickPanel selectedStructureId={selectedStructureId} />}
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

const UserPanel = ({ selectedStructureId }) => {
  const { classes } = useStyles();
  const [call, { result }] = useMethod('analytics.connections.counts');
  const { logged, notLogged, idle, active, structures = [], newAccounts } = result || {};
  useEffect(() => {
    call({ structureId: selectedStructureId });
  }, [selectedStructureId]);

  let rowsUsers = [
    {
      id: 1,
      name: (
        <div className={classes.container}>
          <span className={classes.active} />
          {i18n.__('pages.AdminAnalytics.rows.usersActive')}
        </div>
      ),
      value: active,
    },
    {
      id: 2,
      name: (
        <div className={classes.container}>
          <span className={classes.idle} />
          {i18n.__('pages.AdminAnalytics.rows.usersIdle')}
        </div>
      ),
      value: idle,
    },
    {
      id: 3,
      name: i18n.__('pages.AdminAnalytics.rows.newAccounts'),
      value: newAccounts,
    },
  ];
  if (!selectedStructureId) {
    rowsUsers = [
      {
        id: 4,
        name: i18n.__('pages.AdminAnalytics.rows.usersNotLogged'),
        value: notLogged,
      },
      {
        id: 5,
        name: i18n.__('pages.AdminAnalytics.rows.usersLogged'),
        value: logged,
      },
      ...rowsUsers,
    ];
  }
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
                <TableRow key={row.id}>
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
      {!selectedStructureId && (
        <>
          <Grid item md={12}>
            <Typography variant="h6">{i18n.__('pages.AdminAnalytics.usersByStructure')}</Typography>
          </Grid>
          <Grid item md={12}>
            <TableContainer>
              <Table aria-label="users by structure table">
                <TableBody>
                  {structures
                    .filter((s) => s.value !== 0)
                    .map((row) => (
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
        </>
      )}
    </Grid>
  );
};

const ChartDisplayer = ({ rowData: { content, target }, selectedStructureId }) => {
  const [call, { result }] = useMethod('analytics.chartdata');
  useEffect(() => {
    call({ structureId: selectedStructureId, content, target });
  }, [selectedStructureId]);

  const datasets = [
    {
      label: i18n.__('pages.AdminAnalytics.columnNumberConnected'),
      backgroundColor: primary.main,
      borderColor: primary.main,
      data: result?.map(({ count }) => count),
    },
  ];
  if (!selectedStructureId) {
    datasets.push({
      label: i18n.__('pages.AdminAnalytics.columnNumberNotConnected'),
      backgroundColor: secondary.main,
      borderColor: secondary.main,
      data: result?.map(({ countNotConnected }) => countNotConnected),
    });
  }
  return (
    <Line
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      }}
      data={{
        labels: result?.map(({ slot }) => slot),
        datasets,
      }}
    />
  );
};

const TableDisplayer = ({ title = '', data = [], columns = [], loading = false, selectedStructureId = '' }) => (
  <Grid item container md={12}>
    <Grid item md={12}>
      <Typography variant="h6">{i18n.__(title)}</Typography>
    </Grid>
    <Grid item md={12}>
      <MaterialTable
        columns={columns}
        data={data.map((row) => ({ ...row, id: row._id }))}
        isLoading={loading}
        options={{
          showTitle: false,
          pageSize: 10,
          pageSizeOptions: [10, 20, 50, 100],
          paginationType: 'stepped',
          emptyRowsWhenPaging: false,
          draggable: false,
          thirdSortClick: false,
        }}
        style={{ boxShadow: 'none' }}
        localization={setMaterialTableLocalization('pages.AdminAnalytics')}
        detailPanel={(args) => <ChartDisplayer {...args} selectedStructureId={selectedStructureId} />}
      />
    </Grid>
  </Grid>
);

const ActionClickPanel = ({ selectedStructureId }) => {
  const [call, { loading, result }] = useMethod('analytics.getActionClickedAnalyticsEvents');
  useEffect(() => {
    call({ structureId: selectedStructureId });
  }, [selectedStructureId]);

  const columns = [
    {
      title: i18n.__('pages.AdminAnalytics.columnActionsTarget'),
      field: 'target',
      sorting: false,
    },
    {
      title: i18n.__('pages.AdminAnalytics.columnContent'),
      field: '_id',
    },
    {
      title: i18n.__('pages.AdminAnalytics.columnNumberConnected'),
      field: 'count',
      defaultSort: 'desc',
      align: 'right',
    },
  ];

  if (!selectedStructureId) {
    columns.push({
      title: i18n.__('pages.AdminAnalytics.columnNumberNotConnected'),
      field: 'countNotConnected',
      defaultSort: 'desc',
      align: 'right',
    });
  }

  return TableDisplayer({
    selectedStructureId,
    loading,
    data: result || [],
    columns,
    title: 'pages.AdminAnalytics.actionsClickTitle',
  });
};

export default AdminAnalytics;

const panelDefaultProps = {
  selectedStructureId: '',
};
const panelPropType = {
  selectedStructureId: PropTypes.string,
};

TableDisplayer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any),
  columns: PropTypes.arrayOf(PropTypes.any).isRequired,
  selectedStructureId: PropTypes.string,
  title: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

TableDisplayer.defaultProps = {
  ...panelDefaultProps,
  data: [],
};

ChartDisplayer.propTypes = {
  rowData: PropTypes.objectOf(PropTypes.any).isRequired,
  ...panelPropType,
};

UserPanel.propTypes = panelPropType;
UserPanel.defaultProps = panelDefaultProps;
ActionClickPanel.propTypes = panelPropType;
ActionClickPanel.defaultProps = panelDefaultProps;
