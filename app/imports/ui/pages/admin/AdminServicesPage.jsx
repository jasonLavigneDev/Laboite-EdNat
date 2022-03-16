import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import Container from '@material-ui/core/Container';
import Fade from '@material-ui/core/Fade';
import Spinner from '../../components/system/Spinner';
import Services from '../../../api/services/services';
import AdminServicesTable from '../../components/admin/AdminServices';

function AdminServicesPage() {
  const { services, loading } = useTracker(() => {
    const _servicesHandle = Meteor.subscribe('services.all');
    const _loading = !_servicesHandle.ready();
    const _services = Services.find({}, { sort: { title: 1 } }).fetch();
    return {
      services: _services,
      loading: _loading,
    };
  });
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <AdminServicesTable services={services} loading={loading} selectedStructure={{}} />
          </Container>
        </Fade>
      )}
    </>
  );
}

export default AdminServicesPage;
