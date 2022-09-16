import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { makeStyles } from 'tss-react/mui';
import i18n from 'meteor/universe:i18n';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StructureSelectionTree from '../../components/profile/StructureSelectionTree';

const useStyles = makeStyles()((theme) => ({
  button: {
    marginBottom: theme.spacing(3),
  },
}));

const StructureSelectionPage = () => {
  const { classes } = useStyles();

  return (
    <Container>
      <Button
        startIcon={<ArrowBackIcon />}
        className={classes.button}
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
