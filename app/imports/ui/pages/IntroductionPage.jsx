import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Spinner from '../components/system/Spinner';
import { useAppContext } from '../contexts/context';
import AppSettings from '../../api/appsettings/appsettings';

const IntroductionPage = () => {
  const [{ isMobile }] = useAppContext();

  const { content, loading } = useTracker(() => {
    const language = i18n.getLocale().split('-')[0];
    const handle = Meteor.subscribe('appsettings.introduction');
    const _loading = !handle.ready();

    const appsettings = AppSettings.findOne() || {};
    const { introduction = [] } = appsettings;

    const data = introduction.find((entry) => entry.language === language);

    return { content: data.content, loading: _loading };
  });
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container>
            <Card>
              <CardContent>
                <Typography variant={isMobile ? 'h6' : 'h4'}>{i18n.__('pages.IntroductionPage.title')}</Typography>
                <div style={{ padding: '10px' }} dangerouslySetInnerHTML={{ __html: content }} />
              </CardContent>
            </Card>
          </Container>
        </Fade>
      )}
    </>
  );
};

export default IntroductionPage;
