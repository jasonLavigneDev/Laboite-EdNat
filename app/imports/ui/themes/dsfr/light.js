import { deepmerge } from '@mui/utils';
import { getMuiDsfrThemeOptions } from '@codegouvfr/react-dsfr/mui';
import { getColors } from '@codegouvfr/react-dsfr/lib/colors';

import COMMONS from './commons';

const colors = getColors(false);

const palette = {
  mode: 'light',
  tertiary: {
    main: '#fff',
  },
  backgroundFocus: {
    main: colors.decisions.background.default.grey.hover,
  },
};

const DSFR_LIGHT = {
  ...COMMONS,
  palette,
};

export default deepmerge(getMuiDsfrThemeOptions({ isDark: false }), DSFR_LIGHT);
