import React, { useState } from 'react';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import i18n from 'meteor/universe:i18n';
import Spinner from '../../components/system/Spinner';
import { useStructure, useAdminSelectedStructure } from '../../../api/structures/hooks';
import StructureSelect from '../../components/structures/StructureSelect';
import AdminStructuresIntroductionEdition from '../../components/admin/AdminStructureIntroductionEdition';
import TabbedForms from '../../components/system/TabbedForms';
import { useStyles } from '../../components/admin/InfoEditionComponent';
import { useAppContext } from '../../contexts/context';
import AdminStructureChangeEmailContact from '../../components/admin/AdminStructureChangeEmailContact';
import AdminStructureValidationMandatory from '../../components/admin/AdminStructureValidationMandatory';

const AdminStructureSettingsPage = () => {
  const userStructure = useStructure();

  const [selectedStructureId, setSelectedStructureId] = useState(
    userStructure && userStructure._id ? userStructure._id : '',
  );

  const { loading, selectedStructure, structures } = useAdminSelectedStructure({
    selectedStructureId,
    setSelectedStructureId,
  });

  const [{ isMobile }] = useAppContext();

  const { classes } = useStyles();

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Grid container>
            <Grid item md={12}>
              <Typography variant={isMobile ? 'h6' : 'h4'}>
                {i18n.__('pages.AdminStructureSettingsPage.title')}
              </Typography>
            </Grid>
            <Grid item md={12}>
              <FormControl variant="filled" fullWidth>
                <StructureSelect
                  structures={structures}
                  selectedStructureId={selectedStructureId}
                  setSelectedStructureId={setSelectedStructureId}
                />
              </FormControl>
            </Grid>
            <Grid item md={12} className={classes.marginTop}>
              <TabbedForms
                tabs={[
                  {
                    title: i18n.__('pages.AdminStructureSettingsPage.title'),
                    key: 'structureIntroduction',
                    Element: AdminStructuresIntroductionEdition,
                    ElementProps: { structure: selectedStructure },
                  },
                  {
                    title: 'Contact',
                    key: 'Contact',
                    Element: AdminStructureChangeEmailContact,
                    ElementProps: { structure: selectedStructure },
                  },
                  {
                    title: i18n.__('pages.AdminStructureSettingsPage.userStructureValidationMandatory'),
                    key: 'userStructureAdminValidationMandatory',
                    Element: AdminStructureValidationMandatory,
                    ElementProps: { structure: selectedStructure },
                  },
                ]}
              />
            </Grid>
          </Grid>
        </Fade>
      )}
    </>
  );
};

export default AdminStructureSettingsPage;
