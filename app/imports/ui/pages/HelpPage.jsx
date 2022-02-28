import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import i18n from 'meteor/universe:i18n';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CancelIcon from '@material-ui/icons/CancelOutlined';
import Screencast from '../components/screencast/Screencast';
import { useAppContext } from '../contexts/context';
import Helps from '../../api/helps/helps';

function HelpPage() {
  const [openScreencast, setScreencastModal] = useState(false);
  const [{ isMobile }] = useAppContext();
  const helps = useTracker(() => {
    const subs = Meteor.subscribe('helps.all');
    const ready = subs.ready();
    return ready ? Helps.find({}, { sort: { title: 1 }, limit: 10000 }) : [];
  });

  const useStyles = makeStyles((theme) => ({
    card: {
      // margin: 10,
      // height: '18vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
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
      marginRight: '20px',
      marginTop: '-30px',
      width: '30px',
      height: '30px',
      position: 'absolute',
      display: 'flex',
      justifyContent: 'right',
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
  }));

  const classes = useStyles();
  const [link, setLink] = useState('');

  const openItem = (item) => {
    if (item.type === 5) {
      setLink(item.content);
      setScreencastModal(true);
    } else {
      window.open(item.content);
    }
  };

  return (
    <Fade in>
      <Container>
        <Grid container spacing={4} direction={isMobile ? 'column' : 'row'} className={classes.grid}>
          <Grid item md={12}>
            <Typography variant={isMobile ? 'h5' : 'h4'}>{i18n.__('pages.HelpPage.title')}</Typography>
          </Grid>
          {helps.map(({ title, type, content, description }) => (
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
        <Modal open={openScreencast} onClose={() => setScreencastModal(false)}>
          <Grid container className={classes.gridModal}>
            <Grid item className={classes.button}>
              <CancelIcon className={classes.closeButton} onClick={() => setScreencastModal(false)} />
              <Screencast link={link} />
            </Grid>
          </Grid>
        </Modal>
      </Container>
    </Fade>
  );
}

export default HelpPage;
