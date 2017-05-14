import express from 'express';
import { WebClient } from '@slack/client';
import EnvConfig from './env.config.json';

const webClient = new WebClient(EnvConfig.Slack.BOT_TOKEN);

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('歡迎來到漢堡王！').end();
});

const receivedMessage = (event) => {
  // Putting a stub for now, we'll expand it in the following steps
  webClient.chat.postMessage('@hsuan', `Message data: ${event.message}`);
};

app.post('/webhook', (req, res) => {
  const data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach((entry) => {
      const pageID = entry.id;
      const timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach((event) => {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log(`Webhook received unknown event: ${event}`);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
