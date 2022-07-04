import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    marginTop: 20,
    height: '72vh',
  },
  actions: {
    display: 'flex',
    justifyContent: 'right',
  },
});

const CardMessage = ({ title, subtitle, link, linkText }) => {
  const classes = useStyles();
  return (
    <Grid className={classes.root} container justifyContent="center">
      <Grid item md={4} xs={11}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {i18n.__(title)}
            </Typography>
            <Typography variant="h6" component="h3">
              {i18n.__(subtitle)}
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
  subtitle: PropTypes.string.isRequired,
  link: PropTypes.string,
  linkText: PropTypes.string,
};

CardMessage.defaultProps = {
  link: null,
  linkText: null,
};
