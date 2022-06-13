import React, { useState } from 'react';
import Fade from '@material-ui/core/Fade';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Container from '@material-ui/core/Container';
import i18n from 'meteor/universe:i18n';
import Spinner from '../../components/system/Spinner';
import { useStructure, useAdminSelectedStructure } from '../../../api/structures/hooks';
import StructureSelect from '../../components/structures/StructureSelect';
import AdminStructuresIntroductionEdition from '../../components/admin/AdminStructureIntroductionEdition';

const AdminServicesByStructurePage = () => {
  const userStructure = useStructure();

  const [selectedStructureId, setSelectedStructureId] = useState(
    userStructure && userStructure._id ? userStructure._id : '',
  );

  const { loading, selectedStructure, structures } = useAdminSelectedStructure({
    selectedStructureId,
    setSelectedStructureId,
  });

  //   const getStruct = () => getStructure(selectedStructureId) || selectedStructure;
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container>
            <Card>
              <Grid item>
                <FormControl variant="filled" fullWidth>
                  <StructureSelect
                    structures={structures}
                    selectedStructureId={selectedStructureId}
                    setSelectedStructureId={setSelectedStructureId}
                  />
                </FormControl>
              </Grid>
            </Card>
            <Card>
              <CardHeader title={i18n.__('pages.AdminIntroductionByStructurePage.title')} />
              <CardContent>
                <AdminStructuresIntroductionEdition structure={selectedStructure} />
              </CardContent>
            </Card>
          </Container>
        </Fade>
      )}
    </>
  );
};

export default AdminServicesByStructurePage;
