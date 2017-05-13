import * as LifeguardTraining from './LifeguardTraining';
import { Constants } from '../lib';

const commands = {};

Object.keys(LifeguardTraining)
  .forEach((commandKey) => {
    const command = LifeguardTraining[commandKey];
    commands[command.command] = command;
  });

const executeCommand = ({ command, input }) => {
  if (!commands[command]) {
    return Promise.reject(new Error(Constants.INVALID_COMMAND));
  }

  return commands[command].execute(input);
};

const helpOptions = {
  attachments: Object.keys(commands).map(commandKey => ({
    color: 'warning',
    pretext: commands[commandKey].description,
    fields: [
      {
        title: '格式',
        value: commands[commandKey].format,
        short: false,
      },
      {
        title: '範例',
        value: commands[commandKey].example,
        short: false,
      },
    ],
  })),
};

export {
  executeCommand,
  helpOptions,
};
