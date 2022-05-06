import { onPageLoad } from 'meteor/server-render';

Meteor.startup(async () => {
  onPageLoad(async (sink) => {
    const { I18N_EN = '{}', I18N_FR = '{}' } = process.env;
    const dataString = `
          <script>
            window.I18N_EN = ${JSON.stringify(I18N_EN)}
            window.I18N_FR=${JSON.stringify(I18N_FR)}
          </script>
        `;
    sink.appendToBody(dataString);
  });
});
