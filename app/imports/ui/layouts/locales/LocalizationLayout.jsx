import React, { lazy, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useAppContext } from '../../contexts/context';

const FR = lazy(() => import('./FR'));
const EN = lazy(() => import('./EN'));

export default function LocalizationLayout({ children }) {
  const [{ language }] = useAppContext();

  useEffect(() => {
    moment.locale(language);
  }, [language]);

  let Lang;
  switch (language.split('-')[0]) {
    case 'en':
      Lang = EN;
      break;
    case 'fr':
      Lang = FR;
      break;
    default:
      Lang = EN;
      break;
  }

  return <Lang>{children}</Lang>;
}

LocalizationLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
