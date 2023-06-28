import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import i18n from 'meteor/universe:i18n';
import { Steps } from 'intro.js-react';
import { useHistory } from 'react-router-dom';
import updateDocumentTitle from '../../utils/updateDocumentTitle';
import * as widget from '../../utils/widget';
import { useAppContext } from '../appContext';

/**
 * @callback registerStep
 * @param {Omit<import('intro.js-react').Step, "element">} step
 * @returns {import('react').HTMLProps<HTMLElement>}
 */

/**
 * @callback registerHint
 * @param {Omit<import('intro.js-react').Hint, "element">} hint
 * @returns {import('react').HTMLProps<HTMLElement>}
 */

/**
 * @typedef {Object} Context
 * @property {import('react').Dispatch<import('react').SetStateAction<boolean>>} setStepsEnabled
 * @property {import('react').Dispatch<import('react').SetStateAction<boolean>>} setHintsEnabled
 * @property {registerStep} registerStep
 * @property {registerHint} registerHint
 * @property {Array<import('intro.js-react').Step>} steps
 * @property {Array<import('intro.js-react').Hint>} hints
 */

/**
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

/**
 * @template T
 * @typedef {import('react').MutableRefObject<T>} useRef
 */

/**
 *
 * @param {string} key
 */
export function tOnBoarding(key) {
  return {
    title: i18n.__(`onBoarding.steps.${key}.title`),
    intro: i18n.__(`onBoarding.steps.${key}.text`),
  };
}

export const onBoardingContext = createContext({});
export const useOnBoarding = () => useContext(onBoardingContext);

/**
 *
 * @param {number} ms
 * @returns
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Asyncronously returns the first element that is a descendant of node that matches selectors.
 * If does not find any elements it will retry 7 times to wait for the DOM to update.
 * @param {keyof HTMLElementTagNameMap} selector
 * @param {number} depth
 * @returns {Promise<HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | null>}
 */
async function asyncQuerySelector(selector, depth = 0) {
  const element = document.querySelector(selector);

  if (element) {
    return element;
  }

  if (depth > 7) {
    return null;
  }

  await wait(2 ** depth * 10);
  return asyncQuerySelector(selector, depth + 1);
}

/**
 *
 * @param {Object} props
 * @param {JSX.Element} props.children
 * @param {Array<import('intro.js-react').Step>} props.initialSteps
 * @param {Array<import('intro.js-react').Hint>} props.initialHints
 * @returns {JSX.Element}
 */
