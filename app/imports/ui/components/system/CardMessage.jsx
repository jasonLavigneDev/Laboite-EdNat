import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

const useStyles = makeStyles()({
  root: {
    marginTop: 20,
    height: '72vh',
  },
  actions: {
    display: 'flex',
    justifyContent: 'right',
  },
});

const CardMessage = ({ title, titleData = {}, subtitle, subtitleData = {}, link, linkText }) => {
  const { classes } = useStyles();
  return (
    <Grid className={classes.root} container justifyContent="center">
      <Grid item md={4} xs={11}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {i18n.__(title, titleData)}
            </Typography>
            <Typography variant="h6" component="h3">
              {i18n.__(subtitle, subtitleData)}
            </Typography>
          </CardContent>
          <CardActions className={classes.actions}>
            {!!link && (
              <Link to={link} className={classes.noUnderline}>
                <Button variant="contained" color="primary">
                  {i18n.__(linkText)}
                </Button>
              </Link>
            )}
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CardMessage;

CardMessage.propTypes = {
  title: PropTypes.string.isRequired,
  titleData: PropTypes.objectOf(PropTypes.any),
  subtitle: PropTypes.string.isRequired,
  subtitleData: PropTypes.objectOf(PropTypes.any),
  link: PropTypes.string,
  linkText: PropTypes.string,
};

CardMessage.defaultProps = {
  link: null,
  linkText: null,
  titleData: {},
  subtitleData: {},
};
