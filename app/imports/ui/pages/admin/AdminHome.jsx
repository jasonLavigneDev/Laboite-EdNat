import React from 'react';
import i18n from 'meteor/universe:i18n';
import Container from '@material-ui/core/Container';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

export default function AdminHome() {
  return (
    <Fade in>
      <Container style={{ overflowX: 'auto' }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {i18n.__('pages.AdminHome.title')}
            </Typography>
            <Typography variant="h6" component="h3">
              {i18n.__('pages.AdminHome.subtitle')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Fade>
  );
}
