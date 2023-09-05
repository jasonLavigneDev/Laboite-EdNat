import { Meteor } from 'meteor/meteor';
import React, { useContext, createContext } from 'react';
import PropTypes from 'prop-types';
import { useTracker } from 'meteor/react-meteor-data';
import { getSettings } from '../../api/settings/settings';

const subscribeToSettings = () =>
  useTracker(() => {
    const handle = Meteor.subscribe('settings');
    const loading = !handle.ready();
    const data = loading ? null : getSettings();

    return { data, loading };
  });

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const { data, loading } = subscribeToSettings();

  if (loading) return null;

  return <SettingsContext.Provider value={data}>{children}</SettingsContext.Provider>;
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSettings = () => {
  /** @type {import('../../api/settings/settings').MeteorSettings} */
  const ctx = useContext(SettingsContext);

  return ctx;
};
