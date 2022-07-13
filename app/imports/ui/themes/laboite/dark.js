import { computeCustoms } from '../utils';
import COMMONS from './commons';
import { components } from './customs';

const palette = {
  type: 'dark',
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

const LABOITE_DARK = {
  ...COMMONS,
  components: computeCustoms(palette, components),
  palette,
};

export default LABOITE_DARK;
