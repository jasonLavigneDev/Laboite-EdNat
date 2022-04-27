import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import i18n from 'meteor/universe:i18n';
import StructureSelectionTree from '../../components/profile/StructureSelectionTree';

const useStyles = makeStyles((theme) => ({
  marginTop: theme.spacing(3),
}));

const StructureSelectionPage = () => {
  const classes = useStyles();

  return (
    <Grid>
      <Typography>
        <Link component={RouterLink} to="/profile">
          {i18n.__('pages.StructureSelectionPage.backToProfile')}
        </Link>
      </Typography>
      <Divider />
      <Box className={classes.marginTop}>
        <StructureSelectionTree />
      </Box>
    </Grid>
  );
};

export default StructureSelectionPage;
