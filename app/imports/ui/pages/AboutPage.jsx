// eslint-disable-next-line no-restricted-imports
import { Paper, Modal, Typography, Button } from '@mui/material';
import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
// eslint-disable-next-line import/no-extraneous-dependencies
import Bowser from 'bowser';
import { useAppContext } from '../contexts/context';

import PackageJSON from '../../../package.json';

const AboutPage = () => {
  const [{ isMobile }] = useAppContext();

  const style = {
    imageSize: {
      height: '10vw',
      placeContent: 'center',
    },
    marginRight: {
      marginRight: '-10vw',
    },
    paper: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '5%',
    },
    containerPaper: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: isMobile ? '90vh' : '80vh',
      padding: 10,
      placeItems: 'center',
      overflow: 'auto',
    },
    imgContainer: {
      display: 'flex',
      width: '25%',
      justifyContent: 'center',
    },
    textZone: {
      width: isMobile ? '100%' : '50vw',
    },
  };
  const [isOpen, setIsOpen] = useState(false);
  const bowser = Bowser.parse(window.navigator.userAgent);
  const { browser, os, platform } = bowser;

  const { version } = PackageJSON;

  return (
    <>
      <Paper style={style.containerPaper}>
        <div style={style.imgContainer}>
          <img style={style.imageSize} src="/images/logos/laboite/Logo-A-fond.png" alt="test" />
        </div>
        <div style={style.textZone}>
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
