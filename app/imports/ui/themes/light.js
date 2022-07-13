import { createTheme, adaptV4Theme } from '@mui/material/styles';
import RIZOMO_LIGHT from './rizomo/light';
import LABOITE_LIGHT from './laboite/light';
import EOLE_LIGHT from './eole/light';

export const LIGHT_THEMES = {
  rizomo: RIZOMO_LIGHT,
  laboite: LABOITE_LIGHT,
  eole: EOLE_LIGHT,
};

const lightTheme = createTheme(adaptV4Theme(LIGHT_THEMES[Meteor.settings.public.theme || 'laboite']));

export default lightTheme;
