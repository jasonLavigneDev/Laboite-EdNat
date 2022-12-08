const widgtStyle = Assets.getText('widget/style.css');
const widgtScript = Assets.getText('widget/script.js');

function template(content, options) {
  return Object.entries(options).reduce((acc, [key, value]) => {
    const re = new RegExp(`{{${key}}}`, 'g');

    return acc.replace(re, value);
  }, content);
}

export const widget = () => {
  const { theme } = Meteor.settings.public;

  return template(widgtScript, {
    theme,
    absoluteUrl: Meteor.absoluteUrl(),
    style: widgtStyle,
    rootUrl: process.env.ROOT_URL,
  });
};
