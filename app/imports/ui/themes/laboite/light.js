import { computeCustoms } from '../utils';
import COMMONS from './commons';
import { components } from './customs';

const palette = {
  mode: 'light',
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
    paper: '#F5F5F5',
  },
  grey: {
    main: '#e0e0e0',
    light: '#bdbdbd',
    dark: '#9e9e9e',
  },
};

const LABOITE_LIGHT = {
  ...COMMONS,
  components: computeCustoms(palette, components),
  palette,
};

export default LABOITE_LIGHT;
