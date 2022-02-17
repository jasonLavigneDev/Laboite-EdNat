import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { Accounts } from 'meteor/accounts-base';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';

import { useWindowSize } from '../utils/hooks';
import reducer, { MOBILE_SIZE } from './reducer';
import getLang from '../utils/getLang';

const initialState = {
  user: Meteor.user(),
  userId: null,
  isMobile: window.innerWidth < MOBILE_SIZE,
  language: getLang().substr(0, 2),
  loggingIn: Accounts.loggingIn(),
  authenticated: false,
  isIframed: window.self !== window.top,
  servicePage: {},
  groupPage: {},
  articlePage: {},
  publishersPage: {},
  notificationPage: {},
  roles: [],
  uploads: [],
  /** Liste d'ids de structure pour les services.
   * Celà concerne tout les ids de tout les parents de la structure actuelle.
   */
  structureIds: [],
};

const logger = (state, action) => {
  const newState = reducer(state, action);
  if (Meteor.isDevelopment) {
    console.groupCollapsed('Action Type:', action.type);
    console.log('Prev state: ', state);
    console.log('Next state: ', newState);
    console.groupEnd();
  }
  return newState;
};

const sendStateToIframe = (userId) => {
  window.top.postMessage(
    {
      type: 'userLogged',
      content: !!userId,
    },
    '*',
  );
};

const Store = ({ children, loggingIn, user, userId, authenticated, roles, loadingUser, structureIds }) => {
  const [state, dispatch] = useReducer(logger, initialState);
  const { width } = useWindowSize();

  useEffect(() => {
    dispatch({ type: 'mobile', data: { width } });
  }, [width]);

  useEffect(() => {
    dispatch({
      type: 'user',
      data: {
        loadingUser,
        loggingIn,
        user,
        userId,
        authenticated,
        roles,
        structureIds,
      },
    });
    if (user && user.language && user.language !== state.language) {
      dispatch({
        type: 'language',
        data: {
          language: user.language,
        },
      });
    }
    if (state.isIframed) {
      sendStateToIframe(userId);
    }
  }, [loggingIn, user, userId, authenticated, roles, loadingUser, structureIds]);

  return <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>;
};

export const Context = createContext(initialState);
export const useAppContext = () => useContext(Context);

const DynamicStore = withTracker(() => {
  const userHandle = Meteor.subscribe('userData');
  const loadingUser = !userHandle.ready() && !Roles.subscription.ready();
  const loggingIn = Meteor.loggingIn();
  const user = Meteor.user();
  const userId = Meteor.userId();
  const structureIds = [];

  if (user && user.structure) {
    Meteor.call('structures.getAncestorsIds', { structureId: user.structure }, (error, response) => {
      if (error) {
        msg.error(error.reason || error.details[0].message);
      } else {
        structureIds.push(...new Set([...response, user.structure]));
      }
    });
  }

  return {
    loadingUser,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    user,
    userId,
    roles: Roles.getRolesForUser(userId),
    structureIds,
  };
})(Store);

export default DynamicStore;

Store.defaultProps = {
  authenticated: false,
  loadingUser: false,
  loggingIn: false,
  userId: undefined,
  user: {},
  roles: [],
  structureIds: [],
};

Store.propTypes = {
  authenticated: PropTypes.bool,
  loadingUser: PropTypes.bool,
  loggingIn: PropTypes.bool,
  userId: PropTypes.string,
  user: PropTypes.objectOf(PropTypes.any),
  roles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.element.isRequired,
  structureIds: PropTypes.arrayOf(PropTypes.string),
};
