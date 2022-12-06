import { Meteor } from 'meteor/meteor';

export const isUrlExternal = (url) => {
  if (url.search(Meteor.absoluteUrl()) === -1 && url.search('http') !== -1) {
    return true;
  }
  return false;
};

// Test if the url from Meteor settings end by /
// if no, add it
// withSlash is a boolean to decide if you want a slash at the end of the url
export const testMeteorSettingsUrl = (settingsUrl, withSlash = false) => {
  const url = settingsUrl;
  if (withSlash) {
    if (settingsUrl.charAt(settingsUrl.length - 1) !== '/') {
      return `${url}/`;
    }
    return url;
  }
  if (settingsUrl.charAt(settingsUrl.length - 1) === '/') {
    // delete last slash
    return url.replace(/.$/, '');
  }
  return url;
};

export const getGroupName = (group) => {
  if (group.type !== 15) return group.name;

  return `[STRUC] ${group.name.slice(group.name.indexOf('_') + 1, group.name.length)}`;
};

// delete when there is more than one function in this file
export const tempFunction = (args) => console.log(args);
