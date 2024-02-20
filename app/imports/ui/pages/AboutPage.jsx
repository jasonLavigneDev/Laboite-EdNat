// eslint-disable-next-line no-restricted-imports
import { Paper, Modal, Typography, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { makeStyles } from 'tss-react/mui';
import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
// eslint-disable-next-line import/no-extraneous-dependencies
import Bowser from 'bowser';
import { useAppContext } from '../contexts/context';
import PackageJSON from '../../../package.json';
import Footer from '../components/menus/Footer';
import TopBar from '../components/menus/TopBar';

const useStyles = makeStyles()((_theme, props) => ({
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
    flexDirection: props.isMobile ? 'column' : 'row',
    height: props.isMobile ? '90vh' : '80vh',
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
    width: props.isMobile ? '100%' : '50vw',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
}));

const AboutPage = () => {
  const [{ isMobile, user }] = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const bowser = Bowser.parse(window.navigator.userAgent);
  const { browser, os, platform } = bowser;
  const { classes } = useStyles({ isMobile });
  const { version } = PackageJSON;

  const handleClickModal = () => {
    navigator.clipboard.writeText(
      `Navigateur: ${browser.name},
                 Version: ${JSON.stringify(browser.version)},
                 Os: ${JSON.stringify(os.name)},
                 Appareil: ${JSON.stringify(platform.type)}`,
    );
    toast.success(i18n.__('pages.AboutPage.Modal.success'));
    setIsOpen(false);
  };

  return (
    <>
      {!user && <TopBar publicMenu root="/" />}
      <Paper className={classes.containerPaper}>
        <div className={classes.imgContainer}>
          <img className={classes.imageSize} src="/images/logos/eole/puce_eole.png" alt="puce eole" />
        </div>
        <div className={classes.textZone}>
          <Typography variant={isMobile ? 'h6' : 'h3'}>
            <i style={{ color: '#372F84' }}>LaBoite - version {version}</i>
          </Typography>
          <p>
            {i18n.__('pages.AboutPage.developped')}{' '}
            <a title="EUPL 1.2" target="_blank" rel="noreferrer noopener" href="https://eupl.eu/1.2/fr/">
              EUPL 1.2
            </a>{' '}
            {i18n.__('pages.AboutPage.socle')}{' '}
            <a title="EOLE 3" target="_blank" rel="noreferrer noopener" href="https://pcll.ac-dijon.fr/eole/eole-3/">
              EOLE³
            </a>
          </p>
          <p>
            {i18n.__('pages.AboutPage.by')}{' '}
            <a title="PCLL" target="_blank" rel="noreferrer noopener" href="https://pcll.ac-dijon.fr/pcll/">
              Pôle de Compétences Logiciels Libres
            </a>{' '}
            {i18n.__('pages.AboutPage.and')}{' '}
            <a title="MENJ" target="_blank" rel="noreferrer noopener" href="https://www.education.gouv.fr/">
              Ministère de l`&apos;`Éducation Nationale et de la Jeunesse
            </a>{' '}
            {i18n.__('pages.AboutPage.contributions')}{' '}
            <a title="DINUM" target="_blank" rel="noreferrer noopener" href="https://www.numerique.gouv.fr/dinum/">
              Direction Interministérielle du Numérique
            </a>{' '}
            {i18n.__('pages.AboutPage.external')}
          </p>
          <p>
            {i18n.__('pages.AboutPage.links')}{' '}
            <a title="wiki eole" target="_blank" rel="noreferrer noopener" href="https://eole.education/">
              documentation du portail.
            </a>
          </p>
          <p>
            {i18n.__('pages.AboutPage.exchange')}{' '}
            <a
              title={i18n.__('pages.AboutPage.chat')}
              target="_blank"
              rel="noreferrer noopener"
              href="https://chat.mim-libre.fr"
            >
              {i18n.__('pages.AboutPage.chat')}.
            </a>
          </p>
          <p>
            {i18n.__('pages.AboutPage.news')}{' '}
            <a title="Mastodon" target="_blank" rel="noreferrer noopenner" href="https://mastodon.eole.education/@EOLE">
              Mastodon.
            </a>
          </p>
          <p>
            <p>
              {i18n.__('pages.AboutPage.contributing')}{' '}
              <a
                title={i18n.__('pages.AboutPage.deposit')}
                target="_blank"
                rel="noreferrer noopenner"
                href="https://gitlab.mim-libre.fr/alphabet/laboite"
              >
                {i18n.__('pages.AboutPage.deposit')}.
              </a>
            </p>
          </p>
          <Button sx={{ marginTop: '5vh' }} variant="contained" onClick={() => setIsOpen(true)}>
            {i18n.__('pages.AboutPage.information')}
          </Button>
        </div>
      </Paper>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Paper className={classes.paper}>
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
            <Button variant="contained" onClick={() => handleClickModal()}>
              {i18n.__('pages.AboutPage.Modal.copy')}
            </Button>
          </div>
        </Paper>
      </Modal>
      {!user && !isMobile && (
        <div className={classes.footer}>
          <Footer />
        </div>
      )}
    </>
  );
};

export default AboutPage;
