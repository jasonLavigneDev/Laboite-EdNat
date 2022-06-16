import { createTheme } from '@material-ui/core/styles';
import RIZOMO_LIGHT from './rizomo/light';
import LABOITE_LIGHT from './laboite/light';
import EOLE_LIGHT from './eole/light';

export const LIGHT_THEMES = {
  rizomo: RIZOMO_LIGHT,
  laboite: LABOITE_LIGHT,
  eole: EOLE_LIGHT,
};

const lightTheme = createTheme(LIGHT_THEMES[Meteor.settings.public.theme || 'laboite']);

export default lightTheme;
