import { computeCustoms } from '../utils';
import COMMONS from './commons';
import { overrides, props } from './customs';

const palette = {
  type: 'light',
  primary: {
    main: '#011CAA',
    light: '#ECEEF8',
    dark: '#212F74',
  },
  secondary: {
    main: '#E48231',
    light: '#FFDBA5',
  },
  tertiary: {
    main: '#fff',
  },
  backgroundFocus: {
    main: '#ffe0b2',
  },
  text: {
    primary: '#040D3E',
  },
  background: {
    default: '#F9F9FD',
  },
};

const LABOITE_LIGHT = {
  ...COMMONS,
  props: computeCustoms(palette, props),
  overrides: computeCustoms(palette, overrides),
  palette,
};

export default LABOITE_LIGHT;
