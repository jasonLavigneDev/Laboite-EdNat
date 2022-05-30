import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import Container from '@material-ui/core/Container';
import Fade from '@material-ui/core/Fade';
import Spinner from '../../components/system/Spinner';
import AdminServicesTable from '../../components/admin/AdminServicesTable';
import Services from '../../../api/services/services';
import { useStructure } from '../../../api/structures/hooks';

function AdminServicesPage({ services, loading, structureMode }) {
  // used to help generate url in structure mode
  const urlStruct = structureMode ? 'structure' : '';
  const structure = useStructure();

  const title = `${i18n.__('pages.AdminServicesPage.title')} ${
    structureMode && structure ? `(${structure.name})` : ''
  } (${services.length})`;
  const urlNew = `/admin/${urlStruct}services/new`;

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container style={{ overflowX: 'auto' }}>
            <AdminServicesTable
              tableTitle={title}
              structureMode={structureMode}
              urlStruct={urlStruct}
              urlNew={urlNew}
              services={services}
            />
          </Container>
        </Fade>
      )}
    </>
  );
}

AdminServicesPage.propTypes = {
  services: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  structureMode: PropTypes.bool.isRequired,
};

export default withTracker(({ match: { path } }) => {
  const structureMode = path === '/admin/structureservices';
  const servicesHandle = Meteor.subscribe(structureMode ? 'services.structure' : 'services.all');
  const loading = !servicesHandle.ready();
  let services;
  if (structureMode) {
    services = Services.findFromPublication('services.structure', {}, { sort: { title: 1 } }).fetch();
  } else {
    services = Services.find({}, { sort: { title: 1 } }).fetch();
  }
  return {
    services,
    loading,
    structureMode,
  };
})(AdminServicesPage);
