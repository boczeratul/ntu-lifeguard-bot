import { Constants } from './index';

const parseCommand = (input) => {
  const commandRegex = /^(\d*-?\d+)\s(\S+)\s?(.*)$/g;

  if (!input) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  const result = commandRegex.exec(input.trim());
  if (!result) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  const [,, command] = result;

  if (!command) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  return Promise.resolve({ command, input });
};

export default parseCommand;
