import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import i18n from 'meteor/universe:i18n';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import StructureSelectionTree from '../../components/profile/StructureSelectionTree';

const useStyles = makeStyles((theme) => ({
  button: {
    marginBottom: theme.spacing(3),
  },
}));

const StructureSelectionPage = () => {
  const classes = useStyles();

  return (
    <Container>
      <Button
        startIcon={<ArrowBackIcon />}
        className={classes.button}
        variant="contained"
        color="primary"
        component={RouterLink}
        to="/profile"
      >
        {i18n.__('pages.StructureSelectionPage.backToProfile')}
      </Button>
      <StructureSelectionTree />
    </Container>
  );
};

export default StructureSelectionPage;
