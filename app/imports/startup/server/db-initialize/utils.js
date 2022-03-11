import { Migrations } from 'meteor/percolate:migrations';
import AppSettings from '../../../api/appsettings/appsettings';

const checkMigrationStatus = () => {
  if (Migrations._getControl().locked === true) {
    console.log('Migration lock detected !!!!');
    AppSettings.update({}, { $set: { maintenance: true, textMaintenance: 'api.appsettings.migrationLockedText' } });
  }
};

export default checkMigrationStatus;
