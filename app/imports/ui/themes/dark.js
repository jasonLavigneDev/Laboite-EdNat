import { createTheme, adaptV4Theme } from '@mui/material/styles';
import RIZOMO_DARK from './rizomo/light';
import LABOITE_DARK from './laboite/light';
import EOLE_DARK from './eole/dark';

export const DARK_THEMES = {
  rizomo: RIZOMO_DARK,
  laboite: LABOITE_DARK,
  eole: EOLE_DARK,
};

const darkTheme = createTheme(adaptV4Theme(DARK_THEMES[Meteor.settings.public.theme || 'laboite']));

export default darkTheme;
