import express from 'express';
import { WebClient } from '@slack/client';
import EnvConfig from './env.config.json';

const webClient = new WebClient(EnvConfig.Slack.BOT_TOKEN);

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('歡迎來到漢堡王！').end();
});

app.get('/webhook', (req, res) => {
  res.status(200).send('歡迎來到漢堡王！').end();
  webClient.chat.postMessage('@hsuan', JSON.stringify(req.body));
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
