import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { Accounts } from 'meteor/accounts-base';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import { useWindowSize } from '../utils/hooks';
import reducer, { MOBILE_SIZE, TABLET_SIZE } from './reducer';
import getLang from '../utils/getLang';
import Structures, { propTypes as structuresPropTypes } from '../../api/structures/structures';

const initialState = {
  user: Meteor.user(),
  userId: null,
  isMobile: window.innerWidth < MOBILE_SIZE,
  isTablet: window.innerWidth < TABLET_SIZE && window.innerWidth > MOBILE_SIZE,
  language: getLang().substr(0, 2),
  loggingIn: Accounts.loggingIn(),
  authenticated: false,
  isIframed: window.self !== window.top,
  servicePage: {},
  groupPage: {},
  articlePage: {},
  publishersPage: {},
  notificationPage: {},
  pollPage: {},
  addressBookPage: {},
  roles: [],
  uploads: [],
  structure: {},
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

const Store = ({ children, loggingIn, user, userId, authenticated, roles, loadingUser, structure }) => {
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
        structure,
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
  }, [loggingIn, user, userId, authenticated, roles, loadingUser]);

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
  const structureHandle = Meteor.subscribe('structures.one');
  const structure =
    user && user.structure && user.structure.length ? Structures.findOne({ _id: user.structure }) : undefined;

  return {
    loadingUser,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    user,
    userId,
    roles: Roles.getRolesForUser(userId),
    loadingStructure: !structureHandle.ready(),
    structure,
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
  structure: undefined,
};

Store.propTypes = {
  authenticated: PropTypes.bool,
  loadingUser: PropTypes.bool,
  loggingIn: PropTypes.bool,
  userId: PropTypes.string,
  user: PropTypes.objectOf(PropTypes.any),
  roles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.element.isRequired,
  structure: structuresPropTypes,
};
