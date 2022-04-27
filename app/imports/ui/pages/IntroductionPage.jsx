import React from 'react';
import i18n from 'meteor/universe:i18n';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Spinner from '../components/system/Spinner';
import IntroductionAccordion from '../components/introduction/IntroductionAccordion';
import { useCurrentIntroduction } from '../../api/appsettings/hooks';

const IntroductionPage = () => {
  const { data: introductionContent, loading: introductionLoading } = useCurrentIntroduction();

  return (
    <>
      {introductionLoading ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container>
            <IntroductionAccordion
              startExpanded
              summary={i18n.__('pages.IntroductionPage.titleAppIntroduction')}
              body={introductionContent.content || i18n.__('pages.IntroductionPage.noContent')}
            />
          </Container>
        </Fade>
      )}
    </>
  );
};

export default IntroductionPage;
