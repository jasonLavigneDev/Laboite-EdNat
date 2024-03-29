import COMMONS from './commons';
import { components } from './customs';
import { computeCustoms } from '../utils';

const palette = {
  type: 'dark',
  primary: {
    main: '#8585f6',
    light: '#5f5ff1',
    dark: '#7070f3',
  },
  secondary: {
    main: '#f95c5e',
    light: '#fa8d8e',
    dark: '#fba5a6',
  },
  tertiary: {
    main: '#161616',
  },
  backgroundFocus: {
    main: '#313178',
  },
  text: {
    primary: '#ffffff',
  },
  background: {
    default: '#2a2a2a',
    inputs: '#383838',
    paper: '#313178',
  },
  info: {
    main: '#518fff',
    light: '#85acff',
    dark: '#9ebdff',
  },
  success: {
    main: '#27a658',
    light: '#53c37d',
    dark: '#45b870',
  },
  warning: {
    main: '#fc5d00',
    light: '#fd7b44',
    dark: '#fe8b58',
  },
  error: {
    main: '#ff5655',
    light: '#ff8988',
    dark: '#ffa2a2',
  },
  grey: {
    main: '#e0e0e0',
    light: '#bdbdbd',
    dark: '#9e9e9e',
  },
};

const RIZOMO_DARK = {
  palette,
  components: computeCustoms(palette, components),
  ...COMMONS,
};

export default RIZOMO_DARK;
