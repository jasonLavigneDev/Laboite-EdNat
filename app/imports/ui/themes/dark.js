import { createTheme } from '@material-ui/core/styles';
import RIZOMO_DARK from './rizomo/light';
import LABOITE_DARK from './laboite/light';

export const DARK_THEMES = {
  rizomo: RIZOMO_DARK,
  laboite: LABOITE_DARK,
};

const darkTheme = createTheme(DARK_THEMES[Meteor.settings.public.theme || 'laboite']);

export default darkTheme;
