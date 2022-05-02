import React from 'react';
import i18n from 'meteor/universe:i18n';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Spinner from '../components/system/Spinner';
import IntroductionAccordion from '../components/introduction/IntroductionAccordion';
import { useCurrentIntroduction } from '../../api/appsettings/hooks';
import { useStructuresOfUserWithIntroductions } from '../../api/structures/hooks';
import { useAppContext } from '../contexts/context';

const IntroductionPage = () => {
  const { data: introductionContent, loading: introductionLoading } = useCurrentIntroduction();
  const { data: structuresIntroductionContent, loading: structuresIntroductionLoading } =
    useStructuresOfUserWithIntroductions();

  const [{ isMobile, user }] = useAppContext();
  const { disabledFeatures = {} } = Meteor.settings.public;

  const haveStructuresIntroduction = structuresIntroductionContent && structuresIntroductionContent.length > 0;

  return (
    <>
      <Fade in>
        <Container>
          {introductionLoading ? (
            <Spinner />
          ) : (
            <IntroductionAccordion
              startExpanded
              summary={i18n.__('pages.IntroductionPage.titleAppIntroduction')}
              body={introductionContent.content || i18n.__('pages.IntroductionPage.noContent')}
            />
          )}
          {!disabledFeatures.introductionTabStructuresInfos && (
            <>
              {haveStructuresIntroduction ? (
                structuresIntroductionLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <Divider />
                    <Typography variant={isMobile ? 'h6' : 'h4'}>
                      {i18n.__('pages.IntroductionPage.titleStructures')}
                    </Typography>
                    {structuresIntroductionContent.map((structure) => (
                      <IntroductionAccordion
                        key={structure._id}
                        startExpanded={(() => structure._id === user.structure)()}
                        summary={structure.name}
                        head={structure.introduction.title || `${i18n.__('pages.IntroductionPage.noTitle')}`}
                        body={structure.introduction.content || `${i18n.__('pages.IntroductionPage.noContent')}`}
                      />
                    ))}
                  </>
                )
              ) : null}
            </>
          )}
        </Container>
      </Fade>
    </>
  );
};

export default IntroductionPage;
