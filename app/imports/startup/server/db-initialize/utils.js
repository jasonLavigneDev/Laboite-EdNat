import { Migrations } from 'meteor/percolate:migrations';
import AppSettings from '../../../api/appsettings/appsettings';
import logServer from '../../../api/logging';

const checkMigrationStatus = () => {
  if (Migrations._getControl().locked === true) {
    logServer('Migration lock detected !!!!', 'error');
    AppSettings.update({}, { $set: { maintenance: true, textMaintenance: 'api.appsettings.migrationLockedText' } });
  }
};

export default checkMigrationStatus;
