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
import { toast } from 'react-toastify';
import MaterialTable from '@material-table/core';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import { makeStyles } from 'tss-react/mui';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useLocation } from 'react-router-dom';

import { useAppContext } from '../../contexts/context';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import lightTheme from '../../themes/light';
// import StructureSelect from '../../components/structures/StructureSelect';
import { useMethod } from '../../utils/hooks/hooks.meteor';
import { TreeViewStructureSelector } from '../../components/structures/TreeViewStructureSelector';

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
  const [{ isMobile, user }] = useAppContext();
  const [value, setValue] = useState(0);
  const location = useLocation();
  const isStructureAdminMode = location.pathname === '/admin/structureanalytics';
  const [selectedStructureId, setSelectedStructureId] = useState(isStructureAdminMode ? user.structure : 'all');
  const selectedStructureIdValue = selectedStructureId === 'all' ? null : selectedStructureId;
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
                <TreeViewStructureSelector
                  selectedStructureId={selectedStructureId}
                  onStructureSelect={(e, structureId) => {
                    setSelectedStructureId(structureId);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={12}>
              <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                <Tab label={i18n.__('pages.AdminAnalytics.usersTabs')} />
                <Tab label={i18n.__('pages.AdminAnalytics.actionsTabs')} />
              </Tabs>
            </Grid>
            {value === 0 && <UserPanel selectedStructureId={selectedStructureIdValue} />}
            {value === 1 && <ActionClickPanel selectedStructureId={selectedStructureIdValue} />}
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

const Row = ({ name, value, subRows }) => {
  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row">
          {name}
        </TableCell>
        <TableCell align="right">{value}</TableCell>
      </TableRow>
      {subRows?.length > 0 && (
        <TableRow>
          <TableCell component="th" scope="row" style={{ padding: 0 }} />
          <TableCell component="th" scope="row" style={{ padding: 0 }}>
            <Table size="small">
              {subRows.map((subRow) => (
                <TableRow>
                  <TableCell component="th" scope="row">
                    {subRow.name}
                  </TableCell>
                  <TableCell align="right">{subRow.value}</TableCell>
                </TableRow>
              ))}
            </Table>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const UserPanel = ({ selectedStructureId }) => {
  const { classes } = useStyles();
  const [call, { result }] = useMethod('analytics.connections.counts');
  const {
    logged,
    notLogged,
    idle,
    active,
    structures = [],
    newAccounts,
    activeWithSubStructures,
    idleWithSubStructures,
  } = result || {};
  useEffect(() => {
    call({ structureId: selectedStructureId });
  }, [selectedStructureId]);

  const activeAndIdleRows = [
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
          <span className={classes.active} />
          {i18n.__('pages.AdminAnalytics.rows.usersActiveTotal')}
        </div>
      ),
      value: activeWithSubStructures,
    },
    {
      id: 3,
      name: (
        <div className={classes.container}>
          <span className={classes.idle} />
          {i18n.__('pages.AdminAnalytics.rows.usersIdle')}
        </div>
      ),
      value: idle,
    },
    {
      id: 4,
      name: (
        <div className={classes.container}>
          <span className={classes.idle} />
          {i18n.__('pages.AdminAnalytics.rows.usersIdleTotal')}
        </div>
      ),
      value: idleWithSubStructures,
    },
  ];

  const newAccountsRow = {
    id: 5,
    name: i18n.__('pages.AdminAnalytics.rows.newAccounts'),
    value: newAccounts,
  };

  const rows = !selectedStructureId
    ? [
        {
          id: 6,
          name: i18n.__('pages.AdminAnalytics.rows.usersNotLogged'),
          value: notLogged,
        },
        {
          id: 7,
          name: i18n.__('pages.AdminAnalytics.rows.usersLogged'),
          value: logged,
          subRows: activeAndIdleRows,
        },
        newAccountsRow,
      ]
    : [...activeAndIdleRows, newAccountsRow];

  return (
    <Grid item container md={12}>
      <Grid item md={12}>
        <Typography variant="h6">{i18n.__('pages.AdminAnalytics.usersTitle')}</Typography>
      </Grid>
      <Grid item md={12}>
        <TableContainer>
          <Table aria-label="users table">
            <TableBody>
              {rows.map((row) => (
                <Row {...row} key={row.id} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {!selectedStructureId && (
        <>
          <Grid item md={12} style={{ marginTop: '2rem' }}>
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

const TableDisplayer = ({
  title = '',
  data = [],
  columns = [],
  loading = false,
  selectedStructureId = '',
  selectorSection = null,
}) => (
  <Grid item container md={12}>
    <Grid item md={12}>
      <Typography variant="h6">{i18n.__(title)}</Typography>
    </Grid>
    {selectorSection && (
      <Grid item md={12}>
        {selectorSection}
      </Grid>
    )}
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

const getOneWeekAgo = (date = new Date()) => {
  const oneWeekAgo = new Date(date);

  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return oneWeekAgo;
};

const downloadBlob = (content, filename, contentType) => {
  // Create a blob
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);

  // Create a link to download it
  const pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', filename);
  pom.click();
};

const ActionClickPanel = ({ selectedStructureId }) => {
  const [call, { loading, result }] = useMethod('analytics.getActionClickedAnalyticsEvents');
  const [startAt, setStartAt] = useState(getOneWeekAgo());
  const [endAt, setEndAt] = useState(new Date());
  const [{ language }] = useAppContext();

  const downloadCSV = () => {
    Meteor.call(
      'analytics.getExportableAnalyticsData',
      {
        structureId: selectedStructureId,
        dateRange: [startAt, endAt],
      },
      (error, csvData) => {
        if (error) {
          return toast.error(error.message || error.reason);
        }

        if (!csvData.length) {
          return toast.warning(i18n.__('pages.AdminAnalytics.noEventOnPeriod'));
        }

        const content = [
          'Structure,Date,Cible,Contenu,Nombre',
          ...csvData.map((stat) =>
            [stat.name, stat.at.toLocaleString(), stat.target, stat.content, stat.count].join(','),
          ),
        ].join('\n');

        return downloadBlob(
          content,
          `stats-${
            selectedStructureId || 'admin'
          }-${startAt.toLocaleString()}-${endAt.toLocaleString()}.csv`.replaceAll(' ', '_'),
          'text/csv;charset=utf-8;',
        );
      },
    );
  };

  useEffect(() => {
    call({ structureId: selectedStructureId, dateRange: [startAt, endAt] });
  }, [selectedStructureId, endAt, startAt]);

  const columns = [
    {
      title: i18n.__('pages.AdminAnalytics.columnActionsTarget'),
      field: 'target',
      sorting: false,
      render: (row) => (
        <Chip label={row.target} color={row.target === 'SERVICE' ? 'primary' : 'secondary'} variant="outlined" />
      ),
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

  return (
    <>
      {TableDisplayer({
        selectedStructureId,
        loading,
        data: result || [],
        columns,
        title: 'pages.AdminAnalytics.actionsClickTitle',
        selectorSection: (
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language}>
            <Box display="flex" justifyContent="space-around">
              <DatePicker
                label={i18n.__('pages.AdminAnalytics.startAt')}
                value={startAt}
                onChange={(newValue) => {
                  setStartAt(newValue.toDate());
                }}
                maxDate={endAt}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label={i18n.__('pages.AdminAnalytics.endAt')}
                value={endAt}
                onChange={(newValue) => {
                  setEndAt(newValue.toDate());
                }}
                minDate={startAt}
                renderInput={(params) => <TextField {...params} />}
              />
              <Box display="flex" flexDirection="column" justifyContent="center">
                <Button onClick={downloadCSV} startIcon={<CloudDownloadIcon />}>
                  {i18n.__('pages.AdminAnalytics.download')}
                </Button>
              </Box>
            </Box>
          </LocalizationProvider>
        ),
      })}
    </>
  );
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
  selectorSection: PropTypes.node,
};

TableDisplayer.defaultProps = {
  ...panelDefaultProps,
  selectorSection: null,
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
Row.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  subRows: PropTypes.array,
};
Row.defaultProps = {
  subRows: [],
};
