const SlackClient = require('@slack/client');
const EnvConfig = require('./env.config');

const { RtmClient, RTM_EVENTS } = SlackClient;
const rtm = new RtmClient(EnvConfig.Slack.BOT_TOKEN);

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  console.log(message);
});

// client.chat.postMessage('@hsuan', 'hello', { as_user: true });
