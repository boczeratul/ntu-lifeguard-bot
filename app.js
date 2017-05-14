import express from 'express';
import bodyParser from 'body-parser';
import EnvConfig from './env.config.json';
import { Logger, postMessage, parseCommand, Constants } from './lib';
import { executeCommand, helpOptions } from './command';

const logger = Logger('app.js');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const receivedMessage = (event) => {
  parseCommand(event.message.text)
  .then(executeCommand)
  .then(({ response }) => postMessage(event.sender.id, response))
  .catch((error) => {
    switch (error.message || error) {
      case Constants.INVALID_COMMAND:
      case Constants.INVALID_INPUT:
        return postMessage(event.sender.id, helpOptions.messages);

      case Constants.NO_SUCH_TRAINEE:
        return postMessage(event.sender.id, '找不到這個學員');

      case Constants.COMMAND_FAILED:
      default:
        return postMessage(event.sender.id, error.stack);
    }
  });
};

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === EnvConfig.Facebook.webhookToken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

app.post('/webhook', (req, res) => {
  const data = req.body;
  logger.info('Webhook data', data);

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach((entry) => {
      // const pageID = entry.id;
      // const timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach((event) => {
        if (event.message) {
          receivedMessage(event);
        }
      });
    });
  }

  res.sendStatus(200);
});

app.get('/privacy', (req, res) => {
  res.status(200).send('我們收集你提供給機器人的資訊、並只提供台大救生班內部管理使用。').end();
});

app.get('/', (req, res) => {
  res.status(200).send('歡迎來到漢堡王！').end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`App listening on port ${PORT}`);
});
