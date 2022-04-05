import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import Fade from '@material-ui/core/Fade';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import i18n from 'meteor/universe:i18n';
import FormControl from '@material-ui/core/FormControl';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import Spinner from '../../components/system/Spinner';
import Structures from '../../../api/structures/structures';
import Services from '../../../api/services/services';
import CustomSelect from '../../components/admin/CustomSelect';
import { useStructure, getStructure } from '../../../api/structures/utils';
import AdminServicesTable from '../../components/admin/AdminServices';

const AdminServicesByStructurePage = () => {
  const userStructure = useStructure();

  const [selectedStructureId, setSelectedStructureId] = useState('');

  const { services, loading, structures, selectedStructure } = useTracker(() => {
    const subName = 'services.structure.ids';

    const _selectedStructure = getStructure(selectedStructureId);
    const structuresHandle = Meteor.subscribe('structures.with.all.childs', {
      structureId: userStructure ? userStructure._id : '',
    });
    const structuresLoading = structuresHandle.ready();

    const _structures = Structures.findFromPublication('structures.with.all.childs').fetch();

    const servicesHandle = Meteor.subscribe(subName, { structureIds: [selectedStructureId] });
    const _loading = !servicesHandle.ready() && !structuresLoading;

    const _services = Services.findFromPublication(subName, {}, { sort: { title: 1 } }).fetch();

    const result = {
      selectedStructure: _selectedStructure,
      services: _services,
      loading: selectedStructureId.length > 0 ? _loading : true,
      structures: _structures,
    };

    return result;
  }, [selectedStructureId]);

  useEffect(() => {
    if (userStructure && userStructure._id) {
      setSelectedStructureId(userStructure._id);
    }
  }, [userStructure]);

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
                  <InputLabel id="structure-label">
                    {i18n.__('pages.AdminStructureUsersPage.chooseStructure')}
                  </InputLabel>
                  <CustomSelect
                    labelWidth={100}
                    value={selectedStructureId}
                    error={false}
                    onChange={(e) => {
                      if (e.target.value.trim().length < 1) return;
                      setSelectedStructureId(e.target.value);
                    }}
                    options={structures.map((opt) => ({ value: opt._id, label: opt.name }))}
                  />
                </FormControl>
              </Grid>
            </Card>
            <AdminServicesTable services={services} loading={loading} selectedStructure={selectedStructure || {}} />
          </Container>
        </Fade>
      )}
    </>
  );
};

export default AdminServicesByStructurePage;
