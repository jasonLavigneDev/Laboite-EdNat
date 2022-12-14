import { deepmerge } from '@mui/utils';
import { getMuiDsfrThemeOptions } from '@codegouvfr/react-dsfr/mui';

import COMMONS from './commons';

const DSFR_DARK = {
  ...COMMONS,
};

export default deepmerge(getMuiDsfrThemeOptions({ isDark: true }), DSFR_DARK);
