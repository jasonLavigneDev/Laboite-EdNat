import React from 'react';
import { Link } from 'react-router-dom';
import i18n from 'meteor/universe:i18n';
import Fade from '@mui/material/Fade';

/** Render a Not Found page if the user enters a URL that doesn't match any route. */
export default function NotFound() {
  return (
    <Fade in>
      <div>
        <h2>{i18n.__('pages.NotFound.message')}</h2>
        <p>
          <Link to="/">{i18n.__('pages.NotFound.backButtonLabel')}</Link>
        </p>
      </div>
    </Fade>
  );
}
