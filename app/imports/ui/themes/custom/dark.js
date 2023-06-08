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
  grey: {
    main: '#e0e0e0',
    light: '#bdbdbd',
    dark: '#9e9e9e',
  },
};

const CUSTOM_DARK = {
  ...COMMONS,
  components: computeCustoms(palette, components),
  palette,
};

export default CUSTOM_DARK;
