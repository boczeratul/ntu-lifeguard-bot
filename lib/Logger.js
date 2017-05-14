import { createLogger, Level } from '@17media/node-logger';
import EnvConfig from '../env.config.json';
import project from '../package.json';

const loggerConfig = {
  base: {
    logLevel: Level.INFO,
    project: project.name,
    environment: process.env.NODE_ENV || 'development',
  },
  Slack: {
    slackToken: EnvConfig.Slack.BOT_TOKEN,
    slackChannel: '@hsuan',
  },
  Console: true,
};

export default createLogger(loggerConfig);
