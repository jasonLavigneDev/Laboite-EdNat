/* eslint-disable no-useless-escape */
function template(content, options) {
  return Object.entries(options).reduce((acc, [key, value]) => {
    const re = new RegExp(`{{${key}}}`, 'g');

    return acc.replace(re, value);
  }, content);
}

/**
 * Inspired from https://dev.to/derder56/how-to-build-a-css-minifier-with-8-lines-of-javascript-4bj3
 */
function minifyCss(content) {
  return (
    content
      .replace(/([^0-9a-zA-Z\.#\+\-\/\%])\s+/g, '$1')
      .replace(/\s([^0-9a-zA-Z\.#\+\-\/\%]+)/g, '$1')
      // get rid of spaces next to non-alphanumerical (not a-z, A-Z, #, ., or 0-9) characters. for some reason combining these result in an error.
      .replace(/;}/g, '}')
      // get rid of semicolons where they're not needed (just before the end of a css declaration, the character })
      .replace(/\/\*.*?\*\//g, '')
    // get rid of comments
  );
}

const widgtStyle = Assets.getText('widget/style.css');
const widgtScript = Assets.getText('widget/script.js');
const widgtDemo = Assets.getText('widget/index.html');

const style = minifyCss(widgtStyle);

export const widget = () => {
  const { theme } = Meteor.settings.public;

  return template(widgtScript, {
    theme,
    absoluteUrl: Meteor.absoluteUrl(),
    style,
    rootUrl: process.env.ROOT_URL,
    chatbotUrl: 'https://chat.rizomo.numerique.gouv.fr/',
  });
};

export const demo = () => {
  return template(widgtDemo, {
    scriptUrl: `${Meteor.absoluteUrl()}/scripts/widget`,
  });
};
