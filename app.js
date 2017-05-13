import { RtmClient, WebClient, RTM_EVENTS } from '@slack/client';
import EnvConfig from './env.config.json';
import { parseCommand, Constants } from './lib';
import { executeCommand, helpOptions } from './command';

const rtmClient = new RtmClient(EnvConfig.Slack.BOT_TOKEN);
const webClient = new WebClient(EnvConfig.Slack.BOT_TOKEN);

rtmClient.on(RTM_EVENTS.MESSAGE, (message) => {
  if (!/^D/.test(message.channel) || !message.text) {
    // has to be direct message to bot
    return;
  }

  const user = rtmClient.dataStore.getUserById(message.user);
  if (!user || user.is_bot) {
    // should not process my own message
    return;
  }

  parseCommand(message.text)
    .then(executeCommand)
    .then(({ response, options }) => webClient.chat.postMessage(message.channel, response, options))
    .catch((error) => {
      switch (error.message || error) {
        case Constants.INVALID_COMMAND:
        case Constants.INVALID_INPUT:
          return webClient.chat.postMessage(message.channel, '', helpOptions);

        case Constants.NO_SUCH_TRAINEE:
          return webClient.chat.postMessage(message.channel, '', {
            attachments: [{
              color: 'danger',
              text: '找不到這個學員',
            }],
          });

        case Constants.COMMAND_FAILED:
        default:
          return webClient.chat.postMessage(message.channel, error.stack);
      }
    });
});

rtmClient.start();
