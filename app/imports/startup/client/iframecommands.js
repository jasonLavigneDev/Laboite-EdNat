import { Meteor } from 'meteor/meteor';

const commands = {
  // eslint-disable-next-line object-shorthand
  'login-with-token'({ token, ...data }) {
    if (typeof token === 'string') {
      Meteor.loginWithToken(token, () => {
        console.log('Iframe command [login-with-token]: result', data);
      });
    }
  },
};

window.addEventListener('message', (e) => {
  const origins = Meteor.settings.public.loginWithTokenUrls;

  if (typeof e.data !== 'object' || typeof e.data.event !== 'string') {
    return;
  }

  if (origins !== '*' && origins.split(',').indexOf(e.origin) === -1) {
    console.log('Origin not allowed', e.origin);
    return;
  }

  const command = commands[e.data.event];
  command(e.data, e);
});