export default function OnBoardingProvider({ children }) {
  const [{ userId }] = useAppContext();
  const history = useHistory();
  const [areStepsEnabled, setStepsEnabled] = useState(false);
  /**
   * @type {useRef<import('intro.js-react').Steps>}
   */
  const ref = useRef();
  const localStorageKey = `introjs-onboarding-completed-${userId}`;

  const changePage = useCallback((link) => {
    updateDocumentTitle(i18n.__(link.title));
    history.push(link.path);
  }, []);

  /**
   * @type {Array<import('intro.js-react').Step>}
   */
  const steps = [
    {
      ...tOnBoarding('intro'),
    },
    {
      ...tOnBoarding('mySpace'),
      element: '[data-tour-id="mySpace"]',
      link: {
        path: '/',
        title: 'menuMyspace',
      },
    },
    {
      ...tOnBoarding('zone'),
      element: '[data-tour-id="zone"]',
      link: {
        path: '/',
        title: 'components.MenuBar.menuMyspace',
      },
    },
    // {
    //   ...tOnBoarding('link'),
    //   element: '[data-tour-id="link"]',
    //   link: {
    //     path: '/',
    //     title: 'components.MenuBar.menuMyspace',
    //   },
    // },
    {
      ...tOnBoarding('services'),
      element: '[data-tour-id="services"]',
      link: {
        path: '/services',
        title: 'components.MenuBar.menuServices',
      },
    },
    // {
    //   ...tOnBoarding('editMySpace'),
    //   element: '[data-tour-id="editMySpace"]',
    //   link: {
    //     path: '/',
    //     title: 'components.MenuBar.menuMyspace',
    //   },
    // },
    {
      ...tOnBoarding('structure'),
      element: '[data-tour-id="structure"]',
      link: {
        path: '/structure',
        title: 'components.MenuBar.menuStructure',
      },
    },
    {
      ...tOnBoarding('menu'),
      element: '#main-menu-button',
      openMenu: true,
      // We don't want to wait for the menu to open to display the step
      wait: 0,
    },
    {
      ...tOnBoarding('bookMark'),
      element: '[data-tour-id="bookMark"]',
      openMenu: true,
      link: {
        path: '/userBookmarks',
        title: 'components.MainMenu.menuUserBookmarks',
      },
    },
    {
      ...tOnBoarding('addBookMark'),
      element: `button[aria-label="${i18n.__('pages.BookmarksPage.materialTableLocalization.body_addTooltip')}"]`,
      link: {
        path: '/userBookmarks',
        title: 'components.MainMenu.menuUserBookmarks',
      },
    },
    {
      ...tOnBoarding('help'),
      element: '[data-tour-id="help"]',
      openMenu: true,
      link: {
        path: '/userBookmarks',
        title: 'components.MainMenu.menuUserBookmarks',
      },
    },
    {
      ...tOnBoarding('replay'),
      openMenu: true,
      element: '[data-tour-id="replay"]',
      link: {
        path: '/userBookmarks',
        title: 'components.MainMenu.menuUserBookmarks',
      },
    },
    {
      title: i18n.__(`onBoarding.steps.end.title`),
      intro: (
        <>
          <img src="/images/cat-keyboard.gif" alt="" height="250" width="250" />
        </>
      ),
      link: {
        path: '/userBookmarks',
        title: 'components.MainMenu.menuUserBookmarks',
      },
    },
  ];

  const updateElement = useCallback(async (stepIndex) => {
    const currentStep = steps[stepIndex];

    const introjs = ref.current?.introJs;
    if (introjs) {
      if (introjs._introItems[stepIndex]) {
        const element = await asyncQuerySelector(currentStep.element);
        if (element) {
          introjs._introItems[stepIndex].element = element;
          introjs._introItems[stepIndex].position = currentStep.position;
        }
      }
    }
  }, []);

  // Automatically start the tour on the first time the page loads in the browser
  useEffect(() => {
    if (userId) {
      if (window.localStorage.getItem(localStorageKey) !== 'true') {
        setTimeout(() => setStepsEnabled(true), 225);
      }
    }
  }, []);

  useEffect(() => {
    if (ref.current?.introJs && areStepsEnabled) {
      const intervalId = setInterval(() => {
        ref.current?.introJs?.refresh();
      }, 500);

      return () => {
        clearInterval(intervalId);
      };
    }

    return () => null;
  }, [areStepsEnabled]);

  useEffect(() => {
    function handleResize() {
      const introjs = ref.current?.introJs;
      updateElement(introjs._currentStep).then(() => {
        ref.current?.introJs?.refresh();
      });
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <onBoardingContext.Provider
      value={{
        isOnboarding: areStepsEnabled,
        openTour: () => setStepsEnabled(true),
        closeTour: () => setStepsEnabled(true),
        steps,
      }}
    >
      <Steps
        enabled={areStepsEnabled}
        steps={steps.sort((a, b) => a.step - b.step)}
        initialStep={0}
        ref={ref}
        options={{
          exitOnEsc: true,
          exitOnOverlayClick: false,
          keyboardNavigation: true,
          disableInteraction: true,
          doneLabel: i18n.__(`onBoarding.actions.doneLabel`),
          nextLabel: i18n.__(`onBoarding.actions.nextLabel`),
          prevLabel: i18n.__(`onBoarding.actions.prevLabel`),
        }}
        onStart={async () => {
          try {
            await widget.setFullScreen(true);
          } catch (e) {
            // ignore error
          }
        }}
        onComplete={() => {
          window.localStorage.setItem(localStorageKey, 'true');
        }}
        onBeforeExit={(step) => {
          if (!areStepsEnabled || typeof step === 'undefined') return false;

          if (window.localStorage.getItem(localStorageKey) !== 'true') {
            // eslint-disable-next-line no-restricted-globals
            return confirm(i18n.__(`onBoarding.actions.cancelConfirm`));
          }

          return true;
        }}
        onExit={() => {
          setStepsEnabled(false);
          window.localStorage.setItem(localStorageKey, 'true');
        }}
        onBeforeChange={async (index, nextElement) => {
          try {
            if (!(await widget.isFullScreen())) {
              await widget.setFullScreen(true);
              await wait(500);
            }
          } catch (e) {
            // ignore error
          }

          const currentStep = steps[index];

          if (currentStep && currentStep.link) {
            changePage(currentStep.link);
          }

          // Dynamically update element if needed
          if (nextElement.classList.contains('introjsFloatingElement') && !!currentStep.element) {
            await updateElement(index);
          }

          // The element is not
          if (!document.body.contains(nextElement)) {
            await updateElement(index);
          }

          const doMenuNeedsToBeOpen = currentStep.openMenu ?? false;
          const menuButton = document.getElementById('main-menu-button');
          const mainMenu = document.getElementById('main-menu');
          if (mainMenu && menuButton) {
            const isMenuShown = mainMenu?.getAttribute('aria-hidden') !== 'true';
            if (isMenuShown !== doMenuNeedsToBeOpen) {
              if (doMenuNeedsToBeOpen) {
                menuButton.click();

                // Wait for the menu openning annimation to finish
                if (typeof currentStep.wait === 'undefined') {
                  return wait(225);
                }

                // If find it clearer to exlicitly use a else block in the case
                // eslint-disable-next-line no-else-return
              } else {
                mainMenu.children[0].click();
              }
            }
          }
          if (currentStep.wait) {
            return wait(currentStep.wait);
          }

          return true;
        }}
      />
      {children}
    </onBoardingContext.Provider>
  );
}

OnBoardingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
