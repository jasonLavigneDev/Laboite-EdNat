import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import Screencast from '../components/screencast/Screencast';
import { useAppContext } from '../contexts/context';
import Helps from '../../api/helps/helps';
import { useZoneStyles } from '../components/personalspace/PersonalZone';

const sortCategName = (a, b) => a.localeCompare(b);

function HelpPage() {
  const { trackEvent } = useMatomo();
  const [openScreencast, setScreencastModal] = useState(false);
  const [{ isMobile }] = useAppContext();
  const helps = useTracker(() => {
    const subs = Meteor.subscribe('helps.all');
    const helpsData = Helps.find({}, { sort: { title: 1 }, limit: 10000 });
    const categorieData = new Set([]);
    helpsData.forEach(({ category }) => categorieData.add(category));
    const categoryArray = Array.from(categorieData);
    return subs.ready()
      ? [...categoryArray.sort(sortCategName)].map((category) => ({
          name: category,
          items: Helps.find({ category }, { sort: { title: 1 }, limit: 10000 }),
        }))
      : [];
  });

  const useStyles = makeStyles((theme) => ({
    card: {
      // margin: 10,
      // height: '18vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    container: {
      minHeight: 'calc(100vh - 246px)',
    },
    grid: {
      display: 'flex',
      padding: 1,
    },
    buttonText: {
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
      textTransform: 'none',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
      fontWeight: 'bold',
      '&:hover': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.tertiary.main,
      },
    },
    closeButton: {
      width: '30px',
      height: '30px',
      cursor: 'pointer',
    },
    button: {
      display: 'flex',
      justifyContent: 'right',
      marginTop: 75,
    },
    gridModal: {
      marginTop: '30px',
      backgroundColor: 'white',
      width: 'fit-content',
      height: 'fit-content',
      margin: 'auto',
    },
    modal: {
      display: 'grid',
    },
    modalHead: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: 20,
      alignItems: 'center',
    },
  }));

  const classes = useStyles();
  const zoneClasses = useZoneStyles();

  const [modalState, setModalState] = useState({
    link: '',
    name: '',
  });

  const openItem = (item) => {
    trackEvent({
      category: 'signin-page',
      action: 'click-help',
      name: `Ouvre l'aide ${item.title}`,
    });
    if (item.type === 5) {
      setModalState({
        link: item.content,
        name: item.title,
      });

      setScreencastModal(true);
    } else {
      window.open(item.content);
    }
  };

  // React.useEffect(() => {
  //   // openItem(helps[0]);
  //   console.log({ helps });
  // }, [helps]);
  return (
    <Fade in>
      <Container className={classes.container}>
        <Grid container spacing={4} direction={isMobile ? 'column' : 'row'} className={classes.grid}>
          <Grid item md={12}>
            <Typography variant={isMobile ? 'h5' : 'h4'}>{i18n.__('pages.HelpPage.title')}</Typography>
          </Grid>
          {helps.map((category) => (
            <Grid item md={12} key={category.name}>
              <Accordion className={zoneClasses.expansionpanel} expanded>
                <AccordionSummary
                  aria-controls={`zone-${category.name}`}
                  id={`expand-${category.name}`}
                  className={{
                    expanded: zoneClasses.expansionpanelsummaryexpanded,
                    content: zoneClasses.expansionpanelsummarycontent,
                  }}
                >
                  <Typography variant="h5" color="primary" className={zoneClasses.zone}>
                    {category.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={4} className={classes.grid}>
                    {category.items.map(({ title, type, content, description }) => (
                      <Grid item xs={12} md={6} lg={4} key={title}>
                        <Card className={classes.card}>
                          <CardHeader title={title} />

                          <CardContent>
                            {!!description && (
                              <Typography color="textSecondary" gutterBottom>
                                {description}
                              </Typography>
                            )}
                          </CardContent>
                          <CardContent>
                            <Button
                              startIcon={<ExitToAppIcon />}
                              className={classes.buttonText}
                              size="large"
                              onClick={() => openItem({ title, type, content, description })}
                            >
                              {i18n.__('pages.HelpPage.tutoLabel')}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
        <Modal open={openScreencast} onClose={() => setScreencastModal(false)}>
          <Grid container className={classes.gridModal}>
            <Grid item>
              <Box className={classes.modalHead}>
                <Typography variant="h4" style={{ textDecoration: 'underline' }}>
                  <b>{modalState.name || ''}</b>
                </Typography>

                <CancelIcon className={classes.closeButton} onClick={() => setScreencastModal(false)} />
              </Box>
              <Screencast link={modalState.link} />
            </Grid>
          </Grid>
        </Modal>
      </Container>
    </Fade>
  );
}

export default HelpPage;
