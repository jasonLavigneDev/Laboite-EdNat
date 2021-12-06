import snackbar from './components/snackbar';
import card from './components/card';
import button from './components/button';

const overrides = (palette) => ({
  ...snackbar(palette),
  ...card,
  ...button,
});

export default overrides;
