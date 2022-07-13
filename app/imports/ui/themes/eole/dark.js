import { computeCustoms } from '../utils';
import COMMONS from './commons';
import { components } from './customs';

const palette = {
  mode: 'dark',
  primary: {
    main: '#011CAA',
    light: '#ECEEF8',
    dark: '#212F74',
  },
  secondary: {
    main: '#EFAC61',
    light: '#FFDBA5',
  },
};

const EOLE_DARK = {
  ...COMMONS,
  components: computeCustoms(palette, components),
  palette,
};

export default EOLE_DARK;
