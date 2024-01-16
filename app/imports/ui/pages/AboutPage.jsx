// eslint-disable-next-line no-restricted-imports
import { Paper, Modal, Typography, Button } from '@mui/material';
import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
// eslint-disable-next-line import/no-extraneous-dependencies
import Bowser from 'bowser';
import { useAppContext } from '../contexts/context';

import PackageJSON from '../../../package.json';

const style = {
  paperStyle: {
    backgroundColor: '#E6EAF5',
    boxShadow: ' 1px 5px 10px rgba(0,0,0,0.5)',
    borderRadius: '20px',
    alignItems: 'center',
  },
  divScroller: {
    height: '40vw',
    width: '100vw',
    scrollSnapType: 'y mandatory',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    padding: '0 10vw',
  },
  globalHeight: {
    height: '34vw',
    scrollSnapAlign: 'start',
  },
  headerSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBgSection: {
    padding: '3vw 1vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBgSectionIntro: {
    padding: '3vw 1vw',
    display: 'flex',
    flexDirection: 'column',
  },
  bgLeftSection: {
    display: 'flex',
  },
  imageSize: {
    height: '10vw',
    placeContent: 'center',
  },
  marginRight: {
    marginRight: '-10vw',
  },
  divTextLeft: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'end',
    padding: '0px 10vw',
  },
  marginLeft: {
    marginLeft: '-10vw',
  },
  paddingLeft: {
    paddingLeft: '10vw',
  },

  paddingRight: {
    paddingRight: '10vw',
  },

  paper: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '5%',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
  },
};

const AboutPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [{ isMobile }] = useAppContext();
  const bowser = Bowser.parse(window.navigator.userAgent);
  const { browser, os, platform } = bowser;

  const { version } = PackageJSON;

  return (
    <>
      <Paper
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          height: isMobile ? '90vh' : '80vh',
          padding: 10,
          placeItems: 'center',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', width: '25%', justifyContent: 'center' }}>
          <img style={style.imageSize} src="/images/logos/laboite/Logo-A-fond.png" alt="test" />
        </div>
        <div style={{ width: isMobile ? '100%' : '50vw' }}>
          <Typography variant={isMobile ? 'h6' : 'h3'} sx={{ color: '#02235E' }}>
            {i18n.__('pages.AboutPage.welcome')} <i style={{ color: '#5AA1D8' }}>LaBoite - {version}</i>
          </Typography>
          <p>
            {i18n.__('pages.AboutPage.developped')}{' '}
            <a title="EUPL 1.2" target="_blank" rel="noreferrer noopener" href="https://eupl.eu/1.2/fr/">
              EUPL 1.2
            </a>
          </p>
          <p>
            {i18n.__('pages.AboutPage.by')}{' '}
            <a title="PCLL" target="_blank" rel="noreferrer noopener" href="https://pcll.ac-dijon.fr/pcll/">
              Pôle de Compétences Logiciels Libres
            </a>{' '}
            {i18n.__('pages.AboutPage.contributions')}{' '}
            <a title="DINUM" target="_blank" rel="noreferrer noopener" href="https://www.numerique.gouv.fr/dinum/">
              Direction interministérielle du numérique
            </a>{' '}
            {i18n.__('pages.AboutPage.and')}{' '}
            <a title="MENJ" target="_blank" rel="noreferrer noopener" href="https://www.education.gouv.fr/">
              Ministère de l Education Nationale, de la Jeunesse, des Sports et des Jeux Olympiques et Paralympiques
            </a>
          </p>
          {i18n.__('pages.AboutPage.links')}
          <ul>
            <li>
              <a title="chat mim-libre" target="_blank" rel="noreferrer noopenner" href="https://chat.mim-libre.fr">
                {i18n.__('pages.AboutPage.chat')}
              </a>
            </li>
            <li>
              <a title="chat mim-libre" target="_blank" rel="noreferrer noopenner" href=" https://dev-eole.ac-dijon.fr">
                {i18n.__('pages.AboutPage.website')}
              </a>
            </li>
            <li>
              <a
                title="mastodon"
                target="_blank"
                rel="noreferrer noopenner"
                href="https://mastodon.eole.education/@EOLE"
              >
                Mastodon
              </a>
            </li>
            <li>
              <a title="wiki eole" target="_blank" rel="noreferrer noopenner" href="https://wiki.eole.education/">
                Wiki EOLE
              </a>
            </li>
            <li>
              <a
                title="dépot du projet"
                target="_blank"
                rel="noreferrer noopenner"
                href="https://gitlab.mim-libre.fr/alphabet/laboite"
              >
                {i18n.__('pages.AboutPage.deposit')}
              </a>
            </li>
          </ul>
          <Button sx={{ marginTop: '5vh' }} variant="contained" onClick={() => setIsOpen(true)}>
            {i18n.__('pages.AboutPage.information')}
          </Button>
        </div>
      </Paper>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Paper sx={style.paper}>
          <Typography variant="h4">{i18n.__('pages.AboutPage.Modal.information')}</Typography>
          <p>
            {i18n.__('pages.AboutPage.Modal.navigator')} {JSON.stringify(browser.name)}
          </p>
          <p>
            {i18n.__('pages.AboutPage.Modal.version')} {JSON.stringify(browser.version)}
          </p>
          <p>
            {i18n.__('pages.AboutPage.Modal.os')} {JSON.stringify(os.name)}
          </p>
          <p>
            {i18n.__('pages.AboutPage.Modal.device')} {JSON.stringify(platform.type)}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="contained" onClick={() => setIsOpen(false)}>
              {i18n.__('pages.AboutPage.Modal.close')}
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                navigator.clipboard.writeText(
                  `Navigateur: ${browser.name},
                 Version: ${JSON.stringify(browser.version)},
                 Os: ${JSON.stringify(os.name)},
                 Appareil: ${JSON.stringify(platform.type)}`,
                )
              }
            >
              {i18n.__('pages.AboutPage.Modal.copy')}
            </Button>
          </div>
        </Paper>
      </Modal>
    </>
  );
};

export default AboutPage;
