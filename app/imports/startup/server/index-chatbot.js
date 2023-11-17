import { onPageLoad } from 'meteor/server-render';

Meteor.startup(async () => {
  onPageLoad(async (sink) => {
    if (Meteor.settings.public.chatbotUrl) {
      sink.appendToHead(`
        <style>
            #webchat {
                z-index: 2147483647;
            }
        </style>
      `);
      sink.appendToBody(`
        <script src="${Meteor.settings.public.chatbotUrl}backoffice/assets/scripts/embbed-chatbot.min.js"></script>
        <div id="webchat"></div>
        <script>
            function inIframe () {
                try {
                    return window.self !== window.parent;
                } catch (e) {
                    return true;
                }
            }
            
            if(!inIframe() || window.name !== 'lb_iframe-widget') {
                Webchat.init({
                    // Mandatory
                    botURL: '${Meteor.settings.public.chatbotUrl}chatbot',
                    ...JSON.parse(\`${JSON.stringify(Meteor.settings.public?.chatbotConfig ?? {})}\`)
                });
            }
        </script>
      `);
    }
  });
});
