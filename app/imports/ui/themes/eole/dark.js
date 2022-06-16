import { computeCustoms } from '../utils';
import COMMONS from './commons';
import { overrides, props } from './customs';

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

const EOLE_DARK = {
  ...COMMONS,
  props: computeCustoms(palette, props),
  overrides: computeCustoms(palette, overrides),
  palette,
};

export default EOLE_DARK;
