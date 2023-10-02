import React from 'react';
import i18n from 'meteor/universe:i18n';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Spinner from '../components/system/Spinner';
import IntroductionAccordion from '../components/introduction/IntroductionAccordion';
import { useCurrentGlobalInfo } from '../../api/appsettings/hooks';
import { useStructuresOfUserWithIntroductions } from '../../api/structures/hooks';
import { useAppContext } from '../contexts/context';

const IntroductionPage = () => {
  const { data: introductionContent, loading: introductionLoading } = useCurrentGlobalInfo();
  const { data: structuresIntroductionContent, loading: structuresIntroductionLoading } =
    useStructuresOfUserWithIntroductions();

  const [{ user }] = useAppContext();
  const { disabledFeatures = {} } = Meteor.settings.public;

  const isIntroductionEmpty = (introduction) =>
    introduction.content == null && typeof introduction.content !== 'string';

  const notEmptyIntroductions = structuresIntroductionContent.filter(
    (structure) => !isIntroductionEmpty(structure.introduction),
  );

  const haveStructuresIntroduction =
    structuresIntroductionContent && structuresIntroductionContent.length > 0 && notEmptyIntroductions.length > 0;

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
                    {notEmptyIntroductions.map((structure) => (
                      <IntroductionAccordion
                        key={structure._id}
                        startExpanded={(() => structure._id === user.structure)()}
                        summary={structure.name}
                        head={structure.introduction.title || false}
                        body={structure.introduction.content}
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
