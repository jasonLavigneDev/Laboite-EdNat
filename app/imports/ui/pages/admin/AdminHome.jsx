import React from 'react';
import i18n from 'meteor/universe:i18n';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

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
