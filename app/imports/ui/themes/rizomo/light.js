import COMMONS from './commons';
import { components } from './customs';
import { computeCustoms } from '../utils';

export const palette = {
  mode: 'light',
  primary: {
    main: '#000091',
    light: '#E5E5F4',
    dark: '#0909b9',
  },
  secondary: {
    main: '#c9191e',
    light: '#af161a',
    dark: '#9b1317',
  },
  tertiary: {
    main: '#fff',
  },
  backgroundFocus: {
    main: '#f5f5fe',
  },
  text: {
    primary: '#161616',
  },
  background: {
    default: '#f6f6f6',
    inputs: '#f0f0f0',
    paper: '#fff',
  },
  info: {
    main: '#0063cb',
    light: '#0055af',
    dark: '#004b99',
  },
  success: {
    main: '#18753c',
    light: '#2aac5c',
    dark: '#249851',
  },
  warning: {
    main: '#b34000',
    light: '#983600',
    dark: '#842f00',
  },
  error: {
    main: '#ce0500',
    light: '#b20400',
    dark: '#9c0400',
  },
};

const RIZOMO_LIGHT = {
  components: computeCustoms(palette, components),
  palette,
  ...COMMONS,
};

export default RIZOMO_LIGHT;
