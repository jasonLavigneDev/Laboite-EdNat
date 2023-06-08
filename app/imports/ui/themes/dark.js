import { createTheme } from '@mui/material/styles';
import RIZOMO_DARK from './rizomo/dark';
import LABOITE_DARK from './laboite/dark';
import EOLE_DARK from './eole/dark';
import CUSTOM_DARK from './custom/dark';

export const DARK_THEMES = {
  rizomo: RIZOMO_DARK,
  laboite: LABOITE_DARK,
  eole: EOLE_DARK,
  custom: CUSTOM_DARK,
};

const darkTheme = createTheme(DARK_THEMES[Meteor.settings.public.theme || 'laboite']);

export default darkTheme;
